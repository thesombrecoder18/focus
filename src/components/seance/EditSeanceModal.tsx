import React, { useState, useEffect } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FR } from '@/i18n/fr';
import { Seance, Modalite, StatutSeance, HistoriqueSeance } from '@/types';
import { useData } from '@/context/DataContext';
import { seanceRepo } from '@/repositories';
import { useAuth } from '@/context/AuthContext';
import { History, Calendar, MapPin, Video, AlertTriangle } from 'lucide-react';

interface EditSeanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  seance: Seance | null;
}

export const EditSeanceModal: React.FC<EditSeanceModalProps> = ({ isOpen, onClose, seance }) => {
  const { updateSeance, cancelSeance, matieres } = useData();
  const { currentUser } = useAuth();

  const [date, setDate] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [matiereId, setMatiereId] = useState('');
  const [intervenant, setIntervenant] = useState('');
  const [modalite, setModalite] = useState<Modalite>('presentiel');
  const [salle, setSalle] = useState('');
  const [lien, setLien] = useState('');
  const [statut, setStatut] = useState<StatutSeance>('prevue');
  const [historique, setHistorique] = useState<HistoriqueSeance[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (seance) {
      setDate(seance.date);
      setDebut(seance.debut);
      setFin(seance.fin);
      setMatiereId(seance.matiereId || '');
      setIntervenant(seance.intervenant || '');
      setModalite(seance.modalite);
      setSalle(seance.salle || '');
      setLien(seance.lien || '');
      setStatut(seance.statut);

      if (currentUser) {
        seanceRepo.getHistorique(seance.id, currentUser.id).then(setHistorique);
      }
    }
  }, [seance, currentUser]);

  if (!seance) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedMatiere = matieres.find(m => m.id === matiereId);
      await updateSeance(seance.id, {
        date,
        debut,
        fin,
        matiereId: matiereId || undefined,
        intituleRecu: selectedMatiere ? selectedMatiere.intitule : seance.intituleRecu,
        intervenant,
        modalite,
        salle: modalite === 'presentiel' ? salle : undefined,
        lien: modalite === 'en_ligne' ? lien : undefined,
        statut,
      });
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCancel = async () => {
    await cancelSeance(seance.id);
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={FR.seance.deplacer}>
      <form onSubmit={handleSave} className="space-y-4">
        {/* Source info */}
        {seance.sourceRef && (
          <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] bg-[#F7F8FA] dark:bg-[#0E1014] p-2 rounded-btn">
            Source : {seance.sourceRef} ({seance.origine})
          </p>
        )}

        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
            Matière
          </label>
          <select
            value={matiereId}
            onChange={e => setMatiereId(e.target.value)}
            className="w-full h-12 px-3.5 rounded-btn bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] text-[#111827] dark:text-[#F3F4F6] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="">{seance.intituleRecu || 'À renseigner'}</option>
            {matieres.map(m => (
              <option key={m.id} value={m.id}>
                {m.intitule}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Intervenant"
          placeholder="Ex. M. Lam"
          value={intervenant}
          onChange={e => setIntervenant(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <Input
            label="Date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <Input
            label="Début"
            type="time"
            value={debut}
            onChange={e => setDebut(e.target.value)}
          />
          <Input
            label="Fin"
            type="time"
            value={fin}
            onChange={e => setFin(e.target.value)}
          />
        </div>

        {/* Modalité */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
            {FR.seance.modalite}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setModalite('presentiel')}
              className={`py-2 px-3 rounded-btn text-xs font-medium border flex items-center justify-center ${
                modalite === 'presentiel'
                  ? 'border-[#8D662F] bg-[#F5E7D0] text-[#8D662F] font-bold'
                  : 'border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280]'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 mr-1.5" />
              {FR.seance.presentiel}
            </button>
            <button
              type="button"
              onClick={() => setModalite('en_ligne')}
              className={`py-2 px-3 rounded-btn text-xs font-medium border flex items-center justify-center ${
                modalite === 'en_ligne'
                  ? 'border-[#0B67A7] bg-[#DCEFFC] text-[#0B67A7] font-bold'
                  : 'border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280]'
              }`}
            >
              <Video className="w-3.5 h-3.5 mr-1.5" />
              {FR.seance.enLigne}
            </button>
          </div>
        </div>

        {modalite === 'presentiel' ? (
          <Input
            label="Salle"
            placeholder="Ex. Salle 102, Amphi B..."
            value={salle}
            onChange={e => setSalle(e.target.value)}
          />
        ) : (
          <Input
            label="Lien de visioconférence"
            placeholder="https://meet.google.com/..."
            value={lien}
            onChange={e => setLien(e.target.value)}
          />
        )}

        {/* Statut de séance */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-semibold text-[#6B7280] dark:text-[#9CA3AF] uppercase">
            Statut de la séance
          </label>
          <select
            value={statut}
            onChange={e => setStatut(e.target.value as StatutSeance)}
            className="w-full h-11 px-3.5 rounded-btn bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] text-[#111827] dark:text-[#F3F4F6] text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="prevue">Prévue</option>
            <option value="provisoire">Provisoire (à confirmer)</option>
            <option value="deplacee">Déplacée</option>
            <option value="annulee">Annulée</option>
            <option value="non_tenue">Non tenue</option>
            <option value="rattrapage">Rattrapage</option>
          </select>
        </div>

        {/* History button and toggle */}
        {historique.length > 0 && (
          <div>
            <button
              type="button"
              onClick={() => setShowHistory(!showHistory)}
              className="flex items-center text-xs text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              <History className="w-3.5 h-3.5 mr-1.5" />
              {FR.seance.historique} ({historique.length})
            </button>

            {showHistory && (
              <div className="mt-2 p-2.5 rounded-btn bg-[#F7F8FA] dark:bg-[#0E1014] border border-[#E5E7EB] dark:border-[#262B35] space-y-1.5 max-h-36 overflow-y-auto text-xs">
                {historique.map(h => (
                  <div key={h.id} className="text-[#6B7280] dark:text-[#9CA3AF] border-b border-[#E5E7EB]/50 dark:border-[#262B35]/50 pb-1 last:border-none">
                    <span className="font-semibold text-[#111827] dark:text-[#F3F4F6]">{h.champ}</span>: « {h.avant || 'vide'} » → « {h.apres} »
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant={seance.statut === 'annulee' ? 'outline' : 'danger'}
            onClick={handleToggleCancel}
            className="sm:w-1/3"
          >
            {seance.statut === 'annulee' ? FR.seance.reactiver : FR.seance.annulerSeance}
          </Button>
          <Button type="submit" fullWidth className="sm:flex-1" size="lg">
            {FR.actions.enregistrer}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
