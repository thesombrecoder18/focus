import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { FR } from '@/i18n/fr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { SeanceCard } from '@/components/seance/SeanceCard';
import { PointageModal } from '@/components/seance/PointageModal';
import {
  formatDateFr,
  formatCapitalizedDateFr,
  getTodayDateString,
  hasSessionStarted,
  getTimeUntil,
  calculateFreeSlots,
  getMondayOfWeek,
  shiftWeek
} from '@/lib/date';
import { Seance } from '@/types';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Clock,
  CheckCircle2,
  Calendar,
  CheckSquare,
  AlertCircle,
  ExternalLink,
  Sparkles,
  Upload,
  BookmarkCheck,
  Users
} from 'lucide-react';
import { addDays, format, parseISO, subDays } from 'date-fns';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AujourdhuiViewProps {
  onOpenImport: () => void;
  onOpenDevoir: () => void;
  onOpenEvenement: () => void;
  onOpenRevision: () => void;
}

export const AujourdhuiView: React.FC<AujourdhuiViewProps> = ({
  onOpenImport,
  onOpenDevoir,
  onOpenEvenement,
  onOpenRevision,
}) => {
  const { currentUser } = useAuth();
  const {
    allSeances,
    presences,
    devoirs,
    examens,
    evenements,
    indisponibilites,
    settings,
    clubs,
    tachesClub,
    toggleDevoirRendu,
    getPresenceForSeance,
    currentWeekMonday,
  } = useData();

  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return getTodayDateString();
  });

  const [activePointageSeance, setActivePointageSeance] = useState<Seance | null>(null);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12
      ? FR.app.greetingMorning
      : currentHour < 18
        ? FR.app.greetingAfternoon
        : FR.app.greetingEvening;

  const userFirstName = currentUser?.nom ? currentUser.nom.split(' ')[0] : 'Eli';

  const handlePrevDay = () => {
    const d = subDays(parseISO(selectedDate), 1);
    setSelectedDate(format(d, 'yyyy-MM-dd'));
  };

  const handleNextDay = () => {
    const d = addDays(parseISO(selectedDate), 1);
    setSelectedDate(format(d, 'yyyy-MM-dd'));
  };

  const handleGoToday = () => {
    setSelectedDate(getTodayDateString());
  };

  const daySeances = allSeances
    .filter(s => s.date === selectedDate && s.statut !== 'annulee')
    .sort((a, b) => a.debut.localeCompare(b.debut));

  const upcomingSeance = allSeances
    .filter(s => {
      if (s.statut === 'annulee' || s.statut === 'non_tenue') return false;
      if (s.date < getTodayDateString()) return false;
      if (s.date === getTodayDateString()) {
        const [hFin, mFin] = s.fin.split(':').map(Number);
        const now = new Date();
        const sessionEnd = new Date();
        sessionEnd.setHours(hFin, mFin, 0);
        return sessionEnd > now;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.debut.localeCompare(b.debut);
    })[0];

  const seancesAPointer = allSeances.filter(s => {
    if (s.statut === 'annulee' || s.statut === 'non_tenue') return false;
    const started = hasSessionStarted(s.date, s.debut);
    const hasPresence = presences.some(p => p.seanceId === s.id);
    return started && !hasPresence;
  });

  const windowStart = settings?.plageDisponibilite?.debut || '08:00';
  const windowEnd = settings?.plageDisponibilite?.fin || '22:00';
  const freeSlots = calculateFreeSlots(
    selectedDate,
    allSeances,
    examens,
    evenements,
    indisponibilites,
    windowStart,
    windowEnd
  );

  const upcomingDevoirs = devoirs.filter(d => d.statut !== 'rendu');

  const openClubTasks = tachesClub
    .filter(t => t.statut === 'ouverte')
    .sort((a, b) => {
      if (!a.echeance && !b.echeance) return 0;
      if (!a.echeance) return 1;
      if (!b.echeance) return -1;
      return new Date(a.echeance).getTime() - new Date(b.echeance).getTime();
    })
    .slice(0, 3);

  const nextWeekMonday = shiftWeek(currentWeekMonday, 1);
  const nextWeekHasSessions = allSeances.some(s => {
    const sMonday = getMondayOfWeek(s.date);
    return sMonday === nextWeekMonday;
  });

  const getContextualPhrase = () => {
    if (upcomingSeance) {
      const timeStr = getTimeUntil(upcomingSeance.date, upcomingSeance.debut);
      const isNow = timeStr === 'en cours' || timeStr === 'maintenant';
      return isNow
        ? `Cours en cours en ce moment : ${upcomingSeance.intituleRecu} (${upcomingSeance.modalite === 'en_ligne' ? 'en ligne' : upcomingSeance.salle || 'présentiel'}).`
        : `Prochain cours dans ${timeStr} : ${upcomingSeance.intituleRecu} (${upcomingSeance.modalite === 'en_ligne' ? 'en ligne' : upcomingSeance.salle || 'présentiel'}).`;
    }
    return FR.dashboard.journeeLibre;
  };

  const quickActions = [
    { label: '+ Devoir', icon: <CheckSquare className="w-4 h-4" />, color: "text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/30 hover:border-amber-400 dark:hover:border-amber-400", onClick: onOpenDevoir },
    { label: '+ Événement', icon: <Calendar className="w-4 h-4" />, color: "text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-900/30 hover:border-cyan-400 dark:hover:border-cyan-400", onClick: onOpenEvenement },
    { label: '+ Révision', icon: <BookmarkCheck className="w-4 h-4" />, color: "text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-400", onClick: onOpenRevision },
  ];

  return (
    <div className="space-y-6 pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111827] dark:text-[#F3F4F6] tracking-tight">
            {greeting}, {userFirstName}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-1 flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5 text-[#4F46E5] dark:text-[#818CF8] flex-shrink-0" />
            {getContextualPhrase()}
          </p>
        </div>

        {/* Date Selector Pill */}
        <div className="flex items-center self-start sm:self-auto bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] rounded-full px-3 py-1.5 shadow-sm">
          <button
            type="button"
            onClick={handlePrevDay}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#9CA3AF] transition-all duration-200"
            aria-label="Jour précédent"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleGoToday}
            className="px-3 py-1 text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] hover:underline transition-colors"
          >
            {formatCapitalizedDateFr(selectedDate, 'EEEE d MMM')}
          </button>
          <button
            type="button"
            onClick={handleNextDay}
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#9CA3AF] transition-all duration-200"
            aria-label="Jour suivant"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Banner if next week schedule is missing */}
      {!nextWeekHasSessions && (
        <Card padded={false} elevated={false} className="p-4 flex items-center space-x-3 border-[#E5E7EB] dark:border-[#262B35] bg-[#F7F8FA] dark:bg-[#0E1014]/40">
          <Upload className="w-5 h-5 text-[#4F46E5] dark:text-[#818CF8] flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] leading-tight">
              {FR.dashboard.banniereSemaineSuivante}
            </p>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
              Semaine du {formatDateFr(nextWeekMonday, 'd MMMM yyyy')}.
            </p>
          </div>
          <Button size="sm" onClick={onOpenImport} className="flex-shrink-0">
            {FR.dashboard.banniereImporterAction}
          </Button>
        </Card>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        {quickActions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={action.onClick}
            className={twMerge(
              clsx(
                "flex items-center justify-center gap-2 py-3 px-2 rounded-xl bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] shadow-sm text-[#111827] dark:text-[#F3F4F6] transition-all duration-150 ease-in-out active:scale-95 min-h-[48px]",
                action.color
              )
            )}
          >
            {action.icon}
            <span className="text-[11px] font-semibold leading-tight">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Ordered sections for mobile 1 column */}
      <div className="space-y-6">
        {/* 1. Prochain cours Card */}
        {upcomingSeance && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-[#4F46E5] dark:text-[#818CF8]" />
                {FR.dashboard.prochainCours}
              </h2>
              <span className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8]">
                {getTimeUntil(upcomingSeance.date, upcomingSeance.debut)}
              </span>
            </div>
            <SeanceCard
              seance={upcomingSeance}
              presence={getPresenceForSeance(upcomingSeance.id)}
              showDate={upcomingSeance.date !== selectedDate}
            />
          </div>
        )}

        {/* 2. À pointer Card */}
        {seancesAPointer.length > 0 && (
          <Card colorBar="#4F46E5" className="border-transparent shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-4 h-4 text-[#4F46E5] dark:text-[#818CF8] mr-2" />
                <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6]">
                  {FR.dashboard.aPointer} ({seancesAPointer.length})
                </h3>
              </div>
              <span className="text-xs font-semibold text-[#4F46E5] dark:text-[#818CF8]">
                À régulariser
              </span>
            </div>

            <div className="space-y-2">
              {seancesAPointer.slice(0, 3).map(s => (
                <div
                  key={s.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] shadow-xs transition-all duration-200 hover:border-[#4F46E5]/40"
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold text-[#111827] dark:text-[#F3F4F6] truncate">
                      {s.intituleRecu}
                    </p>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                      {s.date} · {s.debut}–{s.fin}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActivePointageSeance(s)}
                    className="flex-shrink-0 px-3"
                  >
                    Pointer
                  </Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 3. Ma journée (Chronologie des cours et événements) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
              {FR.dashboard.maJournee} ({formatCapitalizedDateFr(selectedDate, 'EEEE d MMM')})
            </h2>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {daySeances.length} cours
            </span>
          </div>

          {daySeances.length > 0 ? (
            <div className="space-y-2.5">
              {daySeances.map(s => (
                <SeanceCard
                  key={s.id}
                  seance={s}
                  presence={getPresenceForSeance(s.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Sun className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF]" />}
              title="Aucun cours aujourd'hui"
              description={FR.dashboard.aucuneSeanceJour}
              actionLabel={FR.actions.importer}
              onAction={onOpenImport}
            />
          )}
        </div>

        {/* 4. À rendre bientôt (Devoirs) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] flex items-center">
              <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
              {FR.dashboard.aRendreBientot}
            </h2>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {upcomingDevoirs.length} à faire
            </span>
          </div>

          {upcomingDevoirs.length > 0 ? (
            <div className="space-y-2">
              {upcomingDevoirs.map(d => (
                <div
                  key={d.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] shadow-sm transition-all duration-200 hover:border-[#4F46E5]/40"
                >
                  <div className="flex items-start space-x-3 truncate pr-2">
                    <button
                      type="button"
                      onClick={() => toggleDevoirRendu(d.id)}
                      className="mt-0.5 w-5 h-5 rounded-md border border-[#E5E7EB] dark:border-[#262B35] flex items-center justify-center hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all duration-200"
                    >
                      {d.statut === 'rendu' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                    </button>
                    <div className="truncate">
                      <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] truncate">
                        {d.titre}
                      </p>
                    <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                        Échéance : {formatDateFr(d.echeance.replace('T', ' '), 'd MMM yyyy à HH:mm')}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={d.priorite === 'haute' ? 'danger' : 'default'}
                    size="sm"
                    className="capitalize flex-shrink-0"
                  >
                    {d.priorite}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<CheckCircle2 className="w-8 h-8 text-emerald-500" />}
              title="Tout est à jour"
              description={FR.dashboard.aucunDevoir}
              actionLabel="+ Devoir"
              onAction={onOpenDevoir}
            />
          )}
        </div>

        {/* 5. Examens à venir */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-red-500" />
              {FR.dashboard.examensAVenir}
            </h2>
          </div>

          {examens.length > 0 ? (
            <div className="space-y-2">
              {examens.map(ex => (
                <div
                  key={ex.id}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] shadow-sm"
                >
                  <div>
                    <Badge variant="danger" size="sm" className="mb-1.5">
                      {ex.type} · {ex.dureeMin} min
                    </Badge>
                    <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6]">
                      {formatCapitalizedDateFr(ex.date, 'd MMMM yyyy')} à {ex.heure}
                    </h4>
                    {ex.salle && (
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                        Salle : {ex.salle}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                      J-{Math.max(0, Math.ceil((parseISO(ex.date).getTime() - new Date().getTime()) / 86400000))}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Calendar className="w-8 h-8 text-red-400" />}
              title="Aucun examen à venir"
              description={FR.dashboard.aucunExamen}
            />
          )}
        </div>

        {/* 6. Tâches de club */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] flex items-center">
              <Users className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
              {FR.dashboard.tachesClub}
            </h2>
            <Link
              to="/clubs"
              className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center"
            >
              {FR.dashboard.voirClubs}
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {openClubTasks.length > 0 ? (
            <div className="space-y-2">
              {openClubTasks.map(tache => {
                const club = clubs.find(c => c.id === tache.clubId);
                const isLate = tache.echeance && new Date(tache.echeance) < new Date();

                return (
                  <Link
                    key={tache.id}
                    to={`/clubs/${tache.clubId}`}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] shadow-sm transition-colors hover:bg-[#F7F8FA] dark:hover:bg-[#1B1F27]"
                  >
                    <div className="flex items-center min-w-0">
                      <span
                        className="w-2 h-2 rounded-full mr-2.5 flex-shrink-0"
                        style={{ backgroundColor: club?.couleur || '#8B5CF6' }}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] truncate">
                          {tache.titre}
                        </p>
                        <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                          {club?.nom}
                          {tache.echeance && ` · ${formatDateFr(tache.echeance, 'd MMM · HH:mm')}`}
                        </p>
                      </div>
                    </div>
                    {isLate && (
                      <Badge variant="danger" size="sm" className="flex-shrink-0 ml-2">
                        {FR.clubs.taches.enRetard}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-[#F7F8FA] dark:bg-[#0E1014]/30 border border-[#E5E7EB] dark:border-[#262B35] text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {FR.dashboard.aucuneTacheClub}
            </div>
          )}
        </div>

        {/* 7. Créneaux libres */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF] flex items-center">
              <Sun className="w-3.5 h-3.5 mr-1.5 text-emerald-500" />
              {FR.dashboard.creneauxLibres} ({windowStart} – {windowEnd})
            </h2>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              {freeSlots.length} créneau{freeSlots.length > 1 ? 'x' : ''}
            </span>
          </div>

          {freeSlots.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {freeSlots.map((slot, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-900/20 text-xs transition-all duration-200 hover:bg-emerald-100 dark:hover:bg-emerald-950/20"
                >
                  <span className="font-semibold text-emerald-900 dark:text-emerald-300">
                    {slot.debut} – {slot.fin}
                  </span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-medium">
                    {Math.floor(slot.dureeMinutes / 60)} h {slot.dureeMinutes % 60 > 0 ? `${slot.dureeMinutes % 60} min` : ''} libre
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Clock className="w-8 h-8 text-[#6B7280] dark:text-[#9CA3AF]" />}
              title="Aucun créneau libre"
              description={FR.dashboard.aucunCreneau}
            />
          )}
        </div>
      </div>

      <PointageModal
        isOpen={!!activePointageSeance}
        onClose={() => setActivePointageSeance(null)}
        seance={activePointageSeance}
      />
    </div>
  );
};
