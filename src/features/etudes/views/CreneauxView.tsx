import React from 'react';
import { Seance } from '@/types';
import { SeanceCard } from '@/components/seance/SeanceCard';
import { useData } from '@/context/DataContext';
import { getDaysOfWeek, formatCapitalizedDateFr, getTodayDateString } from '@/lib/date';
import { clsx } from 'clsx';

interface CreneauxViewProps {
  lundiDate: string;
  seances: Seance[];
}

export const CreneauxView: React.FC<CreneauxViewProps> = ({
  lundiDate,
  seances,
}) => {
  const { getPresenceForSeance } = useData();
  const days = getDaysOfWeek(lundiDate);
  const todayStr = getTodayDateString();

  return (
    <div className="overflow-x-auto pb-4 no-scrollbar">
      {/* 6 or 7 day columns grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 min-w-[720px] lg:min-w-0">
        {days.slice(0, 6).map(d => {
          const daySeances = seances
            .filter(s => s.date === d.date)
            .sort((a, b) => a.debut.localeCompare(b.debut));

          const isToday = d.date === todayStr;

          // Categorize by time period: Matin (<12h), Après-midi (12h-17h), Soir (>=17h)
          const matin = daySeances.filter(s => {
            const h = parseInt(s.debut.split(':')[0], 10);
            return h < 12;
          });
          const apresMidi = daySeances.filter(s => {
            const h = parseInt(s.debut.split(':')[0], 10);
            return h >= 12 && h < 17;
          });
          const soir = daySeances.filter(s => {
            const h = parseInt(s.debut.split(':')[0], 10);
            return h >= 17;
          });

          return (
            <div
              key={d.date}
              className={clsx(
                "flex flex-col rounded-card bg-[#F7F8FA] dark:bg-[#161A21]/60 border p-2.5 transition-all",
                isToday
                  ? "border-indigo-400 dark:border-indigo-500/60 shadow-xs ring-1 ring-indigo-500/20"
                  : "border-[#E5E7EB] dark:border-[#262B35]"
              )}
            >
              {/* Day Header */}
              <div className="text-center py-2 px-1 mb-2 border-b border-[#E5E7EB] dark:border-[#262B35]">
                <p className="text-xs font-bold uppercase tracking-wider text-[#111827] dark:text-[#F3F4F6]">
                  {d.shortName}
                </p>
                <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                  {formatCapitalizedDateFr(d.date, 'd MMM')}
                </p>
              </div>

              {/* Slots Container */}
              <div className="flex-1 space-y-3">
                {/* Matin section if any */}
                {matin.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] px-1">
                      Matin
                    </span>
                    {matin.map(s => (
                      <SeanceCard
                        key={s.id}
                        seance={s}
                        presence={getPresenceForSeance(s.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Après-midi section if any */}
                {apresMidi.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] px-1">
                      Après-midi
                    </span>
                    {apresMidi.map(s => (
                      <SeanceCard
                        key={s.id}
                        seance={s}
                        presence={getPresenceForSeance(s.id)}
                      />
                    ))}
                  </div>
                )}

                {/* Soir section */}
                {soir.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] px-1">
                      Soirée (Cours du soir)
                    </span>
                    {soir.map(s => (
                      <SeanceCard
                        key={s.id}
                        seance={s}
                        presence={getPresenceForSeance(s.id)}
                      />
                    ))}
                  </div>
                )}

                {daySeances.length === 0 && (
                  <div className="h-28 flex items-center justify-center text-[11px] text-[#6B7280] dark:text-[#9CA3AF] italic text-center p-2">
                    Aucun cours
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
