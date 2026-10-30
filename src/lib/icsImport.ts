import { ParseResult, ParsedSeanceRow, matchMatiere } from './excel';
import { Matiere } from '@/types';

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
