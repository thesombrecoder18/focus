import React, { useState } from 'react';
import { Seance, Presence } from '@/types';
import { Badge } from '../ui/Badge';
import { PointageModal } from './PointageModal';
import { EditSeanceModal } from './EditSeanceModal';
import { FR } from '@/i18n/fr';
import { hasSessionStarted, isSessionOngoing } from '@/lib/date';
import {
  MapPin,
  Video,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
  HelpCircle,
  MoreVertical,
  Check
} from 'lucide-react';
import { clsx } from 'clsx';

interface SeanceCardProps {
  seance: Seance;
  presence?: Presence;
  onPointerQuick?: () => void;
  showDate?: boolean;
}

export const SeanceCard: React.FC<SeanceCardProps> = ({
  seance,
  presence,
  showDate = false,
}) => {
  const [isPointageOpen, setIsPointageOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const isOngoing = isSessionOngoing(seance.date, seance.debut, seance.fin);
  const canPoint = hasSessionStarted(seance.date, seance.debut);
  const isCancelled = seance.statut === 'annulee' || seance.statut === 'non_tenue';
  const isProvisoire = seance.statut === 'provisoire';
  const needsPointing = canPoint && !presence && !isCancelled;

  // Presence badge / state configuration
  const getPresenceBadge = () => {
    if (!presence) {
      if (needsPointing) {
        return (
          <Badge variant="outline" size="sm" className="border-indigo-400 text-indigo-600 dark:text-indigo-400 font-semibold animate-pulse">
            À pointer
          </Badge>
        );
      }
      return null;
    }

    switch (presence.statut) {
      case 'present':
        return (
          <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3.5 h-3.5" />}>
            Présent·e
          </Badge>
        );
      case 'absent':
        return (
          <Badge variant="danger" size="sm" icon={<XCircle className="w-3.5 h-3.5" />}>
            Absent·e
          </Badge>
        );
      case 'retard':
        return (
          <Badge variant="warning" size="sm" icon={<Clock className="w-3.5 h-3.5" />}>
            {presence.minutesRetard ? `+${presence.minutesRetard}m` : 'En retard'}
          </Badge>
        );
      case 'excuse':
        return (
          <Badge variant="default" size="sm" icon={<HelpCircle className="w-3.5 h-3.5" />}>
            Excusé·e
          </Badge>
        );
      case 'non_tenu':
        return (
          <Badge variant="outline" size="sm">
            Non tenu
          </Badge>
        );
    }
  };

  return (
    <>
      <div
        className={clsx(
          "relative flex bg-white dark:bg-[#161A21] rounded-card border transition-all duration-150 overflow-hidden",
          needsPointing && "ring-1 ring-indigo-500/40 border-indigo-400 dark:border-indigo-500/40",
          isProvisoire && "border-dashed border-amber-300 dark:border-amber-700/60",
          !needsPointing && !isProvisoire && "border-[#E5E7EB] dark:border-[#262B35]",
          isCancelled && "opacity-60 bg-gray-50 dark:bg-[#12141a]",
          "shadow-xs hover:shadow-sm"
        )}
      >
        {/* Left modality vertical color bar */}
        <div
          className={clsx(
            "w-2 flex-shrink-0",
            seance.modalite === 'en_ligne' ? "bg-[#0B67A7]" : "bg-[#8D662F]"
          )}
        />

        <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between">
          {/* Top row: Schedule, Modality pill, Presence badge, Action */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1.5">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] font-mono">
                {seance.debut} – {seance.fin}
              </span>
              {showDate && (
                <span className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                  ({seance.date})
                </span>
              )}
              {isOngoing && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5">
              {/* Modality badge */}
              <Badge variant={seance.modalite} size="sm">
                {seance.modalite === 'en_ligne' ? (
                  <span className="flex items-center">
                    <Video className="w-3 h-3 mr-1" />
                    En ligne
                  </span>
                ) : (
                  <span className="flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    Présentiel
                  </span>
                )}
              </Badge>

              {getPresenceBadge()}

              {isProvisoire && (
                <Badge variant="warning" size="sm">
                  {FR.etudes.semaines.aConfirmer}
                </Badge>
              )}

              {/* Edit button */}
              <button
                type="button"
                onClick={() => setIsEditOpen(true)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B7280] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5 active:scale-95"
                title="Modifier la séance"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Subject title on 2 lines max */}
          <div className="my-1 cursor-pointer" onClick={() => setIsEditOpen(true)}>
            <h3
              className={clsx(
                "text-base font-semibold leading-snug tracking-tight text-[#111827] dark:text-[#F3F4F6] line-clamp-2",
                isCancelled && "line-through text-[#6B7280] dark:text-[#9CA3AF]"
              )}
            >
              {seance.intituleRecu}
            </h3>
            {seance.intervenant && (
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5 font-medium">
                {seance.intervenant}
              </p>
            )}
          </div>

          {/* Bottom row: Location / Join link + 1-touch Presence button */}
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-[#E5E7EB]/50 dark:border-[#262B35]/50 text-xs">
            {/* Location or Join */}
            <div className="flex items-center text-[#6B7280] dark:text-[#9CA3AF] truncate max-w-[60%]">
              {seance.modalite === 'en_ligne' && seance.lien ? (
                <a
                  href={seance.lien}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-[#0B67A7] dark:text-[#7DD3FC] font-semibold hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                  <span>{FR.actions.rejoindre}</span>
                </a>
              ) : (
                <span className="flex items-center truncate">
                  <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-[#8D662F]" />
                  <span className="truncate">{seance.salle || 'Salle 102'}</span>
                </span>
              )}
            </div>

            {/* Point button */}
            {!isCancelled && (
              <button
                type="button"
                onClick={() => setIsPointageOpen(true)}
                className={clsx(
                  "px-3 py-1.5 rounded-btn font-semibold text-xs flex items-center transition-all select-none active:scale-95",
                  presence
                    ? "bg-[#E5E7EB]/60 hover:bg-[#E5E7EB] dark:bg-[#262B35] dark:hover:bg-[#323846] text-[#111827] dark:text-[#F3F4F6]"
                    : needsPointing
                    ? "bg-[#4F46E5] hover:bg-[#4338CA] text-white dark:bg-[#818CF8] dark:text-[#0E1014] shadow-sm"
                    : "opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-800 text-gray-500"
                )}
                disabled={!canPoint}
                title={!canPoint ? FR.presence.impossibleFutur : undefined}
              >
                {presence ? (
                  <>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    Pointé
                  </>
                ) : (
                  <>Pointer</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <PointageModal
        isOpen={isPointageOpen}
        onClose={() => setIsPointageOpen(false)}
        seance={seance}
      />

      <EditSeanceModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        seance={seance}
      />
    </>
  );
};
