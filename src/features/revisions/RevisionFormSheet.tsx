import React, { useState, useEffect } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useData } from '@/context/DataContext';
import { FR } from '@/i18n/fr';
import { SessionRevision } from '@/types';

interface RevisionFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  session?: SessionRevision | null;
  defaultDate?: string; // YYYY-MM-DDTHH:mm
}

export const RevisionFormSheet: React.FC<RevisionFormSheetProps> = ({
  isOpen,
  onClose,
  session,
  defaultDate,
}) => {
  const { matieres, examens, createRevision, updateRevision } = useData();

  const [matiereId, setMatiereId] = useState('');
  const [examenId, setExamenId] = useState('');
  const [debut, setDebut] = useState(defaultDate ?? '');
  const [dureeMin, setDureeMin] = useState(60);
  const [objectif, setObjectif] = useState('');
  const [statut, setStatut] = useState<SessionRevision['statut']>('prevue');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const isEditing = !!session;

  useEffect(() => {
    if (session) {
      setMatiereId(session.matiereId);
      setExamenId(session.examenId ?? '');
      setDebut(session.debut);
      setDureeMin(session.dureeMin);
      setObjectif(session.objectif ?? '');
      setStatut(session.statut);
    } else {
      setMatiereId('');
      setExamenId('');
      setDebut(defaultDate ?? '');
      setDureeMin(60);
      setObjectif('');
      setStatut('prevue');
    }
    setErrors({});
  }, [session, isOpen, defaultDate]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!matiereId) e.matiereId = FR.errors.champObligatoire;
    if (!debut) e.debut = FR.errors.champObligatoire;
    if (!dureeMin || dureeMin < 5) e.dureeMin = FR.revisions.erreurDuree;
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      const payload = {
        matiereId,
        examenId: examenId || undefined,
        debut,
        dureeMin,
        objectif: objectif.trim() || undefined,
        statut,
      };
      if (isEditing && session) {
        await updateRevision(session.id, payload);
      } else {
        await createRevision(payload);
      }
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // Examens futurs uniquement
  const now = new Date().toISOString().slice(0, 10);
  const examensFuturs = examens.filter(ex => ex.date >= now);

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? FR.revisions.modifierSession : FR.revisions.nouvelleSession}
      maxHeight="92vh"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-3 pb-4">
        {/* Matière */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
            {FR.revisions.matiere} *
          </label>
          <select
            id="rev-matiere"
            value={matiereId}
            onChange={e => setMatiereId(e.target.value)}
            className="w-full h-11 rounded-[var(--elizo-radius-btn)] border border-[#E5E7EB] dark:border-[#262B35] bg-white dark:bg-[#161922] text-sm text-[#111827] dark:text-[#F3F4F6] px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">{FR.revisions.choisirMatiere}</option>
            {matieres.map(m => (
              <option key={m.id} value={m.id}>{m.intitule}</option>
            ))}
          </select>
          {errors.matiereId && (
            <p className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium">{errors.matiereId}</p>
          )}
        </div>

        {/* Examen lié (optionnel) */}
        {examensFuturs.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
              {FR.revisions.examenLie}
            </label>
            <select
              id="rev-examen"
              value={examenId}
              onChange={e => setExamenId(e.target.value)}
              className="w-full h-11 rounded-[var(--elizo-radius-btn)] border border-[#E5E7EB] dark:border-[#262B35] bg-white dark:bg-[#161922] text-sm text-[#111827] dark:text-[#F3F4F6] px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">{FR.revisions.aucunExamen}</option>
              {examensFuturs.map(ex => {
                const mat = matieres.find(m => m.id === ex.matiereId);
                return (
                  <option key={ex.id} value={ex.id}>
                    {mat?.intitule ?? '—'} · {ex.date} {ex.heure}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Date et heure de début */}
        <Input
          id="rev-debut"
          type="datetime-local"
          label={FR.revisions.dateDebut + ' *'}
          value={debut}
          onChange={e => setDebut(e.target.value)}
          error={errors.debut}
        />

        {/* Durée */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
            {FR.revisions.duree} *
          </label>
          <div className="flex gap-2 flex-wrap">
            {[30, 45, 60, 90, 120].map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDureeMin(d)}
                className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-150 font-medium ${
                  dureeMin === d
                    ? 'bg-emerald-500 border-emerald-500 text-white'
                    : 'border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF] hover:border-emerald-400 dark:hover:border-emerald-500'
                }`}
              >
                {d < 60 ? `${d} min` : `${d / 60} h`}
              </button>
            ))}
            <div className="flex items-center gap-1.5">
              <input
                type="number"
                min="5"
                max="480"
                value={dureeMin}
                onChange={e => setDureeMin(Number(e.target.value))}
                className="w-16 h-8 text-xs rounded-[var(--elizo-radius-btn)] border border-[#E5E7EB] dark:border-[#262B35] bg-white dark:bg-[#161922] text-center text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">min</span>
            </div>
          </div>
          {errors.dureeMin && (
            <p className="mt-1 text-[10px] text-red-600 dark:text-red-400 font-medium">{errors.dureeMin}</p>
          )}
        </div>

        {/* Objectif */}
        <div>
          <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
            {FR.revisions.objectif}
          </label>
          <textarea
            id="rev-objectif"
            value={objectif}
            onChange={e => setObjectif(e.target.value)}
            placeholder={FR.revisions.objectifPlaceholder}
            rows={2}
            className="w-full rounded-[var(--elizo-radius-btn)] border border-[#E5E7EB] dark:border-[#262B35] bg-white dark:bg-[#161922] text-sm text-[#111827] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
          />
        </div>

        {/* Statut (lors d'édition) */}
        {isEditing && (
          <div>
            <label className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5">
              {FR.revisions.statutLabel}
            </label>
            <div className="flex gap-2 flex-wrap">
              {(['prevue', 'faite', 'annulee'] as SessionRevision['statut'][]).map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatut(s)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-150 font-medium ${
                    statut === s
                      ? s === 'faite' ? 'bg-emerald-500 border-emerald-500 text-white'
                        : s === 'annulee' ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-indigo-500 border-indigo-500 text-white'
                      : 'border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]'
                  }`}
                >
                  {FR.revisions.statuts[s]}
                </button>
              ))}
            </div>
          </div>
        )}

        <Button type="submit" fullWidth loading={loading} className="mt-2">
          {isEditing ? FR.actions.enregistrer : FR.revisions.planifier}
        </Button>
      </form>
    </BottomSheet>
  );
};
