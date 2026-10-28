import * as XLSX from 'xlsx';
import { Modalite, StatutSeance, Matiere } from '@/types';
import { format, parse, isValid } from 'date-fns';

export interface ParsedSeanceRow {
  tempId: string;
  jourNom: string; // Lundi, Mardi...
  date: string; // YYYY-MM-DD
  debut: string; // HH:mm
  fin: string; // HH:mm
  matiereIntitule: string;
  matiereId?: string;
  intervenant?: string;
  modalite: Modalite;
  salle?: string;
  lien?: string;
  note?: string;
  statut: StatutSeance;
  sourceRef?: string;
  avertissements: string[];
}

export interface ParseResult {
  nomFichier: string;
  formatDetecte: 'grille_esp' | 'tableau_saisie' | 'csv' | 'inconnu';
  semaineLundi: string; // YYYY-MM-DD
  ongletNom?: string;
  seances: ParsedSeanceRow[];
  avertissementsGlobaux: string[];
}

const ESP_HORAIRE_REGEX = /(\d{1,2})h(\d{2})\s*[–-]\s*(\d{1,2})h(\d{2})/i;
const DATE_IN_NAME_REGEX = /(\d{1,2})\s*au\s*(\d{1,2})\s*([a-zéû]+)\s*(\d{4})/i;

const MOIS_FR: Record<string, string> = {
  'janvier': '01', 'janv': '01', 'jan': '01',
  'février': '02', 'fevrier': '02', 'févr': '02', 'fevr': '02', 'fev': '02',
  'mars': '03', 'mar': '03',
  'avril': '04', 'avr': '04',
  'mai': '05',
  'juin': '06',
  'juillet': '07', 'juil': '07',
  'août': '08', 'aout': '08',
  'septembre': '09', 'sept': '09', 'sep': '09',
  'octobre': '10', 'oct': '10',
  'novembre': '11', 'nov': '11',
  'décembre': '12', 'decembre': '12', 'déc': '12', 'dec': '12'
};

const JOURS_SEMAINE_MAP: Record<string, number> = {
  'lundi': 0, 'lun': 0,
  'mardi': 1, 'mar': 1,
  'mercredi': 2, 'mer': 2,
  'jeudi': 3, 'jeu': 3,
  'vendredi': 4, 'ven': 4,
  'samedi': 5, 'sam': 5,
  'dimanche': 6, 'dim': 6,
};

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Tries to extract week Monday date from text like "EdT_du_26_au_31_oct_2026" or "26 au 31 octobre 2026"
 */
export function extractWeekMondayFromText(text: string): string | null {
  const clean = text.replace(/_/g, ' ');
  const match = clean.match(DATE_IN_NAME_REGEX);
  if (match) {
    const dayStr = match[1].padStart(2, '0');
    const monthRaw = normalizeString(match[3]);
    const yearStr = match[4];
    const monthNum = MOIS_FR[monthRaw] || '10';
    const constructed = `${yearStr}-${monthNum}-${dayStr}`;
    return constructed;
  }
  return null;
}

/**
 * Finds matching matiere by normalized title or alias
 */
export function matchMatiere(intitule: string, existingMatieres: Matiere[]): Matiere | undefined {
  if (!intitule || intitule.toLowerCase().includes('à renseigner') || intitule.toLowerCase().includes('a renseigner')) {
    return undefined;
  }
  const norm = normalizeString(intitule);
  return existingMatieres.find(m => {
    if (normalizeString(m.intitule) === norm) return true;
    if (m.code && normalizeString(m.code) === norm) return true;
    return m.alias.some(a => normalizeString(a) === norm);
  });
}

/**
 * Parses an Excel or CSV file
 */
export async function parseScheduleFile(
  file: File,
  existingMatieres: Matiere[],
  defaultLundi: string
): Promise<ParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array', cellDates: true, cellFormula: false });

  // First try to detect ESP Weekly Grid sheet
  const sheetNames = workbook.SheetNames;
  let targetSheetName = sheetNames[0];
  let extractedMonday: string | null = null;

  for (const name of sheetNames) {
    const mondayFound = extractWeekMondayFromText(name);
    if (mondayFound) {
      targetSheetName = name;
      extractedMonday = mondayFound;
      break;
    }
  }

  const worksheet = workbook.Sheets[targetSheetName];
  const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

  // Check if this is the "Tableau Saisie" / CSV format
  const isTableauSaisie = detectTableauSaisie(rows);

  if (isTableauSaisie) {
    return parseTableauSaisie(rows, file.name, existingMatieres, extractedMonday || defaultLundi);
  } else {
    // Default or detected ESP Weekly Grid
    return parseEspWeeklyGrid(rows, file.name, targetSheetName, existingMatieres, extractedMonday || defaultLundi);
  }
}

function detectTableauSaisie(rows: any[][]): boolean {
  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const rowStr = rows[r].map(c => normalizeString(String(c))).join(' ');
    if (
      (rowStr.includes('jour') && rowStr.includes('debut') && rowStr.includes('fin')) ||
      (rowStr.includes('modalite') && rowStr.includes('enseignant'))
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Parser for the official ESP Dakar weekly timetable grid:
 * - 4 columns per day (LUNDI to SAMEDI)
 * - Row with MODALITE ("EN LIGNE" + url, "PRÉSENTIEL" + "SALLE : 102")
 * - Sequenced blocks of Horaire -> Matiere -> Intervenant
 */
function parseEspWeeklyGrid(
  rows: any[][],
  fileName: string,
  sheetName: string,
  existingMatieres: Matiere[],
  weekMonday: string
): ParseResult {
  const seances: ParsedSeanceRow[] = [];
  const avertissementsGlobaux: string[] = [];

  // 1. Locate Day columns
  // Search the header row containing "LUNDI", "MARDI", etc.
  let dayHeaders: { jour: string; colStart: number; dayIndex: number }[] = [];

  for (let r = 0; r < Math.min(rows.length, 15); r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const cellVal = normalizeString(String(row[c]));
      for (const [dayKey, dayIdx] of Object.entries(JOURS_SEMAINE_MAP)) {
        if (cellVal === dayKey || cellVal.startsWith(`${dayKey} `)) {
          if (!dayHeaders.some(d => d.dayIndex === dayIdx)) {
            dayHeaders.push({
              jour: cellVal.toUpperCase(),
              colStart: c,
              dayIndex: dayIdx,
            });
          }
        }
      }
    }
    if (dayHeaders.length >= 3) break; // Found main header row
  }

  // Fallback if headers were not explicitly found
  if (dayHeaders.length === 0) {
    // Assume 6 days with 4 columns each starting at column 0 or 1
    const defaultDays = ['LUNDI', 'MARDI', 'MERCREDI', 'JEUDI', 'VENDREDI', 'SAMEDI'];
    dayHeaders = defaultDays.map((d, idx) => ({
      jour: d,
      colStart: idx * 4,
      dayIndex: idx,
    }));
  }

  // Sort day headers by day index
  dayHeaders.sort((a, b) => a.dayIndex - b.dayIndex);

  // Compute actual calendar date for each day based on weekMonday
  const baseMonday = parse(weekMonday, 'yyyy-MM-dd', new Date());

  for (let i = 0; i < dayHeaders.length; i++) {
    const day = dayHeaders[i];
    const nextColStart = i < dayHeaders.length - 1 ? dayHeaders[i + 1].colStart : rows[0]?.length || 24;
    const colEnd = Math.max(day.colStart + 3, nextColStart - 1);

    const actualDate = format(new Date(baseMonday.getTime() + day.dayIndex * 86400000), 'yyyy-MM-dd');

    // Scan down rows for this day's columns
    let currentModalite: Modalite = 'presentiel';
    let currentSalleOrLien: string = '';

    for (let r = 0; r < rows.length; r++) {
      // Gather text across this day's columns
      const cellsInRow: string[] = [];
      for (let c = day.colStart; c <= colEnd; c++) {
        const val = String(rows[r]?.[c] || '').trim();
        if (val) cellsInRow.push(val);
      }
      const fullRowText = cellsInRow.join(' ');

      // Check modalite line
      if (normalizeString(fullRowText).includes('en ligne')) {
        currentModalite = 'en_ligne';
        const urlMatch = fullRowText.match(/https?:\/\/[^\s]+/i);
        if (urlMatch) currentSalleOrLien = urlMatch[0];
      } else if (normalizeString(fullRowText).includes('presentiel')) {
        currentModalite = 'presentiel';
        const salleMatch = fullRowText.match(/salle\s*[:\s]\s*([a-z0-9\s-]+)/i);
        if (salleMatch) currentSalleOrLien = salleMatch[0];
      }

      // Check pause - ignore
      if (normalizeString(fullRowText).includes('pause')) {
        continue;
      }

      // Check schedule match (e.g. 17h00 - 19h00)
      const horaireMatch = fullRowText.match(ESP_HORAIRE_REGEX);
      if (horaireMatch) {
        const hDebut = `${horaireMatch[1].padStart(2, '0')}:${horaireMatch[2]}`;
        const hFin = `${horaireMatch[3].padStart(2, '0')}:${horaireMatch[4]}`;

        // Look at the current cell or next 2 rows for Matiere and Intervenant
        let matiereFound = '';
        let intervenantFound = '';

        for (let subR = r; subR <= Math.min(rows.length - 1, r + 3); subR++) {
          for (let c = day.colStart; c <= colEnd; c++) {
            const val = String(rows[subR]?.[c] || '').trim();
            if (!val || val.match(ESP_HORAIRE_REGEX) || normalizeString(val).includes('pause')) continue;

            if (normalizeString(val).startsWith('m.') || normalizeString(val).startsWith('dr') || normalizeString(val).startsWith('pr')) {
              intervenantFound = val;
            } else if (!matiereFound && val.length > 2) {
              matiereFound = val;
            }
          }
        }

        const avertissements: string[] = [];
        let statut: StatutSeance = 'prevue';

        if (!matiereFound || normalizeString(matiereFound).includes('a renseigner') || matiereFound === 'EC 01') {
          matiereFound = matiereFound || 'À renseigner (EC 01)';
          statut = 'provisoire';
          avertissements.push('Matière ou intitulé à renseigner.');
        }

        if (!intervenantFound) {
          intervenantFound = 'À renseigner';
          avertissements.push('Intervenant non précisé.');
        }

        // Match with existing Matiere
        const matchedMat = matchMatiere(matiereFound, existingMatieres);

        // Conflict / duration check (> 4h)
        const [dHour] = hDebut.split(':').map(Number);
        const [fHour] = hFin.split(':').map(Number);
        if (fHour - dHour > 4) {
          avertissements.push('Séance d\'une durée supérieure à 4 heures.');
        }

        seances.push({
          tempId: `esp_${day.dayIndex}_${r}_${Math.random().toString(36).substring(2, 7)}`,
          jourNom: day.jour,
          date: actualDate,
          debut: hDebut,
          fin: hFin,
          matiereIntitule: matchedMat ? matchedMat.intitule : matiereFound,
          matiereId: matchedMat?.id,
          intervenant: intervenantFound,
          modalite: currentModalite,
          salle: currentModalite === 'presentiel' ? (currentSalleOrLien || 'Salle 102') : undefined,
          lien: currentModalite === 'en_ligne' ? (currentSalleOrLien || 'https://meet.google.com/xxx-xxxx-xxx') : undefined,
          statut,
          sourceRef: `${sheetName}!L${r + 1}C${day.colStart + 1}`,
          avertissements,
        });
      }
    }
  }

  // If no sessions were found via the grid parser, fallback to demo / standard session list
  if (seances.length === 0) {
    avertissementsGlobaux.push('Aucun créneau horaire détecté selon la grille ESP standard. Vérifie le format de ton fichier.');
  }

  return {
    nomFichier: fileName,
    formatDetecte: 'grille_esp',
    semaineLundi: weekMonday,
    ongletNom: sheetName,
    seances,
    avertissementsGlobaux,
  };
}

/**
 * Parser for the "Tableau Saisie" or CSV format
 */
function parseTableauSaisie(
  rows: any[][],
  fileName: string,
  existingMatieres: Matiere[],
  weekMonday: string
): ParseResult {
  const seances: ParsedSeanceRow[] = [];
  const avertissementsGlobaux: string[] = [];
  const baseMonday = parse(weekMonday, 'yyyy-MM-dd', new Date());

  // Find header index
  let headerRowIdx = -1;
  let colMap: Record<string, number> = {};

  for (let r = 0; r < Math.min(rows.length, 10); r++) {
    const row = rows[r];
    for (let c = 0; c < row.length; c++) {
      const val = normalizeString(String(row[c]));
      if (val.includes('jour')) colMap['jour'] = c;
      if (val.includes('modalite')) colMap['modalite'] = c;
      if (val.includes('debut')) colMap['debut'] = c;
      if (val.includes('fin')) colMap['fin'] = c;
      if (val.includes('constitutif') || val.includes('matiere') || val.includes('ec')) colMap['matiere'] = c;
      if (val.includes('enseignant') || val.includes('intervenant')) colMap['intervenant'] = c;
      if (val.includes('salle') || val.includes('lien')) colMap['lieu'] = c;
    }
    if (colMap['debut'] !== undefined && colMap['fin'] !== undefined) {
      headerRowIdx = r;
      break;
    }
  }

  if (headerRowIdx === -1) {
    headerRowIdx = 0;
    colMap = { jour: 0, modalite: 1, debut: 2, fin: 3, matiere: 4, intervenant: 5, lieu: 6 };
  }

  for (let r = headerRowIdx + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0 || !row[colMap['debut'] || 2]) continue;

    const jourRaw = normalizeString(String(row[colMap['jour'] || 0]));
    const modaliteRaw = normalizeString(String(row[colMap['modalite'] || 1]));
    const debutRaw = String(row[colMap['debut'] || 2]).trim();
    const finRaw = String(row[colMap['fin'] || 3]).trim();
    const matiereRaw = String(row[colMap['matiere'] || 4]).trim();
    const intervenantRaw = String(row[colMap['intervenant'] || 5] || '').trim();
    const lieuRaw = String(row[colMap['lieu'] || 6] || '').trim();

    if (!debutRaw || !finRaw) continue;

    const dayIndex = JOURS_SEMAINE_MAP[jourRaw] ?? 0;
    const actualDate = format(new Date(baseMonday.getTime() + dayIndex * 86400000), 'yyyy-MM-dd');

    const modalite: Modalite = modaliteRaw.includes('ligne') ? 'en_ligne' : 'presentiel';
    const matchedMat = matchMatiere(matiereRaw, existingMatieres);

    const avertissements: string[] = [];
    if (!matiereRaw || normalizeString(matiereRaw).includes('a renseigner')) {
      avertissements.push('Matière à renseigner.');
    }

    seances.push({
      tempId: `tsv_${r}_${Math.random().toString(36).substring(2, 7)}`,
      jourNom: jourRaw.toUpperCase() || 'LUNDI',
      date: actualDate,
      debut: debutRaw,
      fin: finRaw,
      matiereIntitule: matchedMat ? matchedMat.intitule : (matiereRaw || 'À renseigner'),
      matiereId: matchedMat?.id,
      intervenant: intervenantRaw || 'À renseigner',
      modalite,
      salle: modalite === 'presentiel' ? lieuRaw || 'Salle 102' : undefined,
      lien: modalite === 'en_ligne' ? lieuRaw || 'https://meet.google.com/xxx-xxxx-xxx' : undefined,
      statut: avertissements.length ? 'provisoire' : 'prevue',
      sourceRef: `Ligne ${r + 1}`,
      avertissements,
    });
  }

  return {
    nomFichier: fileName,
    formatDetecte: 'tableau_saisie',
    semaineLundi: weekMonday,
    seances,
    avertissementsGlobaux,
  };
}

/**
 * Generates and downloads the official Elizo Focus Excel template ("Tableau Saisie")
 */
export function downloadElizoExcelTemplate(): void {
  const wsData = [
    [
      'JOUR',
      'MODALITÉ',
      'DÉBUT',
      'FIN',
      'ÉLÉMENT CONSTITUTIF (EC)',
      'ENSEIGNANT / INTERVENANT',
      'SALLE OU LIEN DE CONNEXION',
      'OBSERVATIONS'
    ],
    ['Lundi', 'En ligne', '17:00', '19:00', 'Cybercriminalité, cyberéthique et cyberdroit', 'M. C. A. Fall', 'https://meet.google.com/xxx-xxxx-xxx', ''],
    ['Lundi', 'En ligne', '19:00', '21:00', 'Cybercriminalité, cyberéthique et cyberdroit', 'M. C. A. Fall', 'https://meet.google.com/xxx-xxxx-xxx', ''],
    ['Mardi', 'En ligne', '17:00', '19:00', 'Gouvernance et politique de sécurité', 'M. Lam', 'https://meet.google.com/xxx-xxxx-xxx', ''],
    ['Mardi', 'En ligne', '19:00', '21:00', 'Gouvernance et politique de sécurité', 'M. Lam', 'https://meet.google.com/xxx-xxxx-xxx', ''],
    ['Mercredi', 'Présentiel', '17:00', '19:00', 'Sécurité de l\'électronique et des architectures matérielles', 'M. Dione', 'Salle 102', ''],
    ['Mercredi', 'Présentiel', '19:00', '21:00', 'Sécurité de l\'électronique et des architectures matérielles', 'M. Dione', 'Salle 102', ''],
    ['Jeudi', 'En ligne', '17:00', '19:00', 'Préparation à la certification professionnelle', 'M. Diop', 'https://meet.google.com/xxx-xxxx-xxx', ''],
    ['Jeudi', 'En ligne', '19:00', '21:00', 'Cybercriminalité, cyberéthique et cyberdroit', 'M. C. A. Fall', 'https://meet.google.com/xxx-xxxx-xxx', ''],
    ['Vendredi', 'En ligne', '17:00', '19:00', 'Gestion des risques (PCA, PRA)', 'M. Gueye', 'https://meet.google.com/xxx-xxxx-xxx', ''],
    ['Vendredi', 'En ligne', '19:00', '21:00', 'Gestion des risques (PCA, PRA)', 'M. Gueye', 'https://meet.google.com/xxx-xxxx-xxx', ''],
    ['Samedi', 'Présentiel', '08:00', '10:00', 'Robustesse et sécurité de l\'IA et du big data', 'M. Faye', 'Salle 102', ''],
    ['Samedi', 'Présentiel', '10:00', '12:00', 'Robustesse et sécurité de l\'IA et du big data', 'M. Faye', 'Salle 102', ''],
    ['Samedi', 'Présentiel', '13:00', '15:00', 'Robustesse et sécurité de l\'IA et du big data', 'M. Faye', 'Salle 102', 'Pause 12h00 - 13h00'],
    ['Samedi', 'Présentiel', '15:00', '17:00', 'Robustesse et sécurité de l\'IA et du big data', 'M. Faye', 'Salle 102', '']
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // Set column widths
  ws['!cols'] = [
    { wch: 12 }, // Jour
    { wch: 14 }, // Modalité
    { wch: 10 }, // Début
    { wch: 10 }, // Fin
    { wch: 45 }, // Matière
    { wch: 25 }, // Intervenant
    { wch: 35 }, // Salle / Lien
    { wch: 25 }  // Obs
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Saisie');
  XLSX.writeFile(wb, 'modele_emploi_du_temps_elizo.xlsx');
}
