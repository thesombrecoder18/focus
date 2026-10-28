import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { Matiere } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { FR } from '@/i18n/fr';
import { Plus, Edit2, Trash2, AlertTriangle, Users, BookOpen, FileCheck } from 'lucide-react';
import { RelevePresenceModal } from './RelevePresenceModal';

export const MatieresTab: React.FC = () => {
  const {
    matieres,
    matieresStats,
    globalPresenceRate,
    activeSemestre,
    createMatiere,
    updateMatiere,
    deleteMatiere,
  } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReleveOpen, setIsReleveOpen] = useState(false);
  const [editingMatiere, setEditingMatiere] = useState<Matiere | null>(null);

  // Form states
  const [intitule, setIntitule] = useState('');
  const [code, setCode] = useState('');
  const [enseignant, setEnseignant] = useState('');
  const [coefficient, setCoefficient] = useState(1);
  const [couleur, setCouleur] = useState('#4F46E5');
  const [alias, setAlias] = useState('');
  const [seuilAbsences, setSeuilAbsences] = useState<number | undefined>(undefined);

  const openCreateModal = () => {
    setEditingMatiere(null);
    setIntitule('');
    setCode('');
    setEnseignant('');
    setCoefficient(1);
    setCouleur('#4F46E5');
    setAlias('');
    setSeuilAbsences(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (m: Matiere) => {
    setEditingMatiere(m);
    setIntitule(m.intitule);
    setCode(m.code || '');
    setEnseignant(m.enseignants.join(', '));
    setCoefficient(m.coefficient);
    setCouleur(m.couleur);
    setAlias(m.alias.join(', '));
    setSeuilAbsences(m.seuilAbsences);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intitule.trim() || !activeSemestre) return;

    const enseignantsList = enseignant
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const aliasList = alias
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    if (editingMatiere) {
      await updateMatiere(editingMatiere.id, {
        intitule: intitule.trim(),
        code: code.trim() || undefined,
        enseignants: enseignantsList,
        coefficient,
        couleur,
        alias: aliasList,
        seuilAbsences,
      });
    } else {
      await createMatiere({
        semestreId: activeSemestre.id,
        intitule: intitule.trim(),
        code: code.trim() || undefined,
        enseignants: enseignantsList,
        coefficient,
        couleur,
        alias: aliasList,
        seuilAbsences,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Supprimer cette matière ? Les séances associées seront conservées.')) {
      await deleteMatiere(id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Attendance Stats Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-card bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40 gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300">
            Assiduité globale du semestre
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-3xl font-extrabold text-[#111827] dark:text-[#F3F4F6] font-mono">
              {globalPresenceRate} %
            </span>
            <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
              (présents + retards sur séances tenues)
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <Button
            variant="outline"
            icon={<FileCheck className="w-4 h-4" />}
            onClick={() => setIsReleveOpen(true)}
            size="sm"
          >
            Relevé d'assiduité
          </Button>

          <Button
            icon={<Plus className="w-4 h-4" />}
            onClick={openCreateModal}
            size="sm"
          >
            {FR.actions.nouvelleMatiere}
          </Button>
        </div>
      </div>

      {/* Matieres Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {matieres.map(m => {
          const stats = matieresStats[m.id];
          const hasAlert = m.seuilAbsences && stats && stats.absents >= m.seuilAbsences;

          return (
            <Card key={m.id} colorBar={m.couleur} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    {m.code && (
                      <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#E5E7EB] dark:bg-[#262B35] text-[#111827] dark:text-[#F3F4F6]">
                        {m.code}
                      </span>
                    )}
                    <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                      Coef. {m.coefficient}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => openEditModal(m)}
                      className="p-1 rounded-md text-[#6B7280] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(m.id)}
                      className="p-1 rounded-md text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6] line-clamp-2 leading-tight">
                  {m.intitule}
                </h3>

                {m.enseignants.length > 0 && (
                  <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 flex items-center">
                    <Users className="w-3.5 h-3.5 mr-1 text-[#9CA3AF]" />
                    {m.enseignants.join(', ')}
                  </p>
                )}
              </div>

              {/* Bottom Attendance info */}
              <div className="pt-3 mt-3 border-t border-[#E5E7EB]/50 dark:border-[#262B35]/50 flex items-center justify-between text-xs">
                <span className="text-[#6B7280] dark:text-[#9CA3AF]">Présence :</span>
                <div className="flex items-center space-x-2">
                  {stats ? (
                    <span className="font-mono font-bold text-[#111827] dark:text-[#F3F4F6]">
                      {stats.presents + stats.retards}/{stats.totalTenues} · {stats.tauxPresence} %
                    </span>
                  ) : (
                    <span className="text-[#6B7280]">—</span>
                  )}

                  {hasAlert && (
                    <Badge variant="danger" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
                      Seuil atteint
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {matieres.length === 0 && (
        <div className="p-8 text-center text-sm text-[#6B7280] dark:text-[#9CA3AF]">
          {FR.etudes.matieres.aucuneMatiere}
        </div>
      )}

      {/* Add / Edit Matiere BottomSheet */}
      <BottomSheet
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMatiere ? "Modifier la matière" : FR.actions.nouvelleMatiere}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Intitulé de la matière"
            placeholder="Ex. Gouvernance et politique de sécurité"
            value={intitule}
            onChange={e => setIntitule(e.target.value)}
            required
            autoFocus
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Code (facultatif)"
              placeholder="Ex. MASTER-SSI-5321"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <Input
              label="Coefficient"
              type="number"
              min="1"
              max="10"
              value={coefficient}
              onChange={e => setCoefficient(parseInt(e.target.value, 10) || 1)}
            />
          </div>

          <Input
            label="Intervenant(s) (séparés par une virgule)"
            placeholder="Ex. M. Lam, Dr. Fall"
            value={enseignant}
            onChange={e => setEnseignant(e.target.value)}
          />

          <Input
            label="Alias (pour rapprochement import)"
            placeholder="Ex. GPS, Gouvernance, Politique"
            value={alias}
            onChange={e => setAlias(e.target.value)}
            helpText="Sépare les alias par des virgules pour faciliter la détection automatique."
          />

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                Couleur
              </label>
              <div className="flex items-center space-x-2 h-12 px-2 bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] rounded-btn">
                <input
                  type="color"
                  value={couleur}
                  onChange={e => setCouleur(e.target.value)}
                  className="w-8 h-8 rounded-full border-none cursor-pointer"
                />
                <span className="text-xs font-mono">{couleur}</span>
              </div>
            </div>

            <Input
              label="Seuil d'absences max"
              type="number"
              min="1"
              placeholder="Ex. 3"
              value={seuilAbsences ?? ''}
              onChange={e => setSeuilAbsences(e.target.value ? parseInt(e.target.value, 10) : undefined)}
            />
          </div>

          <div className="pt-2">
            <Button type="submit" fullWidth size="lg">
              {FR.actions.enregistrer}
            </Button>
          </div>
        </form>
      </BottomSheet>

      <RelevePresenceModal
        isOpen={isReleveOpen}
        onClose={() => setIsReleveOpen(false)}
      />
    </div>
  );
};
