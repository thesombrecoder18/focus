import { 
  format, 
  parseISO, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addWeeks, 
  subWeeks, 
  isSameDay, 
  isBefore, 
  isAfter, 
  parse, 
  differenceInMinutes 
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { Seance, Examen, Evenement, Indisponibilite } from '@/types';

export const LOCALE_FR = fr;

/**
 * Returns today's date formatted as YYYY-MM-DD
 */
export function getTodayDateString(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Formats a date string or Date object in French
 */
export function formatDateFr(date: string | Date, pattern: string = 'EEEE d MMMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, pattern, { locale: fr });
}

/**
 * Capitalizes the first letter of a formatted date string
 */
export function formatCapitalizedDateFr(date: string | Date, pattern: string = 'EEEE d MMMM yyyy'): string {
  const s = formatDateFr(date, pattern);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Returns the Monday (YYYY-MM-DD) of the week containing the given date
 */
export function getMondayOfWeek(dateStr: string): string {
  const date = parseISO(dateStr);
  const monday = startOfWeek(date, { weekStartsOn: 1 });
  return format(monday, 'yyyy-MM-dd');
}

/**
 * Returns the Sunday (YYYY-MM-DD) of the week containing the given date
 */
export function getSundayOfWeek(dateStr: string): string {
  const date = parseISO(dateStr);
  const sunday = endOfWeek(date, { weekStartsOn: 1 });
  return format(sunday, 'yyyy-MM-dd');
}

/**
 * Returns all 7 days of the week starting from Monday (YYYY-MM-DD)
 */
export function getDaysOfWeek(mondayDateStr: string): { date: string; dayName: string; shortName: string; dayNumber: number }[] {
  const monday = parseISO(mondayDateStr);
  return Array.from({ length: 7 }, (_, i) => {
    const current = addDays(monday, i);
    const date = format(current, 'yyyy-MM-dd');
    const dayName = format(current, 'EEEE', { locale: fr });
    const shortName = format(current, 'EEE', { locale: fr }).slice(0, 3);
    const dayNumber = i + 1; // 1 = Lundi, 7 = Dimanche
    return { date, dayName, shortName, dayNumber };
  });
}

/**
 * Adds or subtracts weeks to a Monday date string
 */
export function shiftWeek(mondayDateStr: string, weeksCount: number): string {
  const monday = parseISO(mondayDateStr);
  const target = weeksCount > 0 ? addWeeks(monday, weeksCount) : subWeeks(monday, Math.abs(weeksCount));
  return format(target, 'yyyy-MM-dd');
}

/**
 * Checks if a session has already started or is in the past
 */
export function hasSessionStarted(dateStr: string, debutStr: string): boolean {
  const now = new Date();
  const sessionStart = parse(`${dateStr} ${debutStr}`, 'yyyy-MM-dd HH:mm', new Date());
  return isBefore(sessionStart, now) || sessionStart.getTime() === now.getTime();
}

/**
 * Checks if a session is currently ongoing
 */
export function isSessionOngoing(dateStr: string, debutStr: string, finStr: string): boolean {
  const now = new Date();
  const start = parse(`${dateStr} ${debutStr}`, 'yyyy-MM-dd HH:mm', new Date());
  const end = parse(`${dateStr} ${finStr}`, 'yyyy-MM-dd HH:mm', new Date());
  return isAfter(now, start) && isBefore(now, end);
}

/**
 * Returns a human-friendly countdown string
 */
export function getTimeUntil(dateStr: string, debutStr: string): string {
  const now = new Date();
  const start = parse(`${dateStr} ${debutStr}`, 'yyyy-MM-dd HH:mm', new Date());
  const diffMinutes = differenceInMinutes(start, now);

  if (diffMinutes < 0) return 'en cours';
  if (diffMinutes === 0) return 'maintenant';
  if (diffMinutes < 60) return `${diffMinutes} min`;

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  return minutes > 0 ? `${hours} h ${minutes.toString().padStart(2, '0')}` : `${hours} h`;
}

export interface CreneauLibre {
  debut: string; // HH:mm
  fin: string; // HH:mm
  dureeMinutes: number;
}

/**
 * Computes free slots on a given day between booked sessions, exams, events, and recurring indisponibilities
 */
export function calculateFreeSlots(
  dateStr: string,
  seances: Seance[],
  examens: Examen[],
  evenements: Evenement[],
  indisponibilites: Indisponibilite[],
  windowStart: string = '08:00',
  windowEnd: string = '22:00'
): CreneauLibre[] {
  const dayOfWeekNumber = parseISO(dateStr).getDay() === 0 ? 7 : parseISO(dateStr).getDay();

  // Convert HH:mm to minutes from midnight
  const toMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  const toTimeString = (minutes: number) => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const minLimit = toMinutes(windowStart);
  const maxLimit = toMinutes(windowEnd);

  // Collect all occupied intervals
  const busyIntervals: { start: number; end: number }[] = [];

  // 1. Cours for this day (excluding cancelled)
  seances
    .filter(s => s.date === dateStr && s.statut !== 'annulee' && s.statut !== 'non_tenue')
    .forEach(s => {
      busyIntervals.push({
        start: Math.max(minLimit, toMinutes(s.debut)),
        end: Math.min(maxLimit, toMinutes(s.fin)),
      });
    });

  // 2. Examens for this day
  examens
    .filter(e => e.date === dateStr)
    .forEach(e => {
      const start = toMinutes(e.heure);
      const end = start + e.dureeMin;
      busyIntervals.push({
        start: Math.max(minLimit, start),
        end: Math.min(maxLimit, end),
      });
    });

  // 3. Evenements for this day
  evenements
    .filter(ev => ev.debut.startsWith(dateStr))
    .forEach(ev => {
      if (ev.journeeEntiere) {
        busyIntervals.push({ start: minLimit, end: maxLimit });
      } else {
        const startH = ev.debut.includes('T') ? ev.debut.split('T')[1].slice(0, 5) : windowStart;
        const endH = ev.fin.includes('T') ? ev.fin.split('T')[1].slice(0, 5) : windowEnd;
        busyIntervals.push({
          start: Math.max(minLimit, toMinutes(startH)),
          end: Math.min(maxLimit, toMinutes(endH)),
        });
      }
    });

  // 4. Recurring indisponibilités for this day of week
  indisponibilites
    .filter(ind => ind.jour === dayOfWeekNumber)
    .forEach(ind => {
      busyIntervals.push({
        start: Math.max(minLimit, toMinutes(ind.debut)),
        end: Math.min(maxLimit, toMinutes(ind.fin)),
      });
    });

  // Sort and merge intervals
  busyIntervals.sort((a, b) => a.start - b.start);
  const merged: { start: number; end: number }[] = [];
  for (const interval of busyIntervals) {
    if (!merged.length) {
      merged.push(interval);
    } else {
      const last = merged[merged.length - 1];
      if (interval.start <= last.end) {
        last.end = Math.max(last.end, interval.end);
      } else {
        merged.push(interval);
      }
    }
  }

  // Find gaps
  const freeSlots: CreneauLibre[] = [];
  let current = minLimit;

  for (const busy of merged) {
    if (busy.start > current) {
      const gap = busy.start - current;
      if (gap >= 30) { // Keep gaps of at least 30 minutes
        freeSlots.push({
          debut: toTimeString(current),
          fin: toTimeString(busy.start),
          dureeMinutes: gap,
        });
      }
    }
    current = Math.max(current, busy.end);
  }

  if (maxLimit > current && maxLimit - current >= 30) {
    freeSlots.push({
      debut: toTimeString(current),
      fin: toTimeString(maxLimit),
      dureeMinutes: maxLimit - current,
    });
  }

  return freeSlots;
}
