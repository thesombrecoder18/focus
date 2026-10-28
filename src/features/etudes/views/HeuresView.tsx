import React, { useState } from 'react';
import { Seance } from '@/types';
import { useData } from '@/context/DataContext';
import { getDaysOfWeek, formatCapitalizedDateFr, getTodayDateString } from '@/lib/date';
import { clsx } from 'clsx';
import { Button } from '@/components/ui/Button';
import { PointageModal } from '@/components/seance/PointageModal';
import { EditSeanceModal } from '@/components/seance/EditSeanceModal';
import { Video, MapPin, MoreVertical } from 'lucide-react';

interface HeuresViewProps {
  lundiDate: string;
  seances: Seance[];
}

export const HeuresView: React.FC<HeuresViewProps> = ({
  lundiDate,
  seances,
}) => {
  const { getPresenceForSeance } = useData();
  const [isFullDay, setIsFullDay] = useState(false);
  const [selectedSeance, setSelectedSeance] = useState<Seance | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPointageOpen, setIsPointageOpen] = useState(false);

  const days = getDaysOfWeek(lundiDate);
  const todayStr = getTodayDateString();

  // Find all distinct hours in the week that have sessions
  const occupiedHours = new Set<number>();
  seances.forEach(s => {
    if (s.statut === 'annulee') return;
    const [hDeb] = s.debut.split(':').map(Number);
    const [hFin] = s.fin.split(':').map(Number);
    for (let h = hDeb; h <= hFin; h++) {
      occupiedHours.add(h);
    }
  });

  // Full day: 08:00 to 22:00
  const allHours = Array.from({ length: 15 }, (_, i) => i + 8); // 8 to 22

  // Compressed hours: only hours that have sessions + 1 buffer hour around them
  const compressedHours: (number | 'gap')[] = [];
  if (isFullDay) {
    allHours.forEach(h => compressedHours.push(h));
  } else {
    let lastHourIncluded = -1;
    for (const h of allHours) {
      const isOccupied = occupiedHours.has(h) || occupiedHours.has(h - 1) || occupiedHours.has(h + 1);
      if (isOccupied) {
        if (lastHourIncluded !== -1 && h > lastHourIncluded + 1) {
          compressedHours.push('gap');
        }
        compressedHours.push(h);
        lastHourIncluded = h;
      }
    }
    // If no sessions at all, default to evening hours 17 to 22
    if (compressedHours.length === 0) {
      [16, 17, 18, 19, 20, 21, 22].forEach(h => compressedHours.push(h));
    }
  }

  // Current time position indicator
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="space-y-3">
      {/* View controls */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          {isFullDay ? "Affichage 08:00 – 22:00" : "Axe compressé (heures de cours uniquement)"}
        </p>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsFullDay(!isFullDay)}
        >
          {isFullDay ? "Axe compressé" : "Journée complète"}
        </Button>
      </div>

      <div className="overflow-x-auto rounded-card border border-[#E5E7EB] dark:border-[#262B35] bg-white dark:bg-[#161A21] pb-2 no-scrollbar">
        <div className="min-w-[760px]">
          {/* Days Header */}
          <div className="grid grid-cols-7 border-b border-[#E5E7EB] dark:border-[#262B35] bg-[#F7F8FA] dark:bg-[#0E1014] text-xs font-semibold sticky top-0 z-10">
            <div className="p-3 text-center border-r border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF] w-16">
              Heure
            </div>
            {days.slice(0, 6).map(d => {
              const isToday = d.date === todayStr;
              return (
                <div
                  key={d.date}
                  className={clsx(
                    "p-2.5 text-center border-r border-[#E5E7EB] dark:border-[#262B35] last:border-none",
                    isToday && "bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold"
                  )}
                >
                  <p className="uppercase text-[11px]">{d.shortName}</p>
                  <p className="text-xs font-mono">{formatCapitalizedDateFr(d.date, 'd MMM')}</p>
                </div>
              );
            })}
          </div>

          {/* Grid Rows */}
          <div className="relative">
            {compressedHours.map((hourItem, idx) => {
              if (hourItem === 'gap') {
                return (
                  <div
                    key={`gap_${idx}`}
                    className="grid grid-cols-7 h-7 bg-[#F7F8FA]/60 dark:bg-[#0E1014]/60 border-b border-dashed border-[#E5E7EB] dark:border-[#262B35] items-center text-center text-xs text-[#9CA3AF]"
                  >
                    <div className="col-span-7 font-mono font-bold tracking-widest">
                      ⋯
                    </div>
                  </div>
                );
              }

              const hour = hourItem;
              const hourStr = `${hour.toString().padStart(2, '0')}:00`;

              return (
                <div
                  key={hour}
                  className="grid grid-cols-7 min-h-[56px] border-b border-[#E5E7EB]/70 dark:border-[#262B35]/70"
                >
                  {/* Hour label */}
                  <div className="p-2 text-center text-xs font-mono text-[#6B7280] dark:text-[#9CA3AF] border-r border-[#E5E7EB] dark:border-[#262B35] flex items-start justify-center pt-2">
                    {hourStr}
                  </div>

                  {/* 6 Day Columns */}
                  {days.slice(0, 6).map(d => {
                    const seanceAtThisHour = seances.find(s => {
                      if (s.date !== d.date) return false;
                      const [debH] = s.debut.split(':').map(Number);
                      return debH === hour;
                    });

                    return (
                      <div
                        key={d.date}
                        className="p-1 border-r border-[#E5E7EB]/50 dark:border-[#262B35]/50 last:border-none relative hover:bg-black/2 dark:hover:bg-white/2 transition-colors"
                      >
                        {seanceAtThisHour && (
                          <div
                            onClick={() => {
                              setSelectedSeance(seanceAtThisHour);
                              setIsEditOpen(true);
                            }}
                            className={clsx(
                              "h-full p-2 rounded-lg text-left text-xs cursor-pointer shadow-xs transition-transform active:scale-98 flex flex-col justify-between border",
                              seanceAtThisHour.modalite === 'en_ligne'
                                ? "bg-[#DCEFFC]/90 text-[#0B67A7] border-[#0B67A7]/30 dark:bg-[#0B67A7]/20 dark:text-[#7DD3FC]"
                                : "bg-[#F5E7D0]/90 text-[#8D662F] border-[#8D662F]/30 dark:bg-[#8D662F]/20 dark:text-[#FDE68A]",
                              seanceAtThisHour.statut === 'provisoire' && "border-dashed ring-1 ring-amber-400",
                              seanceAtThisHour.statut === 'annulee' && "line-through opacity-50"
                            )}
                          >
                            <div>
                              <div className="flex items-center justify-between font-mono font-bold text-[11px] mb-0.5">
                                <span>{seanceAtThisHour.debut}–{seanceAtThisHour.fin}</span>
                                {seanceAtThisHour.modalite === 'en_ligne' ? (
                                  <Video className="w-3 h-3" />
                                ) : (
                                  <MapPin className="w-3 h-3" />
                                )}
                              </div>
                              <p className="font-semibold line-clamp-2 leading-tight">
                                {seanceAtThisHour.intituleRecu}
                              </p>
                            </div>
                            {seanceAtThisHour.intervenant && (
                              <p className="text-[10px] opacity-80 truncate mt-1">
                                {seanceAtThisHour.intervenant}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <EditSeanceModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        seance={selectedSeance}
      />
    </div>
  );
};
