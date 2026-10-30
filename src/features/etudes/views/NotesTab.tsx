import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { FR } from '@/i18n/fr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Plus, GraduationCap, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

export const NotesTab: React.FC = () => {
  const {
    matieres,
    evaluations,
    matiereAverages,
    generalAverage,
    createEvaluation,
    deleteEvaluation,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetMatiereId, setTargetMatiereId] = useState<string>(matieres[0]?.id || '');
  const [evalToDelete, setEvalToDelete] = useState<string | null>(null);

  // Form states
  const [intitule, setIntitule] = useState('');
  const [note, setNote] = useState<number>(15);
  const [bareme, setBareme] = useState<number>(20);
  const [coefficient, setCoefficient] = useState<number>(1);
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));

  const hasAnyEvaluation = evaluations.length > 0;

  const openAddForMatiere = (mId: string) => {
    if (!mId) return;
    setTargetMatiereId(mId);
    setIntitule('');
    setNote(15);
    setBareme(20);
    setCoefficient(1);
    setDate(new Date().toISOString().slice(0, 10));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intitule.trim() || !targetMatiereId) return;

    await createEvaluation({
      matiereId: targetMatiereId,
      intitule: intitule.trim(),
      note: Number(note),
      bareme: Number(bareme) || 20,
      coefficient: Number(coefficient) || 1,
      date,
    });

    setIsModalOpen(false);
  };

  const handleDeleteConfirmed = async () => {
    if (!evalToDelete) return;
    await deleteEvaluation(evalToDelete);
    setEvalToDelete(null);
  };

  const getMention = (avg: number) => {
    if (avg >= 16) return { label: FR.notes.mentions.tresBien, color: 'text-emerald-600 dark:text-emerald-400' };
    if (avg >= 14) return { label: FR.notes.mentions.bien, color: 'text-indigo-600 dark:text-indigo-400' };
    if (avg >= 12) return { label: FR.notes.mentions.assezBien, color: 'text-cyan-600 dark:text-cyan-400' };
    if (avg >= 10) return { label: FR.notes.mentions.passable, color: 'text-amber-600 dark:text-amber-400' };
    return { label: FR.notes.mentions.ajourne, color: 'text-red-600 dark:text-red-400' };
  };

  const mention = getMention(generalAverage);

  return (
    <div className="space-y-4">
      {/* Top General Average Banner */}
      <div className="p-4 rounded-card bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/5 dark:from-indigo-950/40 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
              {FR.notes.moyenneGenerale}
            </span>
            <div className="flex items-baseline space-x-2 mt-0.5">
              <span className="text-3xl font-extrabold text-[#111827] dark:text-[#F3F4F6] font-mono">
                {hasAnyEvaluation ? generalAverage.toFixed(2) : '—'}
              </span>
              <span className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{FR.notes.sur20}</span>
              {hasAnyEvaluation && (
                <span className={clsx("text-xs font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/40 ml-2", mention.color)}>
                  {FR.notes.mention} {mention.label}
                </span>
              )}
            </div>
          </div>
        </div>

        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => openAddForMatiere(matieres[0]?.id || '')}
          disabled={matieres.length === 0}
          className="self-start sm:self-auto"
        >
          {FR.notes.ajouterNote}
        </Button>
      </div>

      {matieres.length === 0 && (
        <Card className="text-center py-8">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{FR.notes.aucuneMatiere}</p>
        </Card>
      )}

      {/* Matieres list with grades */}
      <div className="space-y-3">
        {matieres.map(m => {
          const matEvals = evaluations.filter(e => e.matiereId === m.id);
          const matAvg = matiereAverages[m.id] ?? 0;
          const hasEvals = matEvals.length > 0;

          return (
            <Card key={m.id} colorBar={m.couleur} className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6]">
                      {m.intitule}
                    </h4>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      {FR.notes.coefficient} {m.coefficient}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-base font-bold text-[#111827] dark:text-[#F3F4F6] font-mono">
                      {hasEvals ? matAvg.toFixed(2) : '—'}
                    </span>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]"> {FR.notes.sur20}</span>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => openAddForMatiere(m.id)}
                    className="p-1.5 h-8 w-8"
                    title={FR.notes.ajouterNoteMatiere}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Evaluations list for this matiere */}
              {hasEvals ? (
                <div className="space-y-1.5 border-t border-[#E5E7EB]/50 dark:border-[#262B35]/50 pt-2">
                  {matEvals.map(ev => {
                    const noteSur20 = ev.bareme > 0 ? (ev.note / ev.bareme) * 20 : ev.note;

                    return (
                      <div
                        key={ev.id}
                        className="flex items-center justify-between p-2 rounded-btn bg-[#F7F8FA] dark:bg-[#0E1014] text-xs"
                      >
                        <div className="truncate pr-2">
                          <p className="font-semibold text-[#111827] dark:text-[#F3F4F6] truncate">
                            {ev.intitule}
                          </p>
                          <p className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF]">
                            {ev.date} · {FR.notes.coefficient} {ev.coefficient}
                          </p>
                        </div>

                        <div className="flex items-center space-x-2 flex-shrink-0">
                          <span className="font-mono font-bold text-[#111827] dark:text-[#F3F4F6]">
                            {ev.note}/{ev.bareme}
                            {ev.bareme !== 20 && (
                              <span className="text-[10px] opacity-70 ml-1">
                                ({noteSur20.toFixed(1)}/20)
                              </span>
                            )}
                          </span>

                          <button
                            type="button"
                            onClick={() => setEvalToDelete(ev.id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-btn transition-colors"
                            title={FR.notes.supprimerNote}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] italic pt-1">
                  {FR.notes.aucuneNoteMatiere}
                </p>
              )}
            </Card>
          );
        })}
      </div>

      {/* Add Evaluation BottomSheet */}
      <BottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={FR.notes.formulaire.titre}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
              {FR.notes.formulaire.matiere}
            </label>
            <select
              value={targetMatiereId}
              onChange={e => setTargetMatiereId(e.target.value)}
              className="w-full h-12 px-3.5 rounded-btn bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] text-[#111827] dark:text-[#F3F4F6] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {matieres.map(m => (
                <option key={m.id} value={m.id}>
                  {m.intitule} ({FR.notes.coefficient} {m.coefficient})
                </option>
              ))}
            </select>
          </div>

          <Input
            label={FR.notes.formulaire.intitule}
            placeholder={FR.notes.formulaire.intitulePlaceholder}
            value={intitule}
            onChange={e => setIntitule(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label={FR.notes.formulaire.noteObtenue}
              type="number"
              step="0.25"
              min="0"
              max={bareme}
              value={note}
              onChange={e => setNote(parseFloat(e.target.value) || 0)}
              required
            />
            <Input
              label={FR.notes.formulaire.bareme}
              type="number"
              min="1"
              value={bareme}
              onChange={e => setBareme(parseInt(e.target.value, 10) || 20)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label={FR.notes.formulaire.coefficient}
              type="number"
              min="0.5"
              step="0.5"
              value={coefficient}
              onChange={e => setCoefficient(parseFloat(e.target.value) || 1)}
              required
            />
            <Input
              label={FR.notes.formulaire.date}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg">
              {FR.notes.formulaire.enregistrer}
            </Button>
          </div>
        </form>
      </BottomSheet>

      {/* Delete confirmation */}
      <BottomSheet
        isOpen={evalToDelete !== null}
        onClose={() => setEvalToDelete(null)}
        title={FR.notes.confirmerSuppressionTitre}
      >
        <div className="space-y-4">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            {FR.notes.confirmerSuppressionMessage}
          </p>
          <div className="flex space-x-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setEvalToDelete(null)}>
              {FR.actions.annuler}
            </Button>
            <Button type="button" fullWidth onClick={handleDeleteConfirmed}>
              {FR.actions.supprimer}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
