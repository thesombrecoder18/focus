import React, { useState, useEffect } from 'react';
import { useData } from '@/context/DataContext';
import { FR } from '@/i18n/fr';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { ListeView } from './views/ListeView';
import { CreneauxView } from './views/CreneauxView';
import { HeuresView } from './views/HeuresView';
import { MoisView } from './views/MoisView';
import { MatieresTab } from './views/MatieresTab';
import { DevoirsTab } from './views/DevoirsTab';
import { ExamensTab } from './views/ExamensTab';
import { NotesTab } from './views/NotesTab';
import { SemestresModal } from './views/SemestresModal';
import { shiftWeek, formatDateFr, getSundayOfWeek } from '@/lib/date';
import {
  Calendar,
  Layers,
  Clock,
  List,
  ChevronLeft,
  ChevronRight,
  Upload,
  Copy,
  Settings,
  BookOpen,
  CheckSquare,
  GraduationCap
} from 'lucide-react';
import { clsx } from 'clsx';

type EtudesTab = 'edt' | 'matieres' | 'devoirs' | 'examens' | 'notes';
type EdtViewType = 'liste' | 'creneaux' | 'heures' | 'mois';

interface EtudesViewProps {
  onOpenImport: () => void;
}

export const EtudesView: React.FC<EtudesViewProps> = ({ onOpenImport }) => {
  const {
    activeSemestre,
    currentWeekMonday,
    setCurrentWeekMonday,
    currentSemaine,
    seancesForCurrentWeek,
    allSeances,
  } = useData();

  const [activeTab, setActiveTab] = useState<EtudesTab>('edt');
  
  const [edtView, setEdtView] = useState<EdtViewType>(() => {
    const saved = localStorage.getItem('elizo_edt_view') as EdtViewType;
    if (saved) return saved;
    return window.innerWidth >= 768 ? 'creneaux' : 'liste';
  });

  const [isSemestreModalOpen, setIsSemestreModalOpen] = useState(false);

  const handleSetEdtView = (val: EdtViewType) => {
    setEdtView(val);
    localStorage.setItem('elizo_edt_view', val);
  };

  const handlePrevWeek = () => {
    setCurrentWeekMonday(shiftWeek(currentWeekMonday, -1));
  };

  const handleNextWeek = () => {
    setCurrentWeekMonday(shiftWeek(currentWeekMonday, 1));
  };

  const weekStatut = currentSemaine?.statut || (seancesForCurrentWeek.length > 0 ? 'validee' : 'vide');
  const sundayDate = getSundayOfWeek(currentWeekMonday);

  return (
    <div className="space-y-5 pb-24">
      {/* Top Semester Bar */}
      <Card padded={false} className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center space-x-3 truncate pr-2 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/20 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center font-bold text-sm shadow-sm flex-shrink-0">
            {activeSemestre?.nom?.split(' ').map(w => w[0]).join('') || 'S3'}
          </div>
          <div className="truncate">
            <h2 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] truncate leading-tight">
              {activeSemestre ? activeSemestre.nom : "M2 – Semestre 3"}
            </h2>
            <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
              {activeSemestre ? activeSemestre.niveauFiliere : "ESP Dakar"}
            </p>
          </div>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => setIsSemestreModalOpen(true)}
          className="flex-shrink-0 text-xs px-3 py-1.5"
        >
          {FR.etudes.gererSemestres}
        </Button>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex border-b border-[#E5E7EB] dark:border-[#262B35] overflow-x-auto no-scrollbar pb-2">
        {[
          { id: 'edt' as EtudesTab, label: FR.etudes.onglets.edt, icon: Calendar },
          { id: 'matieres' as EtudesTab, label: FR.etudes.onglets.matieres, icon: BookOpen },
          { id: 'devoirs' as EtudesTab, label: FR.etudes.onglets.devoirs, icon: CheckSquare },
          { id: 'examens' as EtudesTab, label: FR.etudes.onglets.examens, icon: Clock },
          { id: 'notes' as EtudesTab, label: FR.etudes.onglets.notes, icon: GraduationCap },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center px-4 py-3 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap transition-all duration-200 ease-in-out select-none",
                isActive
                  ? "border-[#4F46E5] dark:border-[#818CF8] text-[#4F46E5] dark:text-[#818CF8] font-bold"
                  : "border-transparent text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6]"
              )}
            >
              <Icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'edt' && (
        <div className="space-y-5">
          {/* Week Selector Bar */}
          <Card padded={false} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3 flex-wrap">
              <button
                type="button"
                onClick={handlePrevWeek}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#9CA3AF] transition-all duration-200"
                aria-label="Semaine précédente"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span
                  title={
                    weekStatut === 'validee'
                      ? FR.etudes.semaines.validee
                      : weekStatut === 'provisoire'
                        ? FR.etudes.semaines.provisoire
                        : FR.etudes.semaines.vide
                  }
                  className={clsx(
                    "w-2.5 h-2.5 rounded-full flex-shrink-0",
                    weekStatut === 'validee' && "bg-emerald-500",
                    weekStatut === 'provisoire' && "bg-amber-500",
                    weekStatut === 'vide' && "bg-gray-300 dark:bg-gray-600"
                  )}
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] truncate">
                    Semaine du {formatDateFr(currentWeekMonday, 'd MMMM')} au {formatDateFr(sundayDate, 'd MMMM yyyy')}
                  </h3>
                  <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                    {seancesForCurrentWeek.length} séance{seancesForCurrentWeek.length > 1 ? 's' : ''} · {weekStatut}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleNextWeek}
                className="p-1.5 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-[#6B7280] dark:text-[#9CA3AF] transition-all duration-200"
                aria-label="Semaine suivante"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <Button
                size="sm"
                icon={<Upload className="w-3.5 h-3.5" />}
                onClick={onOpenImport}
              >
                {FR.actions.importer}
              </Button>
            </div>
          </Card>

          {/* View Selector */}
          <div className="flex items-center justify-between">
            <SegmentedControl<EdtViewType>
              value={edtView}
              onChange={handleSetEdtView}
              options={[
                { value: 'liste', label: FR.etudes.vues.liste, icon: <List className="w-3.5 h-3.5" /> },
                { value: 'creneaux', label: FR.etudes.vues.creneaux, icon: <Layers className="w-3.5 h-3.5" /> },
                { value: 'heures', label: FR.etudes.vues.heures, icon: <Clock className="w-3.5 h-3.5" /> },
                { value: 'mois', label: FR.etudes.vues.mois, icon: <Calendar className="w-3.5 h-3.5" /> },
              ]}
              size="sm"
            />
          </div>

          {edtView === 'liste' && (
            <ListeView
              lundiDate={currentWeekMonday}
              seances={seancesForCurrentWeek}
              onOpenImport={onOpenImport}
            />
          )}

          {edtView === 'creneaux' && (
            <CreneauxView
              lundiDate={currentWeekMonday}
              seances={seancesForCurrentWeek}
            />
          )}

          {edtView === 'heures' && (
            <HeuresView
              lundiDate={currentWeekMonday}
              seances={seancesForCurrentWeek}
            />
          )}

          {edtView === 'mois' && (
            <MoisView
              initialDate={currentWeekMonday}
              seances={allSeances}
            />
          )}
        </div>
      )}

      {activeTab === 'matieres' && <MatieresTab />}
      {activeTab === 'devoirs' && <DevoirsTab />}
      {activeTab === 'examens' && <ExamensTab />}
      {activeTab === 'notes' && <NotesTab />}

      <SemestresModal
        isOpen={isSemestreModalOpen}
        onClose={() => setIsSemestreModalOpen(false)}
      />
    </div>
  );
};
