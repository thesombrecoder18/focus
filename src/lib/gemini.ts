import { ParseResult, ParsedSeanceRow, matchMatiere } from './excel';
import { Matiere } from '@/types';
import { format, parse, addDays } from 'date-fns';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function parseWithGeminiOrFallback(
  input: { text?: string; fileBase64?: string; mimeType?: string; fileName?: string },
  existingMatieres: Matiere[],
  defaultLundi: string
): Promise<ParseResult> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || localStorage.getItem('elizo_gemini_api_key') || '';

  if (apiKey) {
    try {
      const result = await callGeminiApi(input, apiKey, existingMatieres, defaultLundi);
      if (result && result.seances.length > 0) {
        return result;
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, falling back to local extractor', err);
    }
  }

  // Fallback to local heuristic extractor (for pasted text, ICS, or standard text files)
  return fallbackLocalTextParser(input.text || '', input.fileName || 'texte_colle.txt', existingMatieres, defaultLundi);
}

async function callGeminiApi(
  input: { text?: string; fileBase64?: string; mimeType?: string; fileName?: string },
  apiKey: string,
  existingMatieres: Matiere[],
  defaultLundi: string
): Promise<ParseResult> {
  const matieresListStr = existingMatieres.map(m => `- ${m.intitule} (alias: ${m.alias.join(', ')})`).join('\n');

  const prompt = `Tu es l'assistant d'import d'emploi du temps de l'application Elizo Focus pour un étudiant en Master 2 Sécurité des Systèmes d'Information (cours du soir, ESP Dakar).
Extrais toutes les séances de cours du document ou du texte fourni.

La semaine de référence démarre le lundi ${defaultLundi}.
Matières existantes de l'étudiant :
${matieresListStr}

Retourne UNIQUEMENT un objet JSON valide suivant exactement ce format :
{
  "semaineLundi": "YYYY-MM-DD",
  "seances": [
    {
      "jourNom": "Lundi",
      "date": "YYYY-MM-DD",
      "debut": "17:00",
      "fin": "19:00",
      "matiereIntitule": "Intitulé exact ou le plus proche",
      "intervenant": "M. Nom ou À renseigner",
      "modalite": "en_ligne" ou "presentiel",
      "salle": "Salle 102 ou null",
      "lien": "https://meet.google.com/... ou null",
      "avertissements": []
    }
  ]
}`;

  const contents: any[] = [];
  const parts: any[] = [{ text: prompt }];

  if (input.text) {
    parts.push({ text: `CONTENU DE L'EMPLOI DU TEMPS :\n${input.text}` });
  }

  if (input.fileBase64 && input.mimeType) {
    parts.push({
      inline_data: {
        mime_type: input.mimeType,
        data: input.fileBase64,
      },
    });
  }

  contents.push({ parts });

  const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.1,
        response_mime_type: 'application/json',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API Error: ${response.statusText}`);
  }

  const jsonResponse = await response.json();
  const rawText = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Réponse vide de Gemini');

  const parsed = JSON.parse(rawText);
  const weekMonday = parsed.semaineLundi || defaultLundi;

  const seances: ParsedSeanceRow[] = (parsed.seances || []).map((s: any, idx: number) => {
    const matchedMat = matchMatiere(s.matiereIntitule, existingMatieres);
    return {
      tempId: `gemini_${idx}_${Math.random().toString(36).substring(2, 6)}`,
      jourNom: s.jourNom || 'LUNDI',
      date: s.date || weekMonday,
      debut: s.debut || '17:00',
      fin: s.fin || '19:00',
      matiereIntitule: matchedMat ? matchedMat.intitule : (s.matiereIntitule || 'À renseigner'),
      matiereId: matchedMat?.id,
      intervenant: s.intervenant || 'À renseigner',
      modalite: s.modalite === 'en_ligne' ? 'en_ligne' : 'presentiel',
      salle: s.salle || (s.modalite === 'presentiel' ? 'Salle 102' : undefined),
      lien: s.lien || (s.modalite === 'en_ligne' ? 'https://meet.google.com/xxx-xxxx-xxx' : undefined),
      statut: (s.matiereIntitule?.includes('renseigner') || !matchedMat) ? 'provisoire' : 'prevue',
      sourceRef: 'Import IA Gemini',
      avertissements: s.avertissements || [],
    };
  });

  return {
    nomFichier: input.fileName || 'Import IA',
    formatDetecte: 'grille_esp',
    semaineLundi: weekMonday,
    seances,
    avertissementsGlobaux: ['Séances extraites par l\'IA Gemini.'],
  };
}

/**
 * Intelligent local regex-based parser when Gemini API is offline or key is not provided
 */
export function fallbackLocalTextParser(
  text: string,
  fileName: string,
  existingMatieres: Matiere[],
  defaultLundi: string
): ParseResult {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const seances: ParsedSeanceRow[] = [];
  const baseMonday = parse(defaultLundi, 'yyyy-MM-dd', new Date());

  const daysKeywords = [
    { key: 'lundi', idx: 0, nom: 'LUNDI' },
    { key: 'mardi', idx: 1, nom: 'MARDI' },
    { key: 'mercredi', idx: 2, nom: 'MERCREDI' },
    { key: 'jeudi', idx: 3, nom: 'JEUDI' },
    { key: 'vendredi', idx: 4, nom: 'VENDREDI' },
    { key: 'samedi', idx: 5, nom: 'SAMEDI' },
  ];

  let currentDay = daysKeywords[0];
  const timeRegex = /(\d{1,2})[h:](\d{2})?\s*[\u2013\-à]\s*(\d{1,2})[h:](\d{2})?/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Check if line indicates day
    for (const d of daysKeywords) {
      if (lower.startsWith(d.key) || lower.includes(` ${d.key} `)) {
        currentDay = d;
      }
    }

    // Check if line has schedule
    const match = line.match(timeRegex);
    if (match) {
      const hDeb = match[1].padStart(2, '0');
      const mDeb = match[2] || '00';
      const hFin = match[3].padStart(2, '0');
      const mFin = match[4] || '00';

      const debut = `${hDeb}:${mDeb}`;
      const fin = `${hFin}:${mFin}`;

      // Extract remaining text on the same or next line as subject
      let restOfLine = line.replace(match[0], '').replace(/[:-]/g, '').trim();
      let matiereCandidate = restOfLine;
      let intervenant = 'À renseigner';

      if (!matiereCandidate && i < lines.length - 1) {
        matiereCandidate = lines[i + 1];
      }

      // Check for teacher format M. Fall / Dr. / Pr.
      const teacherMatch = (line + ' ' + (lines[i + 1] || '')).match(/(m\.|dr\.|pr\.)\s+[a-z\s]+/i);
      if (teacherMatch) {
        intervenant = teacherMatch[0].trim();
        matiereCandidate = matiereCandidate.replace(teacherMatch[0], '').trim();
      }

      const modalite = lower.includes('ligne') || lower.includes('zoom') || lower.includes('meet')
        ? 'en_ligne'
        : 'presentiel';

      const matchedMat = matchMatiere(matiereCandidate, existingMatieres);
      const actualDate = format(addDays(baseMonday, currentDay.idx), 'yyyy-MM-dd');

      seances.push({
        tempId: `txt_${i}_${Math.random().toString(36).substring(2, 6)}`,
        jourNom: currentDay.nom,
        date: actualDate,
        debut,
        fin,
        matiereIntitule: matchedMat ? matchedMat.intitule : (matiereCandidate || 'À renseigner'),
        matiereId: matchedMat?.id,
        intervenant,
        modalite,
        salle: modalite === 'presentiel' ? 'Salle 102' : undefined,
        lien: modalite === 'en_ligne' ? 'https://meet.google.com/xxx-xxxx-xxx' : undefined,
        statut: matchedMat ? 'prevue' : 'provisoire',
        sourceRef: `Texte ligne ${i + 1}`,
        avertissements: !matchedMat ? ['Matière reconnue approximativement'] : [],
      });
    }
  }

  return {
    nomFichier: fileName,
    formatDetecte: 'grille_esp',
    semaineLundi: defaultLundi,
    seances,
    avertissementsGlobaux: seances.length > 0 ? [] : ['Aucun horaire détecté dans le texte.'],
  };
}

/**
 * Basic parser for .ics file import
 */
export function parseIcsContent(
  icsText: string,
  fileName: string,
  existingMatieres: Matiere[],
  defaultLundi: string
): ParseResult {
  const seances: ParsedSeanceRow[] = [];
  const veventBlocks = icsText.split('BEGIN:VEVENT');

  for (let i = 1; i < veventBlocks.length; i++) {
    const block = veventBlocks[i];
    const summaryMatch = block.match(/SUMMARY:(.+)/i);
    const dtstartMatch = block.match(/DTSTART[^:]*:([0-9T]+)/i);
    const dtendMatch = block.match(/DTEND[^:]*:([0-9T]+)/i);
    const locationMatch = block.match(/LOCATION:(.+)/i);

    if (dtstartMatch) {
      const dtstart = dtstartMatch[1];
      const year = dtstart.slice(0, 4);
      const month = dtstart.slice(4, 6);
      const day = dtstart.slice(6, 8);
      const dateStr = `${year}-${month}-${day}`;

      let debut = '17:00';
      if (dtstart.includes('T')) {
        const timePart = dtstart.split('T')[1];
        debut = `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}`;
      }

      let fin = '19:00';
      if (dtendMatch && dtendMatch[1].includes('T')) {
        const timePart = dtendMatch[1].split('T')[1];
        fin = `${timePart.slice(0, 2)}:${timePart.slice(2, 4)}`;
      }

      const summary = summaryMatch ? summaryMatch[1].replace(/\\n/g, '').replace(/Cours\s*:\s*/i, '').trim() : 'Cours';
      const location = locationMatch ? locationMatch[1].trim() : '';

      const matchedMat = matchMatiere(summary, existingMatieres);
      const isOnline = location.includes('http') || location.toLowerCase().includes('en ligne');

      seances.push({
        tempId: `ics_${i}`,
        jourNom: 'JOUR',
        date: dateStr,
        debut,
        fin,
        matiereIntitule: matchedMat ? matchedMat.intitule : summary,
        matiereId: matchedMat?.id,
        intervenant: 'À renseigner',
        modalite: isOnline ? 'en_ligne' : 'presentiel',
        salle: isOnline ? undefined : (location || 'Salle 102'),
        lien: isOnline ? location : undefined,
        statut: 'prevue',
        sourceRef: `ICS Event ${i}`,
        avertissements: [],
      });
    }
  }

  return {
    nomFichier: fileName,
    formatDetecte: 'grille_esp',
    semaineLundi: defaultLundi,
    seances,
    avertissementsGlobaux: [],
  };
}
