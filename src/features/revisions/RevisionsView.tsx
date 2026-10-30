import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { FR } from '@/i18n/fr';
import { SessionRevision } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { RevisionFormSheet } from './RevisionFormSheet';
import { TimerMinuteur } from './TimerMinuteur';
import { formatDateFr } from '@/lib/date';
import {
  BookOpen,
  Plus,
  Timer,
  CheckCircle2,
  Circle,
  XCircle,
  Trash2,
  Pencil,
  ChevronDown,
  ChevronUp,
  Clock,
  GraduationCap,
} from 'lucide-react';

const COULEUR_REVISION = '#10B981'; // vert menthe

export const RevisionsView: React.FC = () => {
  const {
    revisions,
    matieres,
    examens,
    createRevision,
    updateRevision,
    deleteRevision,
    totalRevisionMinutesPerMatiere,
  } = useData();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [sessionEdition, setSessionEdition] = useState<SessionRevision | null>(null);
  const [sessionTimerId, setSessionTimerId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtreStatut, setFiltreStatut] = useState<SessionRevision['statut'] | 'toutes'>('toutes');
  const [confirmSupprId, setConfirmSupprId] = useState<string | null>(null);

  // Trier : prévues d'abord (les plus proches), puis faites, puis annulées
  const now = new Date().toISOString();
  const revisionsTri = [...revisions].sort((a, b) => {
    const order = { prevue: 0, faite: 1, annulee: 2 };
    if (order[a.statut] !== order[b.statut]) return order[a.statut] - order[b.statut];
    return a.debut.localeCompare(b.debut);
  });

  const revisionsFiltrees = filtreStatut === 'toutes'
    ? revisionsTri
    : revisionsTri.filter(r => r.statut === filtreStatut);

  const getMatiere = (id: string) => matieres.find(m => m.id === id);
  const getExamen = (id?: string) => id ? examens.find(e => e.id === id) : undefined;

  const marquerFaite = async (r: SessionRevision) => {
    await updateRevision(r.id, { statut: r.statut === 'faite' ? 'prevue' : 'faite' });
  };

  const handleSupprimer = async (id: string) => {
    await deleteRevision(id);
    setConfirmSupprId(null);
    if (sessionTimerId === id) setSessionTimerId(null);
  };

  // Calcul du cumul total
  const totalHeures = Object.values(totalRevisionMinutesPerMatiere).reduce((s, v) => s + v, 0);

  const statutIcon = (s: SessionRevision['statut']) => {
    if (s === 'faite') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (s === 'annulee') return <XCircle className="w-4 h-4 text-[#9CA3AF]" />;
    return <Circle className="w-4 h-4 text-indigo-400" />;
  };

  const statutBadgeVariant = (s: SessionRevision['statut']) => {
    if (s === 'faite') return 'success' as const;
    if (s === 'annulee') return 'secondary' as const;
    return 'info' as const;
  };

  return (
    <div className="space-y-5 pb-24 max-w-2xl mx-auto">
      {/* En-tête */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] dark:text-[#F3F4F6] tracking-tight">
            {FR.nav.revisions}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            {FR.revisions.sousTitre}
          </p>
        </div>
        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => { setSessionEdition(null); setIsFormOpen(true); }}
          className="flex-shrink-0 !bg-emerald-500 hover:!bg-emerald-600 dark:!bg-emerald-600 dark:hover:!bg-emerald-700 text-white border-0 focus-visible:ring-emerald-500"
        >
          {FR.actions.nouvelleRevision}
        </Button>
      </div>

      {/* Carte cumul heures par matière */}
      {Object.keys(totalRevisionMinutesPerMatiere).length > 0 && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-500" />
              <span className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6]">
                {FR.revisions.cumulHeures}
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {Math.floor(totalHeures / 60)}h{String(totalHeures % 60).padStart(2, '0')} {FR.revisions.auTotal}
            </span>
          </div>
          <div className="space-y-2">
            {Object.entries(totalRevisionMinutesPerMatiere).map(([mId, minutes]) => {
              const mat = getMatiere(mId);
              if (!mat || minutes === 0) return null;
              const heures = Math.floor(minutes / 60);
              const mins = minutes % 60;
              return (
                <div key={mId} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: mat.couleur }}
                  />
                  <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] truncate flex-1">
                    {mat.intitule}
                  </span>
                  <span className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] tabular-nums">
                    {heures > 0 ? `${heures}h` : ''}{String(mins).padStart(2, '0')}min
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Filtres statut */}
      {revisions.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 no-scrollbar">
          {(['toutes', 'prevue', 'faite', 'annulee'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFiltreStatut(f)}
              className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full border font-medium transition-all duration-150 ${
                filtreStatut === f
                  ? 'bg-emerald-500 border-emerald-500 text-white'
                  : 'border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]'
              }`}
            >
              {f === 'toutes' ? FR.revisions.filtres.toutes
                : f === 'prevue' ? FR.revisions.filtres.prevues
                : f === 'faite' ? FR.revisions.filtres.faites
                : FR.revisions.filtres.annulees}
            </button>
          ))}
        </div>
      )}

      {/* Liste sessions */}
      {revisionsFiltrees.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title={FR.revisions.aucuneTitre}
          description={FR.revisions.aucuneDescription}
          actionLabel={FR.actions.nouvelleRevision}
          onAction={() => { setSessionEdition(null); setIsFormOpen(true); }}
        />
      ) : (
        <div className="space-y-3">
          {revisionsFiltrees.map(r => {
            const mat = getMatiere(r.matiereId);
            const examen = getExamen(r.examenId);
            const examenMat = examen ? getMatiere(examen.matiereId) : undefined;
            const isExpanded = expandedId === r.id;
            const isTimer = sessionTimerId === r.id;
            const heures = Math.floor(r.dureeMin / 60);
            const mins = r.dureeMin % 60;
            const dureeLabel = heures > 0
              ? `${heures}h${String(mins).padStart(2, '0')}`
              : `${mins} min`;

            // J-x countdown si examen lié
            let compteARebours: string | null = null;
            if (examen) {
              const diffMs = new Date(`${examen.date}T${examen.heure}`).getTime() - Date.now();
              const diffJ = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              if (diffJ > 0) compteARebours = `J-${diffJ}`;
              else if (diffJ === 0) compteARebours = FR.etudes.examens.aujourdhui;
            }

            return (
              <Card
                key={r.id}
                colorBar={mat?.couleur ?? COULEUR_REVISION}
                className={`space-y-0 transition-opacity duration-200 ${r.statut === 'annulee' ? 'opacity-50' : ''}`}
              >
                {/* Ligne principale */}
                <div className="flex items-start gap-3">
                  {/* Bouton marquer faite */}
                  <button
                    onClick={() => marquerFaite(r)}
                    disabled={r.statut === 'annulee'}
                    className="flex-shrink-0 mt-0.5 transition-transform hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
                    title={r.statut === 'faite' ? FR.revisions.marquerPrevue : FR.revisions.marquerFaite}
                  >
                    {statutIcon(r.statut)}
                  </button>

                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] leading-snug line-clamp-2 ${r.statut === 'faite' ? 'line-through text-[#9CA3AF] dark:text-[#6B7280]' : ''}`}>
                          {mat?.intitule ?? '—'}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                            {formatDateFr(r.debut, 'EEE d MMM · HH:mm')}
                          </span>
                          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            {dureeLabel}
                          </span>
                        </div>
                        {examen && compteARebours && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <GraduationCap className="w-3 h-3 text-red-500 flex-shrink-0" />
                            <span className="text-[10px] text-red-500 font-medium">
                              {examenMat?.intitule ?? ''} · {compteARebours}
                            </span>
                          </div>
                        )}
                      </div>
                      <Badge variant={statutBadgeVariant(r.statut)} size="sm">
                        {FR.revisions.statuts[r.statut]}
                      </Badge>
                    </div>

                    {/* Objectif résumé */}
                    {r.objectif && !isExpanded && (
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 line-clamp-1 italic">
                        {r.objectif}
                      </p>
                    )}
                  </div>

                  {/* Bouton expand */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : r.id)}
                    className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-[#9CA3AF] hover:text-[#6B7280] dark:hover:text-[#D1D5DB] transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Zone étendue */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-[#E5E7EB] dark:border-[#262B35] space-y-3">
                    {/* Objectif complet */}
                    {r.objectif && (
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] italic leading-relaxed">
                        {r.objectif}
                      </p>
                    )}

                    {/* Minuteur */}
                    {isTimer ? (
                      <div className="rounded-[var(--elizo-radius-card)] bg-[#F7F8FA] dark:bg-[#0E1014] p-4">
                        <TimerMinuteur
                          dureeMin={r.dureeMin}
                          onFini={() => updateRevision(r.id, { statut: 'faite' })}
                        />
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        icon={<Timer className="w-3.5 h-3.5" />}
                        onClick={() => setSessionTimerId(r.id)}
                        disabled={r.statut === 'annulee'}
                        className="border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      >
                        {FR.revisions.demarrerMinuteur}
                      </Button>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSessionEdition(r); setIsFormOpen(true); }}
                        className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF] hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        {FR.actions.modifier}
                      </button>
                      <span className="text-[#E5E7EB] dark:text-[#262B35]">·</span>
                      <button
                        onClick={() => setConfirmSupprId(r.id)}
                        className="flex items-center gap-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF] hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {FR.actions.supprimer}
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Formulaire */}
      <RevisionFormSheet
        isOpen={isFormOpen}
        onClose={() => { setIsFormOpen(false); setSessionEdition(null); }}
        session={sessionEdition}
      />

      {/* Confirmation suppression */}
      <BottomSheet
        isOpen={!!confirmSupprId}
        onClose={() => setConfirmSupprId(null)}
        title={FR.revisions.confirmerSuppressionTitre}
      >
        <div className="space-y-4 pt-2 pb-4">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            {FR.revisions.confirmerSuppressionMessage}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setConfirmSupprId(null)}>
              {FR.actions.annuler}
            </Button>
            <Button variant="danger" fullWidth onClick={() => confirmSupprId && handleSupprimer(confirmSupprId)}>
              {FR.actions.supprimer}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
