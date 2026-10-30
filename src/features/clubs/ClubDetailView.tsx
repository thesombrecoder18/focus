import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { FR } from '@/i18n/fr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { ClubFormModal } from './ClubFormModal';
import {
  ReunionFormModal,
  TacheFormModal,
  CompteRenduFormModal,
  ContactFormModal,
} from './ClubForms';
import { formatDateFr } from '@/lib/date';
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  CheckSquare,
  FileText,
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  Circle,
  Phone,
  MessageCircle,
  Mail,
  ChevronRight,
} from 'lucide-react';
import { clsx } from 'clsx';

type ClubTab = 'reunions' | 'taches' | 'comptesRendus' | 'contacts';

type DeleteTarget =
  | { kind: 'club'; id: string; label: string }
  | { kind: 'reunion'; id: string; label: string }
  | { kind: 'tache'; id: string; label: string }
  | { kind: 'compteRendu'; id: string; label: string }
  | { kind: 'contact'; id: string; label: string };

export const ClubDetailView: React.FC = () => {
  const { clubId } = useParams<{ clubId: string }>();
  const navigate = useNavigate();
  const {
    isLoading,
    clubs,
    reunionsClub,
    tachesClub,
    comptesRendus,
    contactsClub,
    updateClub,
    deleteClub,
    createReunionClub,
    deleteReunionClub,
    createTacheClub,
    toggleTacheClub,
    deleteTacheClub,
    createCompteRendu,
    deleteCompteRendu,
    createContactClub,
    deleteContactClub,
  } = useData();

  const [activeTab, setActiveTab] = useState<ClubTab>('reunions');
  const [isClubFormOpen, setIsClubFormOpen] = useState(false);
  const [isReunionFormOpen, setIsReunionFormOpen] = useState(false);
  const [isTacheFormOpen, setIsTacheFormOpen] = useState(false);
  const [isCompteRenduFormOpen, setIsCompteRenduFormOpen] = useState(false);
  const [isContactFormOpen, setIsContactFormOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const club = clubs.find(c => c.id === clubId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="space-y-4 pb-24">
        <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/clubs')}>
          {FR.clubs.retourListe}
        </Button>
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title={FR.clubs.aucunClubTitre}
          description={FR.clubs.aucunClubDescription}
          actionLabel={FR.clubs.retourListe}
          onAction={() => navigate('/clubs')}
        />
      </div>
    );
  }

  const now = new Date();

  const reunions = reunionsClub
    .filter(r => r.clubId === club.id)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const taches = tachesClub
    .filter(t => t.clubId === club.id)
    .sort((a, b) => {
      if (a.statut !== b.statut) return a.statut === 'ouverte' ? -1 : 1;
      if (!a.echeance && !b.echeance) return 0;
      if (!a.echeance) return 1;
      if (!b.echeance) return -1;
      return new Date(a.echeance).getTime() - new Date(b.echeance).getTime();
    });

  const comptes = comptesRendus
    .filter(cr => cr.clubId === club.id)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const contacts = contactsClub.filter(c => c.clubId === club.id);
  const openTasks = taches.filter(t => t.statut === 'ouverte').length;
  const nextReunion = reunions.find(r => new Date(r.date) >= now);

  const recurrenceLabel = (value?: string) => {
    if (value === 'hebdomadaire') return FR.clubs.recurrences.hebdomadaire;
    if (value === 'mensuelle') return FR.clubs.recurrences.mensuelle;
    return value;
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    switch (deleteTarget.kind) {
      case 'club':
        await deleteClub(deleteTarget.id);
        setDeleteTarget(null);
        navigate('/clubs');
        return;
      case 'reunion':
        await deleteReunionClub(deleteTarget.id);
        break;
      case 'tache':
        await deleteTacheClub(deleteTarget.id);
        break;
      case 'compteRendu':
        await deleteCompteRendu(deleteTarget.id);
        break;
      case 'contact':
        await deleteContactClub(deleteTarget.id);
        break;
    }

    setDeleteTarget(null);
  };

  const tabs: { id: ClubTab; label: string; count: number; icon: typeof Calendar }[] = [
    { id: 'reunions', label: FR.clubs.onglets.reunions, count: reunions.length, icon: Calendar },
    { id: 'taches', label: FR.clubs.onglets.taches, count: openTasks, icon: CheckSquare },
    { id: 'comptesRendus', label: FR.clubs.onglets.comptesRendus, count: comptes.length, icon: FileText },
    { id: 'contacts', label: FR.clubs.onglets.contacts, count: contacts.length, icon: Users },
  ];

  return (
    <div className="space-y-4 pb-24">
      <Button variant="ghost" size="sm" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate('/clubs')}>
        {FR.clubs.retourListe}
      </Button>

      <Card colorBar={club.couleur} className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-extrabold text-[#111827] dark:text-[#F3F4F6] tracking-tight truncate">
              {club.nom}
            </h1>
            <div className="mt-1">
              <Badge variant="secondary" size="sm">{club.role}</Badge>
            </div>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsClubFormOpen(true)}
              aria-label={FR.clubs.modifier}
              className="p-2 rounded-btn text-[#6B7280] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setDeleteTarget({ kind: 'club', id: club.id, label: club.nom })}
              aria-label={FR.clubs.supprimer}
              className="p-2 rounded-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB]/50 dark:border-[#262B35]/50 text-xs">
          <div className="min-w-0">
            <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{FR.clubs.prochaineReunion}</span>
            <p className="font-semibold text-[#111827] dark:text-[#F3F4F6] truncate">
              {nextReunion
                ? `${nextReunion.titre} · ${formatDateFr(nextReunion.date, 'EEE d MMM · HH:mm')}`
                : FR.clubs.aucuneReunion}
            </p>
          </div>
          <div>
            <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">{FR.clubs.onglets.taches}</span>
            <p className="font-semibold text-[#111827] dark:text-[#F3F4F6]">
              {FR.clubs.tachesOuvertes.replace('{n}', String(openTasks))}
            </p>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F7F8FA] dark:bg-[#0E1014] rounded-btn overflow-x-auto no-scrollbar">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center justify-center whitespace-nowrap px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex-1",
                isActive
                  ? "bg-white dark:bg-[#161A21] text-indigo-600 dark:text-indigo-400 shadow-xs"
                  : "text-[#6B7280] dark:text-[#9CA3AF] hover:text-[#111827] dark:hover:text-[#F3F4F6]"
              )}
            >
              <Icon className="w-3.5 h-3.5 mr-1.5" />
              {tab.label}
              <span className={clsx(
                "ml-1.5 px-1.5 py-0.5 rounded-full text-[10px]",
                isActive ? "bg-indigo-50 dark:bg-indigo-950/60" : "bg-black/5 dark:bg-white/10"
              )}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Réunions */}
      {activeTab === 'reunions' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
              {FR.clubs.reunions.titre}
            </h2>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsReunionFormOpen(true)}>
              {FR.actions.ajouter}
            </Button>
          </div>

          {reunions.length === 0 ? (
            <EmptyState
              icon={<Calendar className="w-8 h-8" />}
              description={FR.clubs.reunions.aucune}
              actionLabel={FR.clubs.reunions.ajouter}
              onAction={() => setIsReunionFormOpen(true)}
            />
          ) : (
            <div className="space-y-2">
              {reunions.map(reunion => (
                <Card key={reunion.id} className="p-3 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] truncate">
                        {reunion.titre}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1">
                        <span className="flex items-center">
                          <Clock className="w-3.5 h-3.5 mr-1" />
                          {formatDateFr(reunion.date, 'EEE d MMM yyyy · HH:mm')}
                        </span>
                        {reunion.lieu && (
                          <span className="flex items-center">
                            <MapPin className="w-3.5 h-3.5 mr-1" />
                            {reunion.lieu}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {reunion.recurrence && (
                        <Badge variant="outline" size="sm">{recurrenceLabel(reunion.recurrence)}</Badge>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ kind: 'reunion', id: reunion.id, label: reunion.titre })}
                        aria-label={FR.clubs.reunions.supprimer}
                        className="p-1.5 rounded-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tâches */}
      {activeTab === 'taches' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
              {FR.clubs.taches.titre}
            </h2>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsTacheFormOpen(true)}>
              {FR.actions.ajouter}
            </Button>
          </div>

          {taches.length === 0 ? (
            <EmptyState
              icon={<CheckSquare className="w-8 h-8" />}
              description={FR.clubs.taches.aucune}
              actionLabel={FR.clubs.taches.ajouter}
              onAction={() => setIsTacheFormOpen(true)}
            />
          ) : (
            <div className="space-y-2">
              {taches.map(tache => {
                const isDone = tache.statut === 'faite';
                const isLate = !isDone && tache.echeance && new Date(tache.echeance) < now;

                return (
                  <Card key={tache.id} className="p-3">
                    <div className="flex items-start gap-2.5">
                      <button
                        type="button"
                        onClick={() => toggleTacheClub(tache.id)}
                        aria-label={isDone ? FR.clubs.taches.marquerOuverte : FR.clubs.taches.marquerFaite}
                        className={clsx(
                          "mt-0.5 flex-shrink-0 transition-colors",
                          isDone ? "text-emerald-500" : "text-[#9CA3AF] hover:text-emerald-500"
                        )}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <p className={clsx(
                          "text-sm font-semibold truncate",
                          isDone
                            ? "line-through text-[#9CA3AF] dark:text-[#6B7280]"
                            : "text-[#111827] dark:text-[#F3F4F6]"
                        )}>
                          {tache.titre}
                        </p>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-0.5 text-[11px]">
                          {tache.echeance && (
                            <span className={clsx(
                              "flex items-center",
                              isLate ? "text-red-500 font-semibold" : "text-[#6B7280] dark:text-[#9CA3AF]"
                            )}>
                              <Clock className="w-3 h-3 mr-1" />
                              {formatDateFr(tache.echeance, 'd MMM yyyy · HH:mm')}
                            </span>
                          )}
                          {isLate && <Badge variant="danger" size="sm">{FR.clubs.taches.enRetard}</Badge>}
                          <Badge variant={isDone ? 'success' : 'outline'} size="sm">
                            {isDone ? FR.clubs.taches.faite : FR.clubs.taches.ouverte}
                          </Badge>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ kind: 'tache', id: tache.id, label: tache.titre })}
                        aria-label={FR.clubs.taches.supprimer}
                        className="flex-shrink-0 p-1.5 rounded-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Comptes rendus */}
      {activeTab === 'comptesRendus' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
              {FR.clubs.comptesRendus.titre}
            </h2>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsCompteRenduFormOpen(true)}>
              {FR.actions.ajouter}
            </Button>
          </div>

          {comptes.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-8 h-8" />}
              description={FR.clubs.comptesRendus.aucune}
              actionLabel={FR.clubs.comptesRendus.ajouter}
              onAction={() => setIsCompteRenduFormOpen(true)}
            />
          ) : (
            <div className="space-y-2">
              {comptes.map(cr => {
                const reunion = cr.reunionId ? reunions.find(r => r.id === cr.reunionId) : undefined;
                return (
                  <Card key={cr.id} className="p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#111827] dark:text-[#F3F4F6]">
                          {formatDateFr(cr.date, 'd MMMM yyyy')}
                        </p>
                        {reunion && (
                          <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                            {reunion.titre}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ kind: 'compteRendu', id: cr.id, label: formatDateFr(cr.date, 'd MMMM yyyy') })}
                        aria-label={FR.clubs.comptesRendus.supprimer}
                        className="p-1.5 rounded-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-[#374151] dark:text-[#D1D5DB] whitespace-pre-line leading-relaxed">
                      {cr.contenu}
                    </p>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Contacts */}
      {activeTab === 'contacts' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#6B7280] dark:text-[#9CA3AF]">
              {FR.clubs.contacts.titre}
            </h2>
            <Button size="sm" icon={<Plus className="w-4 h-4" />} onClick={() => setIsContactFormOpen(true)}>
              {FR.actions.ajouter}
            </Button>
          </div>

          {contacts.length === 0 ? (
            <EmptyState
              icon={<Users className="w-8 h-8" />}
              description={FR.clubs.contacts.aucune}
              actionLabel={FR.clubs.contacts.ajouter}
              onAction={() => setIsContactFormOpen(true)}
            />
          ) : (
            <div className="space-y-2">
              {contacts.map(contact => {
                const phoneDigits = contact.telephone?.replace(/\D/g, '') || '';
                return (
                  <Card key={contact.id} className="p-3">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                        style={{ backgroundColor: club.couleur }}
                      >
                        {contact.nom.slice(0, 1).toUpperCase()}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] truncate">
                          {contact.nom}
                        </p>
                        {contact.role && (
                          <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF] truncate">
                            {contact.role}
                          </p>
                        )}

                        {(contact.telephone || contact.email) && (
                          <div className="flex flex-wrap items-center gap-1.5 mt-2">
                            {contact.telephone && (
                              <a
                                href={`tel:${contact.telephone}`}
                                className="inline-flex items-center px-2 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition-colors"
                              >
                                <Phone className="w-3 h-3 mr-1" />
                                {FR.clubs.contacts.appeler}
                              </a>
                            )}
                            {phoneDigits && (
                              <a
                                href={`https://wa.me/${phoneDigits}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium hover:bg-emerald-100 dark:hover:bg-emerald-950/70 transition-colors"
                              >
                                <MessageCircle className="w-3 h-3 mr-1" />
                                {FR.clubs.contacts.whatsapp}
                              </a>
                            )}
                            {contact.email && (
                              <a
                                href={`mailto:${contact.email}`}
                                className="inline-flex items-center px-2 py-1 rounded-full bg-[#F3F4F6] dark:bg-[#262B35] text-[#374151] dark:text-[#D1D5DB] text-[11px] font-medium hover:bg-[#E5E7EB] dark:hover:bg-[#323846] transition-colors"
                              >
                                <Mail className="w-3 h-3 mr-1" />
                                {contact.email}
                              </a>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => setDeleteTarget({ kind: 'contact', id: contact.id, label: contact.nom })}
                        aria-label={FR.clubs.contacts.supprimer}
                        className="flex-shrink-0 p-1.5 rounded-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <ClubFormModal
        isOpen={isClubFormOpen}
        onClose={() => setIsClubFormOpen(false)}
        club={club}
        onSave={async data => { await updateClub(club.id, data); }}
      />

      <ReunionFormModal
        isOpen={isReunionFormOpen}
        onClose={() => setIsReunionFormOpen(false)}
        clubId={club.id}
        onSave={async data => { await createReunionClub(data); }}
      />

      <TacheFormModal
        isOpen={isTacheFormOpen}
        onClose={() => setIsTacheFormOpen(false)}
        clubId={club.id}
        onSave={async data => { await createTacheClub(data); }}
      />

      <CompteRenduFormModal
        isOpen={isCompteRenduFormOpen}
        onClose={() => setIsCompteRenduFormOpen(false)}
        clubId={club.id}
        reunions={[...reunions].reverse()}
        onSave={async data => { await createCompteRendu(data); }}
      />

      <ContactFormModal
        isOpen={isContactFormOpen}
        onClose={() => setIsContactFormOpen(false)}
        clubId={club.id}
        onSave={async data => { await createContactClub(data); }}
      />

      {/* Delete confirmation */}
      <BottomSheet
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title={deleteTarget?.kind === 'club' ? FR.clubs.supprimer : FR.actions.supprimer}
      >
        <div className="space-y-4 pt-2">
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            {deleteTarget?.kind === 'club'
              ? FR.clubs.confirmerSuppression
              : FR.clubs.confirmerSuppressionElement.replace('{label}', deleteTarget?.label || '')}
          </p>
          <div className="flex space-x-2">
            <Button type="button" variant="outline" fullWidth onClick={() => setDeleteTarget(null)}>
              {FR.actions.annuler}
            </Button>
            <Button type="button" variant="danger" fullWidth onClick={handleConfirmDelete}>
              {FR.actions.supprimer}
            </Button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
};
