import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { FR } from '@/i18n/fr';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddEvenementModal } from '@/components/forms/AddEvenementModal';
import { SeanceCard } from '@/components/seance/SeanceCard';
import { downloadIcsFile } from '@/lib/ics';
import {
  format,
  parseISO,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  addWeeks,
  subWeeks
} from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Download,
  CheckSquare,
  Clock,
} from 'lucide-react';
import { clsx } from 'clsx';
import { getTodayDateString } from '@/lib/date';

type CalendarViewMode = 'agenda' | 'jour' | 'semaine' | 'mois';

export const CalendrierView: React.FC = () => {
  const {
    allSeances,
    devoirs,
    examens,
    evenements,
    reunionsClub,
    revisions,
    matieres,
    getPresenceForSeance
  } = useData();

  const [viewMode, setViewMode] = useState<CalendarViewMode>(() => {
    return window.innerWidth >= 768 ? 'semaine' : 'agenda';
  });

  const [currentDate, setCurrentDate] = useState<Date>(() => {
    return new Date();
  });

  const [filterCours, setFilterCours] = useState(true);
  const [filterDevoirs, setFilterDevoirs] = useState(true);
  const [filterExamens, setFilterExamens] = useState(true);
  const [filterEvenements, setFilterEvenements] = useState(true);
  const [filterClubs, setFilterClubs] = useState(true);
  const [filterRevisions, setFilterRevisions] = useState(true);

  const [isAddEventOpen, setIsAddEventOpen] = useState(false);

  const handleExportIcs = () => {
    downloadIcsFile(
      allSeances,
      examens,
      evenements,
      reunionsClub,
      revisions,
      matieres
    );
  };

  const handlePrev = () => {
    if (viewMode === 'jour') setCurrentDate(subDays(currentDate, 1));
    else if (viewMode === 'semaine') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subWeeks(currentDate, 1));
  };

  const handleNext = () => {
    if (viewMode === 'jour') setCurrentDate(addDays(currentDate, 1));
    else if (viewMode === 'semaine') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addWeeks(currentDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const getPeriodLabel = () => {
    if (viewMode === 'jour') {
      return format(currentDate, 'EEEE d MMMM yyyy', { locale: fr });
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = endOfWeek(currentDate, { weekStartsOn: 1 });
    return `${format(start, 'd MMM')} – ${format(end, 'd MMM yyyy', { locale: fr })}`;
  };

  const currentWeekDays = eachDayOfInterval({
    start: startOfWeek(currentDate, { weekStartsOn: 1 }),
    end: endOfWeek(currentDate, { weekStartsOn: 1 }),
  });

  const filterItems = [
    { key: 'cours', label: FR.calendrier.filtres.cours, color: 'indigo', checked: filterCours, onToggle: setFilterCours },
    { key: 'devoirs', label: FR.calendrier.filtres.devoirs, color: 'amber', checked: filterDevoirs, onToggle: setFilterDevoirs },
    { key: 'examens', label: FR.calendrier.filtres.examens, color: 'red', checked: filterExamens, onToggle: setFilterExamens },
    { key: 'evenements', label: FR.calendrier.filtres.evenements, color: 'cyan', checked: filterEvenements, onToggle: setFilterEvenements },
    { key: 'clubs', label: FR.calendrier.filtres.clubs, color: 'purple', checked: filterClubs, onToggle: setFilterClubs },
    { key: 'revisions', label: FR.calendrier.filtres.revisions, color: 'emerald', checked: filterRevisions, onToggle: setFilterRevisions },
  ];

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header with Period Navigation */}
      <Card padded={false} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 flex-wrap">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#9CA3AF] transition-all duration-200"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6] capitalize leading-tight">
              {getPeriodLabel()}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#9CA3AF] transition-all duration-200"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleToday}
            className="text-xs ml-1 flex-shrink-0"
          >
            Aujourd'hui
          </Button>
        </div>

        <div className="flex items-center space-x-2 self-end sm:self-auto flex-wrap gap-2">
          <SegmentedControl<CalendarViewMode>
            value={viewMode}
            onChange={setViewMode}
            options={[
              { value: 'agenda', label: FR.calendrier.vues.agenda },
              { value: 'jour', label: FR.calendrier.vues.jour },
              { value: 'semaine', label: FR.calendrier.vues.semaine },
            ]}
            size="sm"
          />

          <Button
            size="sm"
            variant="outline"
            icon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportIcs}
            title="Exporter l'agenda au format iCalendar (.ics)"
          >
            Export .ics
          </Button>

          <Button
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={() => setIsAddEventOpen(true)}
          >
            Événement
          </Button>
        </div>
      </Card>

      {/* Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto no-scrollbar py-2">
        {filterItems.map(item => (
          <button
            key={item.key}
            type="button"
            onClick={() => item.onToggle(!item.checked)}
            className={clsx(
              "flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 ease-in-out select-none flex-shrink-0",
              item.checked
                ? item.color === 'indigo' ? "bg-indigo-50 border-indigo-400 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                  : item.color === 'amber' ? "bg-amber-50 border-amber-400 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                  : item.color === 'red' ? "bg-red-50 border-red-400 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                  : item.color === 'cyan' ? "bg-cyan-50 border-cyan-400 text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300"
                  : item.color === 'purple' ? "bg-purple-50 border-purple-400 text-purple-700 dark:bg-purple-950/30 dark:text-purple-300"
                  : "bg-emerald-50 border-emerald-400 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "opacity-40 border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]"
            )}
          >
            <span className={`w-2 h-2 rounded-full ${item.color === 'indigo' ? 'bg-indigo-500' : item.color === 'amber' ? 'bg-amber-500' : item.color === 'red' ? 'bg-red-500' : item.color === 'cyan' ? 'bg-cyan-500' : item.color === 'purple' ? 'bg-purple-500' : 'bg-emerald-500'} mr-1.5`} />
            {item.label}
          </button>
        ))}
      </div>

      {/* Unified Agenda Mode */}
      {viewMode === 'agenda' && (
        <div className="space-y-4">
          {currentWeekDays.map(d => {
            const dateStr = format(d, 'yyyy-MM-dd');
            const isToday = dateStr === getTodayDateString();

            const dayCours = filterCours
              ? allSeances.filter(s => s.date === dateStr && s.statut !== 'annulee')
              : [];
            const dayDevoirs = filterDevoirs
              ? devoirs.filter(dev => dev.echeance.startsWith(dateStr))
              : [];
            const dayExamens = filterExamens
              ? examens.filter(ex => ex.date === dateStr)
              : [];
            const dayEvents = filterEvenements
              ? evenements.filter(ev => ev.debut.startsWith(dateStr))
              : [];
            const dayClubs = filterClubs
              ? reunionsClub.filter(r => r.date.startsWith(dateStr))
              : [];
            const dayRevisions = filterRevisions
              ? revisions.filter(rev => rev.debut.startsWith(dateStr))
              : [];

            const totalItems = dayCours.length + dayDevoirs.length + dayExamens.length + dayEvents.length + dayClubs.length + dayRevisions.length;

            return (
              <Card
                key={dateStr}
                className={clsx(
                  "p-4 space-y-3",
                  isToday
                    ? "border-[#4F46E5] dark:border-[#818CF8] ring-1 ring-[#4F46E5]/20 dark:ring-[#818CF8]/20"
                    : "border-[#E5E7EB] dark:border-[#262B35]"
                )}
              >
                <div className="flex items-center justify-between border-b border-[#E5E7EB]/50 dark:border-[#262B35]/50 pb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-bold capitalize text-[#111827] dark:text-[#F3F4F6]">
                      {format(d, 'EEEE d MMMM', { locale: fr })}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
                        Aujourd'hui
                      </span>
                    )}
                  </div>
                  {totalItems > 0 && (
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      {totalItems} élément{totalItems > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {totalItems > 0 ? (
                  <div className="space-y-2">
                    {dayCours.map(s => (
                      <SeanceCard
                        key={s.id}
                        seance={s}
                        presence={getPresenceForSeance(s.id)}
                      />
                    ))}
                    {dayExamens.map(ex => (
                      <div
                        key={ex.id}
                        className="p-3 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/20 flex items-center justify-between text-xs transition-all duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-red-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-bold text-red-900 dark:text-red-200 truncate">
                              Examen : {ex.type} · {ex.heure} ({ex.dureeMin} min)
                            </p>
                            {ex.salle && <p className="text-[11px] text-red-700 dark:text-red-400 truncate">Salle : {ex.salle}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                    {dayDevoirs.map(dev => (
                      <div
                        key={dev.id}
                        className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/10 border border-amber-200 dark:border-amber-900/20 flex items-center justify-between text-xs transition-all duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckSquare className="w-4 h-4 text-amber-600 flex-shrink-0" />
                          <p className="font-semibold text-amber-900 dark:text-amber-200 truncate">
                            Devoir à rendre : {dev.titre}
                          </p>
                        </div>
                        <Badge variant="warning" size="sm">
                          {dev.priorite}
                        </Badge>
                      </div>
                    ))}
                    {dayEvents.map(ev => (
                      <div
                        key={ev.id}
                        className="p-3 rounded-xl bg-cyan-50/50 dark:bg-cyan-950/10 border border-cyan-200 dark:border-cyan-900/20 flex items-center justify-between text-xs transition-all duration-200"
                      >
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-cyan-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-semibold text-cyan-900 dark:text-cyan-200 truncate">
                              {ev.titre}
                            </p>
                            {ev.lieu && <p className="text-[11px] text-cyan-700 dark:text-cyan-400 truncate">{ev.lieu}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] italic py-2 text-center">
                    Rien de prévu ce jour.
                  </p>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Jour Mode */}
      {viewMode === 'jour' && (
        <div className="space-y-3">
          {allSeances
            .filter(s => s.date === format(currentDate, 'yyyy-MM-dd') && s.statut !== 'annulee')
            .map(s => (
              <SeanceCard
                key={s.id}
                seance={s}
                presence={getPresenceForSeance(s.id)}
              />
            ))}
        </div>
      )}

      {/* Semaine Mode */}
      {viewMode === 'semaine' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {currentWeekDays.map(d => {
            const dateStr = format(d, 'yyyy-MM-dd');
            const dayCours = allSeances.filter(s => s.date === dateStr && s.statut !== 'annulee');
            const isToday = dateStr === getTodayDateString();

            return (
              <Card
                key={dateStr}
                className={clsx(
                  "p-3 min-h-[180px]",
                  isToday ? "border-[#4F46E5] dark:border-[#818CF8] ring-1 ring-[#4F46E5]/20 dark:ring-[#818CF8]/20" : ""
                )}
              >
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#111827] dark:text-[#F3F4F6]">
                    {format(d, 'EEE d', { locale: fr })}
                  </p>
                  {isToday && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
                        Aujourd'hui
                    </span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {dayCours.map(s => (
                    <div
                      key={s.id}
                      className="p-2 rounded-lg text-[11px] bg-indigo-50 dark:bg-indigo-950/20 text-indigo-900 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800/50 transition-all duration-200"
                    >
                      <p className="font-mono font-bold text-[10px]">{s.debut}</p>
                      <p className="font-semibold line-clamp-1">{s.intituleRecu}</p>
                    </div>
                  ))}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <AddEvenementModal
        isOpen={isAddEventOpen}
        onClose={() => setIsAddEventOpen(false)}
      />
    </div>
  );
};
