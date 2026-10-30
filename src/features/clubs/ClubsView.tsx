import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { FR } from '@/i18n/fr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ClubFormModal } from './ClubFormModal';
import { formatDateFr } from '@/lib/date';
import { Users, Plus, Calendar, CheckSquare, ChevronRight } from 'lucide-react';

export const ClubsView: React.FC = () => {
  const { clubs, reunionsClub, tachesClub, createClub } = useData();
  const navigate = useNavigate();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const now = new Date();

  const getNextReunion = (clubId: string) => {
    return reunionsClub
      .filter(r => r.clubId === clubId && new Date(r.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
  };

  const getOpenTasksCount = (clubId: string) => {
    return tachesClub.filter(t => t.clubId === clubId && t.statut === 'ouverte').length;
  };

  return (
    <div className="space-y-5 pb-24">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] dark:text-[#F3F4F6] tracking-tight">
            {FR.clubs.titre}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">{FR.clubs.sousTitre}</p>
        </div>
        <Button
          size="sm"
          icon={<Plus className="w-4 h-4" />}
          onClick={() => setIsFormOpen(true)}
          className="flex-shrink-0"
        >
          {FR.clubs.nouveauClub}
        </Button>
      </div>

      {clubs.length === 0 ? (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title={FR.clubs.aucunClubTitre}
          description={FR.clubs.aucunClubDescription}
          actionLabel={FR.clubs.nouveauClub}
          onAction={() => setIsFormOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {clubs.map(club => {
            const nextReunion = getNextReunion(club.id);
            const openTasks = getOpenTasksCount(club.id);

            return (
              <Card
                key={club.id}
                colorBar={club.couleur}
                isClickable
                role="button"
                tabIndex={0}
                onClick={() => navigate(`/clubs/${club.id}`)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/clubs/${club.id}`);
                  }
                }}
                className="space-y-3 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6] leading-snug">
                    {club.nom}
                  </h3>
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <Badge variant="secondary" size="sm">{club.role}</Badge>
                    <ChevronRight className="w-4 h-4 text-[#9CA3AF]" />
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  <div className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" style={{ color: club.couleur }} />
                    <span className="truncate">
                      {nextReunion
                        ? `${nextReunion.titre} · ${formatDateFr(nextReunion.date, 'EEE d MMM · HH:mm')}`
                        : FR.clubs.aucuneReunion}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <CheckSquare className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" style={{ color: club.couleur }} />
                    <span>{FR.clubs.tachesOuvertes.replace('{n}', String(openTasks))}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ClubFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={async data => { await createClub(data); }}
      />
    </div>
  );
};
