import React, { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FR } from '@/i18n/fr';
import { Club } from '@/types';
import { clsx } from 'clsx';

export const CLUB_COLORS = ['#4F46E5', '#7C3AED', '#059669', '#D97706', '#0891B2', '#E11D48'];

interface ClubFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  club?: Club | null;
  onSave: (data: { nom: string; role: string; couleur: string }) => Promise<void>;
}

export const ClubFormModal: React.FC<ClubFormModalProps> = ({ isOpen, onClose, club, onSave }) => {
  const [nom, setNom] = useState('');
  const [role, setRole] = useState('');
  const [couleur, setCouleur] = useState(CLUB_COLORS[0]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNom(club?.nom || '');
    setRole(club?.role || '');
    setCouleur(club?.couleur || CLUB_COLORS[0]);
  }, [isOpen, club]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;

    setIsSaving(true);
    try {
      await onSave({
        nom: nom.trim(),
        role: role.trim() || 'Membre',
        couleur,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={club ? FR.clubs.modifier : FR.clubs.nouveauClub}
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          id="club-nom"
          label={FR.clubs.nom}
          placeholder={FR.clubs.nomPlaceholder}
          value={nom}
          onChange={e => setNom(e.target.value)}
          required
          autoFocus
        />

        <Input
          id="club-role"
          label={FR.clubs.role}
          placeholder={FR.clubs.rolePlaceholder}
          value={role}
          onChange={e => setRole(e.target.value)}
        />

        <div className="space-y-1.5">
          <span className="block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] tracking-tight">
            {FR.clubs.couleur}
          </span>
          <div className="flex items-center space-x-2">
            {CLUB_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setCouleur(color)}
                aria-label={color}
                aria-pressed={couleur === color}
                className={clsx(
                  "w-9 h-9 rounded-full transition-all duration-200 active:scale-95",
                  couleur === color && "ring-2 ring-offset-2 ring-offset-white dark:ring-offset-[#161922] ring-[#4F46E5]"
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" loading={isSaving} disabled={!nom.trim()}>
            {club ? FR.actions.enregistrer : FR.clubs.creer}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
