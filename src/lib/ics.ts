import { Seance, Examen, Evenement, ReunionClub, SessionRevision, Matiere } from '@/types';

function formatIcsDateTime(dateStr: string, timeStr: string = '00:00'): string {
  // Dakar is UTC+0, so we can format as standard UTC format YYYYMMDDTHHMMSSZ
  const cleanDate = dateStr.replace(/-/g, '');
  const [h, m] = timeStr.split(':');
  const cleanTime = `${h.padStart(2, '0')}${m.padStart(2, '0')}00`;
  return `${cleanDate}T${cleanTime}Z`;
}

export function generateIcsContent(
  seances: Seance[],
  examens: Examen[],
  evenements: Evenement[],
  reunionsClub: ReunionClub[] = [],
  revisions: SessionRevision[] = [],
  matieres: Matiere[] = []
): string {
  const getMatiereName = (id?: string) => {
    if (!id) return '';
    return matieres.find(m => m.id === id)?.intitule || '';
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Elizo Focus//Cockpit Etudiant du Soir//FR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Elizo Focus - Emploi du temps & Calendrier',
    'X-WR-TIMEZONE:Africa/Dakar',
  ];

  const nowStamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  // 1. Cours (Séances)
  seances.forEach(s => {
    if (s.statut === 'annulee') return;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:seance_${s.id}@elizo.sn`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${formatIcsDateTime(s.date, s.debut)}`);
    lines.push(`DTEND:${formatIcsDateTime(s.date, s.fin)}`);
    lines.push(`SUMMARY:Cours : ${s.intituleRecu}`);
    
    let desc = `Intervenant : ${s.intervenant || 'Non précisé'}\\nModalité : ${s.modalite === 'en_ligne' ? 'En ligne' : 'Présentiel'}`;
    if (s.lien) desc += `\\nLien : ${s.lien}`;
    if (s.salle) desc += `\\nSalle : ${s.salle}`;
    lines.push(`DESCRIPTION:${desc}`);
    
    if (s.salle || s.lien) {
      lines.push(`LOCATION:${s.salle || s.lien}`);
    }
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  // 2. Examens
  examens.forEach(ex => {
    const [h, m] = ex.heure.split(':').map(Number);
    const endMinutes = h * 60 + m + ex.dureeMin;
    const endH = Math.floor(endMinutes / 60).toString().padStart(2, '0');
    const endM = (endMinutes % 60).toString().padStart(2, '0');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:examen_${ex.id}@elizo.sn`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${formatIcsDateTime(ex.date, ex.heure)}`);
    lines.push(`DTEND:${formatIcsDateTime(ex.date, `${endH}:${endM}`)}`);
    lines.push(`SUMMARY:EXAMEN : ${getMatiereName(ex.matiereId)} (${ex.type})`);
    lines.push(`DESCRIPTION:Évaluation de type ${ex.type} - Durée : ${ex.dureeMin} minutes`);
    if (ex.salle) lines.push(`LOCATION:${ex.salle}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  // 3. Événements personnels
  evenements.forEach(ev => {
    const isFullDay = ev.journeeEntiere;
    const startDate = ev.debut.split('T')[0];
    const startTime = ev.debut.includes('T') ? ev.debut.split('T')[1].slice(0, 5) : '08:00';
    const endDate = ev.fin.split('T')[0];
    const endTime = ev.fin.includes('T') ? ev.fin.split('T')[1].slice(0, 5) : '18:00';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:event_${ev.id}@elizo.sn`);
    lines.push(`DTSTAMP:${nowStamp}`);
    if (isFullDay) {
      lines.push(`DTSTART;VALUE=DATE:${startDate.replace(/-/g, '')}`);
    } else {
      lines.push(`DTSTART:${formatIcsDateTime(startDate, startTime)}`);
      lines.push(`DTEND:${formatIcsDateTime(endDate, endTime)}`);
    }
    lines.push(`SUMMARY:${ev.titre}`);
    if (ev.lieu) lines.push(`LOCATION:${ev.lieu}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  // 4. Réunions de clubs
  reunionsClub.forEach(r => {
    const dStr = r.date.split('T')[0];
    const tStr = r.date.includes('T') ? r.date.split('T')[1].slice(0, 5) : '17:00';
    const [h, m] = tStr.split(':').map(Number);
    const endH = (h + 1).toString().padStart(2, '0');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:club_reunion_${r.id}@elizo.sn`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${formatIcsDateTime(dStr, tStr)}`);
    lines.push(`DTEND:${formatIcsDateTime(dStr, `${endH}:${m.toString().padStart(2, '0')}`)}`);
    lines.push(`SUMMARY:Club : ${r.titre}`);
    if (r.lieu) lines.push(`LOCATION:${r.lieu}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  // 5. Sessions de révision
  revisions.forEach(rev => {
    const dStr = rev.debut.split('T')[0];
    const tStr = rev.debut.includes('T') ? rev.debut.split('T')[1].slice(0, 5) : '18:00';
    const [h, m] = tStr.split(':').map(Number);
    const endMinutes = h * 60 + m + rev.dureeMin;
    const endH = Math.floor(endMinutes / 60).toString().padStart(2, '0');
    const endM = (endMinutes % 60).toString().padStart(2, '0');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:revision_${rev.id}@elizo.sn`);
    lines.push(`DTSTAMP:${nowStamp}`);
    lines.push(`DTSTART:${formatIcsDateTime(dStr, tStr)}`);
    lines.push(`DTEND:${formatIcsDateTime(dStr, `${endH}:${endM}`)}`);
    lines.push(`SUMMARY:Révision : ${getMatiereName(rev.matiereId)}`);
    if (rev.objectif) lines.push(`DESCRIPTION:Objectif : ${rev.objectif}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcsFile(
  seances: Seance[],
  examens: Examen[],
  evenements: Evenement[],
  reunionsClub: ReunionClub[] = [],
  revisions: SessionRevision[] = [],
  matieres: Matiere[] = []
): void {
  const content = generateIcsContent(
    seances,
    examens,
    evenements,
    reunionsClub,
    revisions,
    matieres
  );
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `elizo_focus_calendrier_${new Date().toISOString().slice(0, 10)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
