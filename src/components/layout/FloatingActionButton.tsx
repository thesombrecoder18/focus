import React, { useState } from 'react';
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
    { label: FR.actions.importer, icon: <Upload className="w-4 h-4" />, color: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400", onClick: onOpenImport },
    { label: FR.actions.nouveauDevoir, icon: <CheckSquare className="w-4 h-4" />, color: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400", onClick: onOpenDevoir },
    { label: FR.actions.nouvelEvenement, icon: <Calendar className="w-4 h-4" />, color: "bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400", onClick: onOpenEvenement },
    { label: FR.actions.nouvelleRevision, icon: <BookmarkCheck className="w-4 h-4" />, color: "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400", onClick: onOpenRevision },
  ];

  return (
    <div className="lg:hidden fixed bottom-24 right-4 z-50 flex flex-col items-end">
      {/* Backdrop when FAB menu is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Speed dial items */}
      {isOpen && (
        <div className="flex flex-col items-end space-y-2 mb-2 z-40">
          {actions.map((action, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setIsOpen(false);
                action.onClick();
              }}
              className="flex items-center px-3.5 py-2 rounded-full bg-white dark:bg-[#161922] border border-[#E5E7EB] dark:border-[#262B35] shadow-md text-xs font-semibold text-[#111827] dark:text-[#F3F4F6] active:scale-95 transition-all duration-200"
            >
              <span className="mr-2 whitespace-nowrap">{action.label}</span>
              <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0", action.color)}>
                {action.icon}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Main FAB trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "w-14 h-14 min-w-[56px] min-h-[56px] rounded-full bg-[#4F46E5] dark:bg-[#818CF8] text-white dark:text-[#0F1117] shadow-xl flex items-center justify-center z-40 transition-all duration-300 ease-in-out active:scale-95",
          isOpen && "rotate-45 bg-[#DC2626] dark:bg-[#DC2626]"
        )}
        aria-label="Actions rapides"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </button>
    </div>
  );
};
