import React, { useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useData } from '@/context/DataContext';
import { Semestre } from '@/types';
import { Check, Plus, Trash2, Calendar, MapPin, Video } from 'lucide-react';

interface SemestresModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SemestresModal: React.FC<SemestresModalProps> = ({ isOpen, onClose }) => {
  const { semestres, activeSemestre, setActiveSemestreId, createSemestre, updateSemestre } = useData();
  const [isCreating, setIsCreating] = useState(false);

  // New semester form states
  const [nom, setNom] = useState('');
  const [niveauFiliere, setNiveauFiliere] = useState('Master 2 – Sécurité des Systèmes d\'Information');
  const [debut, setDebut] = useState('2026-10-28');
  const [fin, setFin] = useState('2027-03-03');
  const [profilHoraire, setProfilHoraire] = useState<'soir' | 'journee' | 'auto'>('soir');
  const [lieuEnLigne, setLieuEnLigne] = useState('https://meet.google.com/xxx-xxxx-xxx');
  const [lieuPresentiel, setLieuPresentiel] = useState('Salle 102');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    await createSemestre({
      nom: nom.trim(),
      niveauFiliere,
      debut,
      fin,
      actif: true,
      profilHoraire,
      lieuParDefaut: {
        en_ligne: lieuEnLigne.trim() || undefined,
        presentiel: lieuPresentiel.trim() || undefined,
      },
      periodesSansCours: [],
    });

    setIsCreating(false);
    setNom('');
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Gestion des semestres">
      <div className="space-y-4">
        {!isCreating ? (
          <>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                Semestres enregistrés
              </label>

              {semestres.map(sem => {
                const isActive = activeSemestre?.id === sem.id;
                return (
                  <div
                    key={sem.id}
                    onClick={() => setActiveSemestreId(sem.id)}
                    className={`flex items-center justify-between p-3.5 rounded-card border cursor-pointer transition-all ${
                      isActive
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
                        : 'border-[#E5E7EB] dark:border-[#262B35] bg-white dark:bg-[#161A21]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6]">
                          {sem.nom}
                        </h4>
                        {isActive && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-bold">
                            Actif
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
                        {sem.debut} au {sem.fin} · Profil {sem.profilHoraire}
                      </p>
                    </div>

                    {isActive && (
                      <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <Button
              variant="outline"
              fullWidth
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreating(true)}
            >
              Nouveau semestre
            </Button>
          </>
        ) : (
          <form onSubmit={handleCreate} className="space-y-3">
            <h4 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6]">
              Créer un semestre
            </h4>

            <Input
              label="Nom du semestre"
              placeholder="Ex. M2 – Semestre 3"
              value={nom}
              onChange={e => setNom(e.target.value)}
              autoFocus
            />

            <Input
              label="Niveau et filière"
              placeholder="Ex. M2 SSI ESP Dakar"
              value={niveauFiliere}
              onChange={e => setNiveauFiliere(e.target.value)}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Date de début"
                type="date"
                value={debut}
                onChange={e => setDebut(e.target.value)}
              />
              <Input
                label="Date de fin"
                type="date"
                value={fin}
                onChange={e => setFin(e.target.value)}
              />
            </div>

            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                Profil horaire
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['soir', 'journee', 'auto'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setProfilHoraire(p)}
                    className={`py-2 px-2 rounded-btn text-xs font-medium border capitalize ${
                      profilHoraire === p
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-bold'
                        : 'border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280]'
                    }`}
                  >
                    {p === 'soir' ? 'Cours du soir' : p === 'journee' ? 'Journée' : 'Auto'}
                  </button>
                ))}
              </div>
            </div>

            <Input
              label="Lieu présentiel habituel"
              placeholder="Salle 102"
              value={lieuPresentiel}
              onChange={e => setLieuPresentiel(e.target.value)}
            />

            <Input
              label="Lien visioconférence par défaut"
              placeholder="https://meet.google.com/..."
              value={lieuEnLigne}
              onChange={e => setLieuEnLigne(e.target.value)}
            />

            <div className="pt-2 flex space-x-2">
              <Button
                type="button"
                variant="outline"
                fullWidth
                onClick={() => setIsCreating(false)}
              >
                Annuler
              </Button>
              <Button type="submit" fullWidth>
                Enregistrer
              </Button>
            </div>
          </form>
        )}
      </div>
    </BottomSheet>
  );
};
