import React, { useState } from 'react';
import { Seance } from '@/types';
import { SeanceCard } from '@/components/seance/SeanceCard';
import { useData } from '@/context/DataContext';
import { getDaysOfWeek, formatCapitalizedDateFr, getTodayDateString } from '@/lib/date';
import { ChevronDown, ChevronUp, Sun } from 'lucide-react';
import { clsx } from 'clsx';
import { EmptyState } from '@/components/ui/EmptyState';
import { FR } from '@/i18n/fr';

interface ListeViewProps {
  lundiDate: string;
  seances: Seance[];
  onOpenImport: () => void;
}

export const ListeView: React.FC<ListeViewProps> = ({
  lundiDate,
  seances,
  onOpenImport,
}) => {
  const { getPresenceForSeance } = useData();
  const days = getDaysOfWeek(lundiDate);
  const todayStr = getTodayDateString();

  // Accordion state: by default, today or first day with sessions is open
  const [openDays, setOpenDays] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    days.forEach(d => {
      const hasSessions = seances.some(s => s.date === d.date);
      // Open if today or if it has sessions
      initial[d.date] = d.date === todayStr || hasSessions;
    });
    return initial;
  });

  const toggleDay = (date: string) => {
    setOpenDays(prev => ({
      ...prev,
      [date]: !prev[date],
    }));
  };

  return (
    <div className="space-y-3">
      {days.map(d => {
        const daySeances = seances.filter(s => s.date === d.date);
        const isOpen = !!openDays[d.date];
        const isToday = d.date === todayStr;

        return (
          <div
            key={d.date}
            className={clsx(
              "rounded-card border transition-all duration-150 overflow-hidden bg-white dark:bg-[#161A21]",
              isToday
                ? "border-indigo-400 dark:border-indigo-500/50 shadow-xs"
                : "border-[#E5E7EB] dark:border-[#262B35]"
            )}
          >
            {/* Day Header Trigger */}
            <button
              type="button"
              onClick={() => toggleDay(d.date)}
              className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left hover:bg-black/2 dark:hover:bg-white/2 transition-colors"
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono",
                    isToday
                      ? "bg-[#4F46E5] text-white"
                      : "bg-[#F7F8FA] dark:bg-[#0E1014] text-[#111827] dark:text-[#F3F4F6] border border-[#E5E7EB] dark:border-[#262B35]"
                  )}
                >
                  {d.shortName}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] capitalize">
                    {formatCapitalizedDateFr(d.date, 'EEEE d MMMM')}
                  </h3>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    {daySeances.length > 0
                      ? `${daySeances.length} séance${daySeances.length > 1 ? 's' : ''}`
                      : 'Aucun cours'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                {isToday && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    Aujourd'hui
                  </span>
                )}
                <div className="text-[#6B7280] dark:text-[#9CA3AF]">
                  {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>
            </button>

            {/* Day Sessions List */}
            {isOpen && (
              <div className="p-3 sm:p-4 pt-0 space-y-2.5 border-t border-[#E5E7EB]/50 dark:border-[#262B35]/50">
                {daySeances.length > 0 ? (
                  daySeances.map(s => (
                    <SeanceCard
                      key={s.id}
                      seance={s}
                      presence={getPresenceForSeance(s.id)}
                    />
                  ))
                ) : (
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] py-3 text-center italic">
                    Journée libre : aucun cours programmé.
                  </p>
                )}
              </div>
            )}
          </div>
        );
      })}

      {seances.length === 0 && (
        <EmptyState
          icon={<Sun className="w-6 h-6" />}
          description="Cette semaine n'a aucune séance enregistrée."
          actionLabel={FR.actions.importer}
          onAction={onOpenImport}
        />
      )}
    </div>
  );
};
