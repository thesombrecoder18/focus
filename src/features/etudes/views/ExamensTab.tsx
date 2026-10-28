import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Examen } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { EmptyState } from '@/components/ui/EmptyState';
import { FR } from '@/i18n/fr';
import { parseISO, differenceInDays } from 'date-fns';
import { Plus, Calendar, Clock, MapPin, Trash2 } from 'lucide-react';

export const ExamensTab: React.FC = () => {
  const { examens, matieres, createExamen, deleteExamen } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [matiereId, setMatiereId] = useState(matieres[0]?.id || '');
  const [date, setDate] = useState('');
  const [heure, setHeure] = useState('17:00');
  const [dureeMin, setDureeMin] = useState(120);
  const [salle, setSalle] = useState('Salle 102');
  const [type, setType] = useState<'CC' | 'partiel' | 'final'>('CC');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!matiereId || !date) return;

    await createExamen({
      matiereId,
      date,
      heure,
      dureeMin,
      salle: salle.trim() || undefined,
      type,
    });

    setIsModalOpen(false);
  };

  const getMatiereName = (id: string) => {
    const found = matieres.find(m => m.id === id);
    return found ? found.intitule : 'Matière';
  };

  const getCountdown = (dateStr: string) => {
    const diff = differenceInDays(parseISO(dateStr), new Date());
    if (diff < 0) return 'Terminé';
    if (diff === 0) return 'Aujourd\'hui';
    if (diff === 1) return 'Demain';
    return `J-${diff}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6]">
          Examens programmés
        </h3>
        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsModalOpen(true)}
        >
          {FR.actions.nouvelExamen}
        </Button>
      </div>

      {examens.length > 0 ? (
        <div className="space-y-3">
          {examens.map(ex => {
            const countdown = getCountdown(ex.date);

            return (
              <div
                key={ex.id}
                className="flex items-center justify-between p-4 rounded-card border border-[#E5E7EB] dark:border-[#262B35] bg-white dark:bg-[#161A21] shadow-xs"
              >
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant="danger" size="sm">
                      {ex.type === 'CC' ? 'Contrôle continu' : ex.type === 'partiel' ? 'Partiel' : 'Examen final'}
                    </Badge>
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF] flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      {ex.dureeMin} min
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6]">
                    {getMatiereName(ex.matiereId)}
                  </h4>

                  <div className="flex items-center space-x-3 text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-red-500" />
                      {ex.date} à {ex.heure}
                    </span>
                    {ex.salle && (
                      <span className="flex items-center">
                        <MapPin className="w-3.5 h-3.5 mr-1 text-[#8D662F]" />
                        {ex.salle}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-sm font-bold text-red-600 dark:text-red-400 font-mono">
                      {countdown}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => deleteExamen(ex.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-btn transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<Calendar className="w-6 h-6 text-red-400" />}
          description={FR.dashboard.aucunExamen}
          actionLabel={FR.actions.nouvelExamen}
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {/* Add Examen BottomSheet */}
      <BottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={FR.actions.nouvelExamen}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
              Matière
            </label>
            <select
              value={matiereId}
              onChange={e => setMatiereId(e.target.value)}
              className="w-full h-12 px-3.5 rounded-btn bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] text-[#111827] dark:text-[#F3F4F6] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            >
              {matieres.map(m => (
                <option key={m.id} value={m.id}>
                  {m.intitule}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
            <Input
              label="Heure"
              type="time"
              value={heure}
              onChange={e => setHeure(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Durée (minutes)"
              type="number"
              min="30"
              step="15"
              value={dureeMin}
              onChange={e => setDureeMin(parseInt(e.target.value, 10) || 120)}
            />
            <Input
              label="Salle"
              placeholder="Ex. Amphi B, Salle 102"
              value={salle}
              onChange={e => setSalle(e.target.value)}
            />
          </div>

          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
              Type d'évaluation
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['CC', 'partiel', 'final'] as const).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`py-2 px-2 rounded-btn text-xs font-medium border ${
                    type === t
                      ? 'border-red-500 bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-bold'
                      : 'border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280]'
                  }`}
                >
                  {t === 'CC' ? 'Contrôle continu' : t === 'partiel' ? 'Partiel' : 'Final'}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg">
              {FR.actions.enregistrer}
            </Button>
          </div>
        </form>
      </BottomSheet>
    </div>
  );
};
