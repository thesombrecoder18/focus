import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Devoir } from '@/types';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { EmptyState } from '@/components/ui/EmptyState';
import { AddDevoirModal } from '@/components/forms/AddDevoirModal';
import { FR } from '@/i18n/fr';
import { Plus, CheckCircle2, Clock, Trash2, Calendar } from 'lucide-react';
import { clsx } from 'clsx';

export const DevoirsTab: React.FC = () => {
  const { devoirs, matieres, toggleDevoirRendu, deleteDevoir } = useData();
  const [filter, setFilter] = useState<'tous' | 'a_faire' | 'rendu'>('a_faire');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredDevoirs = devoirs.filter(d => {
    if (filter === 'a_faire') return d.statut !== 'rendu';
    if (filter === 'rendu') return d.statut === 'rendu';
    return true;
  });

  const getMatiereName = (id: string) => {
    const found = matieres.find(m => m.id === id);
    return found ? found.intitule : 'Matière générale';
  };

  return (
    <div className="space-y-4">
      {/* Top Filter and Add Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'a_faire', label: 'À faire' },
            { value: 'rendu', label: 'Rendus' },
            { value: 'tous', label: 'Tous' },
          ]}
          size="sm"
        />

        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          {FR.actions.nouveauDevoir}
        </Button>
      </div>

      {/* Devoirs List */}
      {filteredDevoirs.length > 0 ? (
        <div className="space-y-2.5">
          {filteredDevoirs.map(d => {
            const isDone = d.statut === 'rendu';

            return (
              <div
                key={d.id}
                className={clsx(
                  "flex items-start justify-between p-4 rounded-card border bg-white dark:bg-[#161A21] transition-all",
                  isDone
                    ? "opacity-60 border-[#E5E7EB] dark:border-[#262B35]"
                    : "border-[#E5E7EB] dark:border-[#262B35] shadow-xs"
                )}
              >
                <div className="flex items-start space-x-3 max-w-[80%]">
                  {/* Quick 1-tap Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleDevoirRendu(d.id)}
                    className={clsx(
                      "mt-0.5 w-6 h-6 rounded-md border flex items-center justify-center transition-all select-none",
                      isDone
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "border-[#E5E7EB] dark:border-[#262B35] hover:border-emerald-500 bg-[#F7F8FA] dark:bg-[#0E1014]"
                    )}
                    aria-label={isDone ? "Marquer non rendu" : "Marquer rendu"}
                  >
                    {isDone && <CheckCircle2 className="w-4 h-4" />}
                  </button>

                  <div>
                    <h4
                      className={clsx(
                        "text-sm font-bold text-[#111827] dark:text-[#F3F4F6] leading-snug",
                        isDone && "line-through text-[#6B7280] dark:text-[#9CA3AF]"
                      )}
                    >
                      {d.titre}
                    </h4>

                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mt-0.5">
                      {getMatiereName(d.matiereId)}
                    </p>

                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] mt-1 flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Échéance : {d.echeance.replace('T', ' à ')}
                    </p>

                    {d.notes && (
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 bg-[#F7F8FA] dark:bg-[#0E1014] p-2 rounded-btn">
                        {d.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2">
                  <Badge
                    variant={d.priorite === 'haute' ? 'danger' : d.priorite === 'normale' ? 'default' : 'outline'}
                    size="sm"
                    className="capitalize"
                  >
                    {d.priorite}
                  </Badge>

                  <button
                    type="button"
                    onClick={() => deleteDevoir(d.id)}
                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-btn transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={<CheckCircle2 className="w-6 h-6 text-emerald-500" />}
          description={FR.dashboard.aucunDevoir}
          actionLabel={FR.actions.nouveauDevoir}
          onAction={() => setIsAddModalOpen(true)}
        />
      )}

      <AddDevoirModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
