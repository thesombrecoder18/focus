import React, { useState } from 'react';
import { BottomSheet } from '../ui/BottomSheet';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { FR } from '@/i18n/fr';
import { useData } from '@/context/DataContext';

interface AddEvenementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddEvenementModal: React.FC<AddEvenementModalProps> = ({ isOpen, onClose }) => {
  const { createEvenement } = useData();
  const [titre, setTitre] = useState('');
  const [debut, setDebut] = useState('');
  const [fin, setFin] = useState('');
  const [journeeEntiere, setJourneeEntiere] = useState(false);
  const [lieu, setLieu] = useState('');
  const [couleur, setCouleur] = useState('#0891B2'); // Cyan default
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) {
      setError(FR.errors.champObligatoire);
      return;
    }

    try {
      await createEvenement({
        titre: titre.trim(),
        debut: debut || new Date().toISOString().slice(0, 16),
        fin: fin || (debut ? debut : new Date(Date.now() + 3600000).toISOString().slice(0, 16)),
        journeeEntiere,
        lieu: lieu.trim() || undefined,
        couleur,
      });
      setTitre('');
      setLieu('');
      setError('');
      onClose();
    } catch (err) {
      console.error(err);
      setError(FR.errors.generique);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={FR.actions.nouvelEvenement}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Titre de l'événement"
          placeholder="Ex. Réunion de projet, Entretien, Soutenance..."
          value={titre}
          onChange={e => setTitre(e.target.value)}
          error={error}
          autoFocus
        />

        <div className="flex items-center space-x-3 py-1">
          <input
            type="checkbox"
            id="journeeEntiere"
            checked={journeeEntiere}
            onChange={e => setJourneeEntiere(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-gray-300"
          />
          <label htmlFor="journeeEntiere" className="text-sm font-medium text-[#111827] dark:text-[#F3F4F6]">
            Journée entière
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Début"
            type={journeeEntiere ? "date" : "datetime-local"}
            value={debut}
            onChange={e => setDebut(e.target.value)}
          />
          <Input
            label="Fin"
            type={journeeEntiere ? "date" : "datetime-local"}
            value={fin}
            onChange={e => setFin(e.target.value)}
          />
        </div>

        <Input
          label="Lieu ou lien"
          placeholder="Ex. Dakar, UCAD, Google Meet..."
          value={lieu}
          onChange={e => setLieu(e.target.value)}
        />

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg">
            {FR.actions.enregistrer}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
