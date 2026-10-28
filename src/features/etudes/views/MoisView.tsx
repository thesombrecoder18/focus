import React, { useState } from 'react';
import { Seance } from '@/types';
import { useData } from '@/context/DataContext';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  parseISO
} from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { clsx } from 'clsx';
import { SeanceCard } from '@/components/seance/SeanceCard';

interface MoisViewProps {
  initialDate?: string;
  seances: Seance[];
}

export const MoisView: React.FC<MoisViewProps> = ({
  initialDate = '2026-10-26',
  seances,
}) => {
  const { allSeances, getPresenceForSeance } = useData();
  const [currentMonth, setCurrentMonth] = useState<Date>(parseISO(initialDate));
  const [selectedDay, setSelectedDay] = useState<Date>(parseISO(initialDate));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const selectedDayStr = format(selectedDay, 'yyyy-MM-dd');
  const daySeances = allSeances.filter(s => s.date === selectedDayStr && s.statut !== 'annulee');

  return (
    <div className="space-y-4">
      {/* Month Header */}
      <div className="flex items-center justify-between p-3 rounded-card bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35]">
        <h3 className="text-base font-bold capitalize text-[#111827] dark:text-[#F3F4F6]">
          {format(currentMonth, 'MMMM yyyy', { locale: fr })}
        </h3>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={prevMonth}
            className="p-1.5 rounded-btn hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#9CA3AF]"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-1.5 rounded-btn hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#9CA3AF]"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-card border border-[#E5E7EB] dark:border-[#262B35] bg-white dark:bg-[#161A21] overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#E5E7EB] dark:border-[#262B35] bg-[#F7F8FA] dark:bg-[#0E1014] text-center text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] py-2">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mer</span>
          <span>Jeu</span>
          <span>Ven</span>
          <span>Sam</span>
          <span>Dim</span>
        </div>

        {/* Days cells */}
        <div className="grid grid-cols-7">
          {days.map(d => {
            const dateStr = format(d, 'yyyy-MM-dd');
            const seancesCount = allSeances.filter(s => s.date === dateStr && s.statut !== 'annulee').length;
            const isSelected = isSameDay(d, selectedDay);
            const inCurrentMonth = isSameMonth(d, currentMonth);

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDay(d)}
                className={clsx(
                  "min-h-[58px] sm:min-h-[72px] p-1.5 border-b border-r border-[#E5E7EB]/50 dark:border-[#262B35]/50 flex flex-col items-center justify-between cursor-pointer transition-colors select-none",
                  !inCurrentMonth && "opacity-30 bg-gray-50/50 dark:bg-black/20",
                  isSelected
                    ? "bg-indigo-50/80 dark:bg-indigo-950/40 ring-2 ring-indigo-500 inset-0 z-10"
                    : "hover:bg-black/2 dark:hover:bg-white/2"
                )}
              >
                <span
                  className={clsx(
                    "text-xs font-semibold w-6 h-6 rounded-full flex items-center justify-center font-mono",
                    isSelected
                      ? "bg-[#4F46E5] text-white"
                      : "text-[#111827] dark:text-[#F3F4F6]"
                  )}
                >
                  {format(d, 'd')}
                </span>

                {/* Session dots or count badge */}
                {seancesCount > 0 && (
                  <div className="flex items-center space-x-1 my-0.5">
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                      {seancesCount}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
          Séances du {format(selectedDay, 'EEEE d MMMM yyyy', { locale: fr })}
        </h4>

        {daySeances.length > 0 ? (
          <div className="space-y-2">
            {daySeances.map(s => (
              <SeanceCard
                key={s.id}
                seance={s}
                presence={getPresenceForSeance(s.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] p-4 text-center border border-dashed border-[#E5E7EB] dark:border-[#262B35] rounded-card italic">
            Aucun cours pour ce jour.
          </p>
        )}
      </div>
    </div>
  );
};
