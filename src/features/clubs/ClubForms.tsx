import React, { useEffect, useState } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FR } from '@/i18n/fr';
import { ReunionClub, TacheClub, CompteRendu, ContactClub } from '@/types';

const textareaClass =
  "w-full min-h-[110px] p-3 rounded-[var(--elizo-radius-btn)] bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] text-sm text-[#111827] dark:text-[#F3F4F6] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-indigo-500/30";

const labelClass = "block text-xs font-medium text-[#6B7280] dark:text-[#9CA3AF] mb-1.5 tracking-tight";

function defaultDateTime(): string {
  return new Date().toISOString().slice(0, 16);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface ReunionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  onSave: (data: Omit<ReunionClub, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
}

export const ReunionFormModal: React.FC<ReunionFormModalProps> = ({ isOpen, onClose, clubId, onSave }) => {
  const [titre, setTitre] = useState('');
  const [date, setDate] = useState(defaultDateTime());
  const [lieu, setLieu] = useState('');
  const [recurrence, setRecurrence] = useState<'aucune' | 'hebdomadaire' | 'mensuelle'>('aucune');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitre('');
    setDate(defaultDateTime());
    setLieu('');
    setRecurrence('aucune');
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim() || !date) return;
    setIsSaving(true);
    try {
      await onSave({
        clubId,
        titre: titre.trim(),
        date,
        lieu: lieu.trim() || undefined,
        recurrence: recurrence === 'aucune' ? undefined : recurrence,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={FR.clubs.reunions.formulaireTitre}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          id="reunion-titre"
          label={FR.clubs.reunions.titreChamp}
          placeholder={FR.clubs.reunions.titrePlaceholder}
          value={titre}
          onChange={e => setTitre(e.target.value)}
          required
          autoFocus
        />

        <div>
          <label className={labelClass} htmlFor="reunion-date">{FR.clubs.reunions.date}</label>
          <input
            id="reunion-date"
            type="datetime-local"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full h-11 px-3 rounded-[var(--elizo-radius-btn)] bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <Input
          id="reunion-lieu"
          label={FR.clubs.reunions.lieu}
          placeholder={FR.clubs.reunions.lieuPlaceholder}
          value={lieu}
          onChange={e => setLieu(e.target.value)}
        />

        <div>
          <label className={labelClass} htmlFor="reunion-recurrence">{FR.clubs.reunions.recurrence}</label>
          <select
            id="reunion-recurrence"
            value={recurrence}
            onChange={e => setRecurrence(e.target.value as typeof recurrence)}
            className="w-full h-11 px-3 rounded-[var(--elizo-radius-btn)] bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="aucune">{FR.clubs.recurrences.aucune}</option>
            <option value="hebdomadaire">{FR.clubs.recurrences.hebdomadaire}</option>
            <option value="mensuelle">{FR.clubs.recurrences.mensuelle}</option>
          </select>
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" loading={isSaving} disabled={!titre.trim() || !date}>
            {FR.actions.enregistrer}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};

interface TacheFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  onSave: (data: Omit<TacheClub, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
}

export const TacheFormModal: React.FC<TacheFormModalProps> = ({ isOpen, onClose, clubId, onSave }) => {
  const [titre, setTitre] = useState('');
  const [echeance, setEcheance] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTitre('');
    setEcheance('');
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titre.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        clubId,
        titre: titre.trim(),
        echeance: echeance || undefined,
        statut: 'ouverte',
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={FR.clubs.taches.formulaireTitre}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          id="tache-titre"
          label={FR.clubs.taches.titreChamp}
          placeholder={FR.clubs.taches.titrePlaceholder}
          value={titre}
          onChange={e => setTitre(e.target.value)}
          required
          autoFocus
        />

        <div>
          <label className={labelClass} htmlFor="tache-echeance">{FR.clubs.taches.echeance}</label>
          <input
            id="tache-echeance"
            type="datetime-local"
            value={echeance}
            onChange={e => setEcheance(e.target.value)}
            className="w-full h-11 px-3 rounded-[var(--elizo-radius-btn)] bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" loading={isSaving} disabled={!titre.trim()}>
            {FR.actions.enregistrer}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};

interface CompteRenduFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  reunions: ReunionClub[];
  onSave: (data: Omit<CompteRendu, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
}

export const CompteRenduFormModal: React.FC<CompteRenduFormModalProps> = ({ isOpen, onClose, clubId, reunions, onSave }) => {
  const [date, setDate] = useState(today());
  const [reunionId, setReunionId] = useState('');
  const [contenu, setContenu] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setDate(today());
    setReunionId('');
    setContenu('');
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenu.trim() || !date) return;
    setIsSaving(true);
    try {
      await onSave({
        clubId,
        reunionId: reunionId || undefined,
        date,
        contenu: contenu.trim(),
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={FR.clubs.comptesRendus.formulaireTitre}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <div>
          <label className={labelClass} htmlFor="cr-date">{FR.clubs.comptesRendus.date}</label>
          <input
            id="cr-date"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            required
            className="w-full h-11 px-3 rounded-[var(--elizo-radius-btn)] bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div>
          <label className={labelClass} htmlFor="cr-reunion">{FR.clubs.comptesRendus.reunion}</label>
          <select
            id="cr-reunion"
            value={reunionId}
            onChange={e => setReunionId(e.target.value)}
            className="w-full h-11 px-3 rounded-[var(--elizo-radius-btn)] bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] text-sm text-[#111827] dark:text-[#F3F4F6] focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
          >
            <option value="">{FR.clubs.comptesRendus.aucuneReunion}</option>
            {reunions.map(r => (
              <option key={r.id} value={r.id}>{r.titre}</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass} htmlFor="cr-contenu">{FR.clubs.comptesRendus.contenu}</label>
          <textarea
            id="cr-contenu"
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            placeholder={FR.clubs.comptesRendus.contenuPlaceholder}
            required
            className={textareaClass}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" loading={isSaving} disabled={!contenu.trim() || !date}>
            {FR.actions.enregistrer}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  clubId: string;
  onSave: (data: Omit<ContactClub, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<void>;
}

export const ContactFormModal: React.FC<ContactFormModalProps> = ({ isOpen, onClose, clubId, onSave }) => {
  const [nom, setNom] = useState('');
  const [role, setRole] = useState('');
  const [telephone, setTelephone] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setNom('');
    setRole('');
    setTelephone('');
    setEmail('');
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nom.trim()) return;
    setIsSaving(true);
    try {
      await onSave({
        clubId,
        nom: nom.trim(),
        role: role.trim() || undefined,
        telephone: telephone.trim() || undefined,
        email: email.trim() || undefined,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title={FR.clubs.contacts.formulaireTitre}>
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        <Input
          id="contact-nom"
          label={FR.clubs.contacts.nom}
          placeholder={FR.clubs.contacts.nomPlaceholder}
          value={nom}
          onChange={e => setNom(e.target.value)}
          required
          autoFocus
        />
        <Input
          id="contact-role"
          label={FR.clubs.contacts.role}
          placeholder={FR.clubs.contacts.rolePlaceholder}
          value={role}
          onChange={e => setRole(e.target.value)}
        />
        <Input
          id="contact-telephone"
          label={FR.clubs.contacts.telephone}
          type="tel"
          placeholder="+221 77 000 00 00"
          value={telephone}
          onChange={e => setTelephone(e.target.value)}
        />
        <Input
          id="contact-email"
          label={FR.clubs.contacts.email}
          type="email"
          placeholder="contact@exemple.sn"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <div className="pt-2">
          <Button type="submit" fullWidth size="lg" loading={isSaving} disabled={!nom.trim()}>
            {FR.actions.enregistrer}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
};
