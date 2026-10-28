import React from 'react';
import { FR } from '@/i18n/fr';
import { Badge } from '@/components/ui/Badge';
import { BookMarked, Lock, Sparkles } from 'lucide-react';

export const JournalPlaceholder: React.FC = () => {
  return (
    <div className="space-y-4 pb-16 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] dark:text-[#F3F4F6] tracking-tight">
            {FR.nav.journal}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Journal personnel, humeur et réflexions d'études.
          </p>
        </div>
        <Badge variant="default" size="md">Phase 3 (V1.2)</Badge>
      </div>

      <div className="p-8 text-center rounded-card bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] space-y-4">
        <div className="w-14 h-14 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
          <BookMarked className="w-7 h-7" />
        </div>

        <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6]">
          Journal intime d'étudiant
        </h3>

        <p className="text-xs sm:text-sm text-[#6B7280] dark:text-[#9CA3AF] max-w-md mx-auto leading-relaxed">
          Un espace de recul sur tes journées d'études et de travail. Données strictement privées avec sauvegarde automatique et verrouillage sécurisé.
        </p>

        <div className="text-left p-4 rounded-btn bg-[#F7F8FA] dark:bg-[#0E1014] border border-[#E5E7EB] dark:border-[#262B35] text-xs text-[#6B7280] dark:text-[#9CA3AF] space-y-1.5">
          <p className="font-semibold text-[#111827] dark:text-[#F3F4F6] flex items-center">
            <Lock className="w-4 h-4 mr-1.5 text-purple-500" />
            Sécurité & Confidentialité :
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Plusieurs entrées datées par jour avec tags et humeur</li>
            <li>Recherche rapide et filtres temporels</li>
            <li>Verrouillage par code secret (Phase 4)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
