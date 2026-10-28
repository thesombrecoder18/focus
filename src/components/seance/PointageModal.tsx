import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Button } from '../ui/Button';
import { FR } from '@/i18n/fr';
import { Seance, StatutPresence } from '@/types';
import { useData } from '@/context/DataContext';
import { hasSessionStarted } from '@/lib/date';
import { Check, X, Clock, HelpCircle, AlertCircle } from 'lucide-react';

interface PointageModalProps {
  isOpen: boolean;
  onClose: () => void;
  seance: Seance | null;
}

export const PointageModal: React.FC<PointageModalProps> = ({ isOpen, onClose, seance }) => {
  const { setPresence, getPresenceForSeance } = useData();
  const currentPresence = seance ? getPresenceForSeance(seance.id) : undefined;

  const [selectedStatut, setSelectedStatut] = useState<StatutPresence>(
    currentPresence?.statut || 'present'
  );
  const [minutesRetard, setMinutesRetard] = useState<number>(
    currentPresence?.minutesRetard || 15
  );
  const [note, setNote] = useState<string>(currentPresence?.note || '');
  const [error, setError] = useState<string>('');

  if (!seance) return null;

  const canPoint = hasSessionStarted(seance.date, seance.debut);

  const handleSave = async (statutToSave?: StatutPresence) => {
    const finalStatut = statutToSave || selectedStatut;
    if (!canPoint) {
      setError(FR.presence.impossibleFutur);
      return;
    }

    try {
      await setPresence(
        seance.id,
        finalStatut,
        finalStatut === 'retard' ? minutesRetard : undefined,
        finalStatut === 'excuse' ? note : undefined
      );
      onClose();
    } catch (e) {
      console.error(e);
      setError(FR.errors.generique);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={FR.presence.titre}>
      <div className="space-y-4">
        {/* Session Recap */}
        <div className="p-3.5 rounded-btn bg-[#F7F8FA] dark:bg-[#0E1014] border border-[#E5E7EB] dark:border-[#262B35]">
          <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
            {seance.debut} – {seance.fin} · {seance.date}
          </p>
          <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] mt-0.5 line-clamp-2">
            {seance.intituleRecu}
          </h4>
          {seance.intervenant && (
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
              {seance.intervenant}
            </p>
          )}
        </div>

        {!canPoint && (
          <div className="flex items-start p-3 rounded-btn bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{FR.presence.impossibleFutur}</span>
          </div>
        )}

        {error && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
        )}

        {/* Presence Buttons (1-tap quick action) */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
            {FR.presence.question}
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={!canPoint}
              onClick={() => {
                setSelectedStatut('present');
                handleSave('present');
              }}
              className={`flex items-center justify-center p-3.5 rounded-btn text-sm font-semibold transition-all border ${
                selectedStatut === 'present'
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50 hover:bg-emerald-100'
              } disabled:opacity-50`}
            >
              <Check className="w-4 h-4 mr-2" />
              {FR.presence.statuts.present}
            </button>

            <button
              type="button"
              disabled={!canPoint}
              onClick={() => {
                setSelectedStatut('absent');
                handleSave('absent');
              }}
              className={`flex items-center justify-center p-3.5 rounded-btn text-sm font-semibold transition-all border ${
                selectedStatut === 'absent'
                  ? 'bg-red-600 text-white border-red-600 shadow-sm'
                  : 'bg-red-50 dark:bg-red-950/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900/50 hover:bg-red-100'
              } disabled:opacity-50`}
            >
              <X className="w-4 h-4 mr-2" />
              {FR.presence.statuts.absent}
            </button>

            <button
              type="button"
              disabled={!canPoint}
              onClick={() => setSelectedStatut('retard')}
              className={`flex items-center justify-center p-3.5 rounded-btn text-sm font-semibold transition-all border ${
                selectedStatut === 'retard'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50 hover:bg-amber-100'
              } disabled:opacity-50`}
            >
              <Clock className="w-4 h-4 mr-2" />
              {FR.presence.statuts.retard}
            </button>

            <button
              type="button"
              disabled={!canPoint}
              onClick={() => setSelectedStatut('excuse')}
              className={`flex items-center justify-center p-3.5 rounded-btn text-sm font-semibold transition-all border ${
                selectedStatut === 'excuse'
                  ? 'bg-slate-600 text-white border-slate-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
              } disabled:opacity-50`}
            >
              <HelpCircle className="w-4 h-4 mr-2" />
              {FR.presence.statuts.excuse}
            </button>
          </div>
        </div>

        {/* Retard specific fields */}
        {selectedStatut === 'retard' && (
          <div className="p-3 rounded-btn bg-[#F7F8FA] dark:bg-[#0E1014] border border-[#E5E7EB] dark:border-[#262B35] space-y-2">
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
              {FR.presence.retardMinutes}
            </label>
            <div className="flex items-center space-x-2">
              {[5, 10, 15, 20, 30].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMinutesRetard(m)}
                  className={`px-3 py-1.5 rounded-btn text-xs font-medium border ${
                    minutesRetard === m
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]'
                  }`}
                >
                  +{m} min
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Excusé specific fields */}
        {selectedStatut === 'excuse' && (
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF]">
              {FR.presence.motifExcuse}
            </label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Ex. Raison médicale, contrainte professionnelle..."
              className="w-full h-11 px-3.5 rounded-btn bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
        )}

        <div className="pt-2 flex space-x-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            onClick={onClose}
          >
            {FR.actions.annuler}
          </Button>
          <Button
            type="button"
            fullWidth
            disabled={!canPoint}
            onClick={() => handleSave()}
          >
            {FR.actions.valider}
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
