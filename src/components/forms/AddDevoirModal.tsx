import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FR } from '@/i18n/fr';
import { useData } from '@/context/DataContext';

interface AddDevoirModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddDevoirModal: React.FC<AddDevoirModalProps> = ({ isOpen, onClose }) => {
  const { matieres, createDevoir } = useData();
  const [titre, setTitre] = useState('');
  const [matiereId, setMatiereId] = useState(matieres[0]?.id || '');
  const [echeance, setEcheance] = useState('');
  const [priorite, setPriorite] = useState<'basse' | 'normale' | 'haute'>('normale');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      setError(FR.errors.champObligatoire);
      return;
    }
    if (!matiereId && matieres.length > 0) {
      setError('Veuillez sélectionner une matière');
      return;
    }

    try {
      await createDevoir({
        titre: titre.trim(),
        matiereId: matiereId || matieres[0]?.id || 'mat_default',
        echeance: echeance || new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 16),
        statut: 'a_faire',
        priorite,
        notes: notes.trim() || undefined,
      });
      // Reset form
      setTitre('');
      setNotes('');
      setError('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(FR.errors.generique);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={FR.actions.nouveauDevoir}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Titre du devoir"
          placeholder="Ex. Rapport de TP, Synthèse de cours..."
          value={titre}
          onChange={e => setTitre(e.target.value)}
          error={error}
          autoFocus
        />

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
            Matière
          </label>
          <select
            value={matiereId}
            onChange={e => setMatiereId(e.target.value)}
            className="w-full h-12 px-3.5 rounded-btn bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] text-[#111827] dark:text-[#F3F4F6] text-base focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            {matieres.map(m => (
              <option key={m.id} value={m.id}>
                {m.intitule}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Date et heure d'échéance"
          type="datetime-local"
          value={echeance}
          onChange={e => setEcheance(e.target.value)}
        />

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
            Priorité
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['basse', 'normale', 'haute'] as const).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPriorite(p)}
                className={`py-2 px-3 rounded-btn text-xs font-medium border capitalize transition-colors ${
                  priorite === p
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold'
                    : 'border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
            Notes complémentaires
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={2}
            placeholder="Consignes particulières, barème..."
            className="w-full p-3 rounded-btn bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] text-[#111827] dark:text-[#F3F4F6] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg">
            {FR.actions.enregistrer}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
