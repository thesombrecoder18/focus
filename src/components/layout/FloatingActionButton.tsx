import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, CheckSquare, Calendar, BookmarkCheck, Upload, X } from 'lucide-react';
import { FR } from '@/i18n/fr';
import { clsx } from 'clsx';

interface FABProps {
  onOpenDevoir: () => void;
  onOpenEvenement: () => void;
  onOpenRevision: () => void;
  onOpenImport: () => void;
}

export const FloatingActionButton: React.FC<FABProps> = ({
  onOpenDevoir,
  onOpenEvenement,
  onOpenRevision,
  onOpenImport,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: FR.actions.importer,
      icon: <Upload className="w-4 h-4" />,
      bg: 'bg-indigo-600',
      onClick: onOpenImport,
    },
    {
      label: FR.actions.nouveauDevoir,
      icon: <CheckSquare className="w-4 h-4" />,
      bg: 'bg-amber-500',
      onClick: onOpenDevoir,
    },
    {
      label: FR.actions.nouvelEvenement,
      icon: <Calendar className="w-4 h-4" />,
      bg: 'bg-cyan-500',
      onClick: onOpenEvenement,
    },
    {
      label: FR.actions.nouvelleRevision,
      icon: <BookmarkCheck className="w-4 h-4" />,
      bg: 'bg-emerald-500',
      onClick: onOpenRevision,
    },
  ];

  return (
    // bottom-16 = hauteur exacte de la TabBar (h-14 + safe area env)
    // On utilise bottom-[72px] pour laisser de l'espace confortable
    <div className="lg:hidden fixed bottom-[72px] right-4 z-50 flex flex-col items-end">
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[-1] bg-black/20 dark:bg-black/40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Speed dial items */}
      <div
        className={clsx(
          'flex flex-col items-end gap-2 mb-3 transition-all duration-200 ease-out',
          isOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-2 pointer-events-none'
        )}
        aria-hidden={!isOpen}
      >
        {actions.map((action, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setIsOpen(false);
              action.onClick();
            }}
            className="flex items-center gap-2.5 active:scale-95 transition-transform duration-100"
            style={{ transitionDelay: isOpen ? `${idx * 30}ms` : '0ms' }}
          >
            <span className="bg-white dark:bg-[#1B1F27] text-[#111827] dark:text-[#F3F4F6] text-xs font-semibold px-3 py-1.5 rounded-full shadow-md border border-[#E5E7EB] dark:border-[#262B35] whitespace-nowrap">
              {action.label}
            </span>
            <div className={clsx('w-10 h-10 rounded-full flex items-center justify-center text-white shadow-lg flex-shrink-0', action.bg)}>
              {action.icon}
            </div>
          </button>
        ))}
      </div>

      {/* Main FAB */}
      <button
        type="button"
        onClick={() => setIsOpen(o => !o)}
        aria-label={isOpen ? 'Fermer le menu rapide' : 'Ouvrir le menu rapide'}
        aria-expanded={isOpen}
        className={clsx(
          'w-13 h-13 w-[52px] h-[52px] rounded-full text-white shadow-xl flex items-center justify-center transition-all duration-250 ease-out active:scale-95',
          isOpen
            ? 'bg-[#1F2937] dark:bg-[#374151] rotate-45'
            : 'bg-[#4F46E5] dark:bg-[#818CF8] dark:text-[#0F1117]'
        )}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </button>
    </div>
  );
};
