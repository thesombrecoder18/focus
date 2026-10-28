import React from 'react';
import { FR } from '@/i18n/fr';
import { Badge } from '@/components/ui/Badge';
import { BookmarkCheck, Timer, Sparkles } from 'lucide-react';

export const RevisionsPlaceholder: React.FC = () => {
  return (
    <div className="space-y-4 pb-16 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] dark:text-[#F3F4F6] tracking-tight">
            {FR.nav.revisions}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Planification de sessions de révision dans tes créneaux libres.
          </p>
        </div>
        <Badge variant="info" size="md">Phase 2 (V1.1)</Badge>
      </div>

      <div className="p-8 text-center rounded-card bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
          <Timer className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6]">
          Planification de révisions & Minuteur
        </h3>

        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
          En Phase 2, planifie directement tes séances de travail dans les créneaux libres calculés entre tes cours du soir et tes examens, avec un minuteur de concentration dédié.
        </p>

        <div className="text-left p-4 rounded-btn bg-[#F7F8FA] dark:bg-[#0E1014] border border-[#E5E7EB] dark:border-[#262B35] text-xs text-[#6B7280] dark:text-[#9CA3AF] space-y-1.5">
          <p className="font-semibold text-[#111827] dark:text-[#F3F4F6] flex items-center">
            <Sparkles className="w-4 h-4 mr-1.5 text-emerald-500" />
            Fonctionnalités :
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Liaison directe avec les examens à venir</li>
            <li>Minuteur Pomodoro / concentration intégrée</li>
            <li>Cumul d'heures révisées par matière</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
