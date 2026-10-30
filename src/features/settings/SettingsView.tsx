import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useData } from '@/context/DataContext';
import { FR } from '@/i18n/fr';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { exportAllUserDataAsJson, deleteAllUserData, invitationRepo } from '@/repositories';
import {
  User,
  Sun,
  Moon,
  Laptop,
  Mail,
  Lock,
  Clock,
  Shield,
  Download,
  Trash2,
  KeyRound,
  Check,
  Bell,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { clsx } from 'clsx';
import { Invitation } from '@/types';

// Mini toggle switch cohérent avec le design system
const ToggleSwitch: React.FC<{ checked: boolean; onChange: (v: boolean) => void; id?: string }> = ({ checked, onChange, id }) => (
  <button
    type="button"
    role="switch"
    id={id}
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={clsx(
      'relative w-10 h-5.5 w-[40px] h-[22px] rounded-full transition-colors duration-200 ease-in-out flex-shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2',
      checked ? 'bg-indigo-500' : 'bg-[#D1D5DB] dark:bg-[#374151]'
    )}
  >
    <span
      className={clsx(
        'absolute top-[3px] left-[3px] w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out',
        checked ? 'translate-x-[18px]' : 'translate-x-0'
      )}
    />
  </button>
);

export const SettingsView: React.FC = () => {
  const { currentUser, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { settings } = useData();

  // Profile states
  const [nom, setNom] = useState(currentUser?.nom || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Availability slots
  const [heureDebut, setHeureDebut] = useState(settings?.plageDisponibilite?.debut || '08:00');
  const [heureFin, setHeureFin] = useState(settings?.plageDisponibilite?.fin || '22:00');

  // Notifications toggles (Phase 1 preview settings)
  const [rappelCours, setRappelCours] = useState(settings?.notifications?.rappelCours ?? true);
  const [rappelPointage, setRappelPointage] = useState(settings?.notifications?.rappelPointage ?? true);
  const [seanceModifiee, setSeanceModifiee] = useState(settings?.notifications?.seanceModifiee ?? true);
  const [edtManquant, setEdtManquant] = useState(settings?.notifications?.edtManquant ?? true);
  const [rappelDevoir, setRappelDevoir] = useState(settings?.notifications?.rappelDevoir ?? true);
  const [rappelExamen, setRappelExamen] = useState(settings?.notifications?.rappelExamen ?? true);

  // Invitations
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [createdCode, setCreatedCode] = useState<string | null>(null);

  // Load invitations
  React.useEffect(() => {
    if (currentUser) {
      invitationRepo.getInvitations(currentUser.id).then(setInvitations);
    }
  }, [currentUser]);

  const handleCreateInvitation = async () => {
    if (!currentUser) return;
    const inv = await invitationRepo.createInvitation(currentUser.id);
    setCreatedCode(inv.code);
    setInvitations(prev => [inv, ...prev]);
  };

  const handleRevokeInvitation = async (id: string) => {
    if (!currentUser) return;
    await invitationRepo.revokeInvitation(id, currentUser.id);
    setInvitations(prev =>
      prev.map(i => (i.id === id ? { ...i, revoquee: true } : i))
    );
  };

  const handleExportJson = async () => {
    if (!currentUser) return;
    const jsonStr = await exportAllUserDataAsJson(currentUser.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `elizo_focus_export_${currentUser.id}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    await deleteAllUserData(currentUser.id);
    logout();
  };

  return (
    <div className="space-y-6 pb-20 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-[#111827] dark:text-[#F3F4F6] tracking-tight">
          {FR.settings.titre}
        </h1>
        <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
          Gère tes préférences, tes disponibilités et tes données.
        </p>
      </div>

      {/* 1. Apparence (Thème) */}
      <Card className="space-y-3">
        <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center">
          <Sun className="w-4 h-4 mr-2 text-indigo-500" />
          {FR.settings.theme}
        </h3>

        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={clsx(
              "flex flex-col items-center justify-center p-3 rounded-btn border transition-all text-xs font-semibold",
              theme === 'light'
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                : "border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280]"
            )}
          >
            <Sun className="w-5 h-5 mb-1.5" />
            {FR.settings.themeClair}
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={clsx(
              "flex flex-col items-center justify-center p-3 rounded-btn border transition-all text-xs font-semibold",
              theme === 'dark'
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                : "border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280]"
            )}
          >
            <Moon className="w-5 h-5 mb-1.5" />
            {FR.settings.themeSombre}
          </button>

          <button
            type="button"
            onClick={() => setTheme('system')}
            className={clsx(
              "flex flex-col items-center justify-center p-3 rounded-btn border transition-all text-xs font-semibold",
              theme === 'system'
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 ring-2 ring-indigo-500/20"
                : "border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280]"
            )}
          >
            <Laptop className="w-5 h-5 mb-1.5" />
            {FR.settings.themeSysteme}
          </button>
        </div>
      </Card>

      {/* 2. Profil */}
      <Card className="space-y-4">
        <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center">
          <User className="w-4 h-4 mr-2 text-indigo-500" />
          {FR.settings.profil}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={FR.settings.nom}
            value={nom}
            onChange={e => setNom(e.target.value)}
          />
          <Input
            label={FR.settings.email}
            value={email}
            disabled
            helpText="Compte personnel de cours du soir (ESP Dakar)"
          />
        </div>
      </Card>

      {/* 3. Plages de disponibilité pour Créneaux Libres */}
      <Card className="space-y-3">
        <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center">
          <Clock className="w-4 h-4 mr-2 text-indigo-500" />
          {FR.settings.disponibilite}
        </h3>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          {FR.settings.disponibiliteAide}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label={FR.settings.heureDebut}
            type="time"
            value={heureDebut}
            onChange={e => setHeureDebut(e.target.value)}
          />
          <Input
            label={FR.settings.heureFin}
            type="time"
            value={heureFin}
            onChange={e => setHeureFin(e.target.value)}
          />
        </div>

        <div className="p-3 rounded-btn bg-[#F7F8FA] dark:bg-[#0E1014] border border-[#E5E7EB] dark:border-[#262B35] text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <span className="font-semibold text-[#111827] dark:text-[#F3F4F6]">Bloc récurrent actif :</span> Activité professionnelle (09:00 à 16:00 en semaine), automatiquement exclue du calcul des créneaux libres.
        </div>
      </Card>

      {/* 4. Réglages des Notifications & Rappels */}
      <Card className="space-y-4">
        <div>
          <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center">
            <Bell className="w-4 h-4 mr-2 text-indigo-500" />
            {FR.settings.notifications}
          </h3>
          <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
            {FR.settings.notificationsNote}
          </p>
        </div>

        <div className="space-y-1 text-sm">
          {[
            { label: FR.settings.rappelCours, val: rappelCours, set: setRappelCours, id: 'notif-cours' },
            { label: FR.settings.rappelPointage, val: rappelPointage, set: setRappelPointage, id: 'notif-pointage' },
            { label: FR.settings.seanceModifiee, val: seanceModifiee, set: setSeanceModifiee, id: 'notif-seance' },
            { label: FR.settings.edtManquant, val: edtManquant, set: setEdtManquant, id: 'notif-edt' },
            { label: FR.settings.rappelDevoir, val: rappelDevoir, set: setRappelDevoir, id: 'notif-devoir' },
            { label: FR.settings.rappelExamen, val: rappelExamen, set: setRappelExamen, id: 'notif-examen' },
          ].map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2.5 border-b border-[#E5E7EB] dark:border-[#262B35] last:border-0"
            >
              <label htmlFor={item.id} className="text-sm text-[#111827] dark:text-[#F3F4F6] font-medium cursor-pointer pr-4 flex-1">
                {item.label}
              </label>
              <ToggleSwitch id={item.id} checked={item.val} onChange={item.set} />
            </div>
          ))}
        </div>

        <div className="p-3 rounded-btn bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900/40 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          <span className="font-semibold text-indigo-700 dark:text-indigo-300">Heures calmes :</span> Aucun email ni notification sonore entre 23:00 et 07:00.
        </div>
      </Card>

      {/* 5. Gestion des Invitations */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center">
              <KeyRound className="w-4 h-4 mr-2 text-indigo-500" />
              {FR.settings.invitations}
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
              Inscription sur invitation uniquement. Code maître permanent : <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">ESP2026</span>
            </p>
          </div>

          <Button size="sm" onClick={handleCreateInvitation}>
            Générer
          </Button>
        </div>

        {createdCode && (
          <div className="p-3 rounded-btn bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
            <span>Nouveau code généré : <strong className="font-mono">{createdCode}</strong></span>
            <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(createdCode)}>
              Copier
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {invitations.map(inv => (
            <div
              key={inv.id}
              className="flex items-center justify-between p-2.5 rounded-btn bg-[#F7F8FA] dark:bg-[#0E1014] border border-[#E5E7EB] dark:border-[#262B35] text-xs font-mono"
            >
              <div className="flex items-center space-x-2">
                <span className={inv.revoquee ? "line-through text-gray-400" : "font-bold text-[#111827] dark:text-[#F3F4F6]"}>
                  {inv.code}
                </span>
                {inv.revoquee && <Badge variant="outline" size="sm">Révoqué</Badge>}
              </div>

              {!inv.revoquee && (
                <button
                  type="button"
                  onClick={() => handleRevokeInvitation(inv.id)}
                  className="text-red-500 hover:underline text-[11px]"
                >
                  Révoquer
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* 6. Export et Suppression des Données */}
      <Card className="space-y-3">
        <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] flex items-center">
          <Shield className="w-4 h-4 mr-2 text-indigo-500" />
          {FR.settings.confidentialite}
        </h3>
        <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
          Conformité avec la loi sénégalaise 2008-12 sur la protection des données personnelles. Tes données restent isolées sur ton profil.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            variant="outline"
            icon={<Download className="w-4 h-4" />}
            onClick={handleExportJson}
            className="text-xs"
          >
            {FR.settings.exportDonnees}
          </Button>

          <Button
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setConfirmDeleteOpen(true)}
            className="text-xs"
          >
            {FR.settings.supprimerCompte}
          </Button>
        </div>
      </Card>

      {/* Confirmation suppression compte */}
      <BottomSheet
        isOpen={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Supprimer le compte"
      >
        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3 p-3 rounded-[var(--elizo-radius-btn)] bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300">
              <p className="font-semibold">Cette action est irréversible.</p>
              <p className="text-xs mt-1 text-red-700 dark:text-red-400">Toutes tes données (EDT, présences, notes, devoirs, révisions, clubs) seront définitivement supprimées.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setConfirmDeleteOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => { setConfirmDeleteOpen(false); handleDeleteAccount(); }}
            >
              Supprimer définitivement
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
