import React from 'react';
import { FR } from '@/i18n/fr';
import { Badge } from '@/components/ui/Badge';
import { Users, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export const ClubsPlaceholder: React.FC = () => {
  return (
    <div className="space-y-4 pb-16 max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#111827] dark:text-[#F3F4F6] tracking-tight">
            {FR.nav.clubs}
          </h1>
          <p className="text-sm text-[#6B7280] dark:text-[#9CA3AF]">
            Espaces personnels de suivi associatif et de club.
          </p>
        </div>
        <Badge variant="info" size="md">Phase 2 (V1.1)</Badge>
      </div>

      {/* Demo club preview from Section 10 */}
      <Card colorBar="#7C3AED" className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6]">
              Com Soc (Commission Sociale)
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-0.5">
              ESP Dakar · Activités et vie de campus
            </p>
          </div>
          <Badge variant="outline" size="sm">Membre</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-[#E5E7EB]/50 dark:border-[#262B35]/50">
          <div className="flex items-center text-[#6B7280] dark:text-[#9CA3AF]">
            <Calendar className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
            <span>Réunion Hebdomadaire (Vendredi)</span>
          </div>
          <div className="flex items-center text-[#6B7280] dark:text-[#9CA3AF]">
            <CheckSquare className="w-3.5 h-3.5 mr-1.5 text-purple-500" />
            <span>0 tâche en attente</span>
          </div>
        </div>
      </Card>

      <div className="p-4 rounded-card bg-[#F7F8FA] dark:bg-[#161A21]/40 border border-dashed border-[#E5E7EB] dark:border-[#262B35] text-xs text-[#6B7280] dark:text-[#9CA3AF] space-y-2">
        <p className="font-semibold text-[#111827] dark:text-[#F3F4F6] flex items-center">
          <Sparkles className="w-4 h-4 mr-1.5 text-indigo-500" />
          Arrive en Phase 2 :
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>Fiches réunions (date, lieu, récurrence synchronisée au calendrier)</li>
          <li>Tâches de club avec rappel dans le tableau de bord Aujourd'hui</li>
          <li>Comptes rendus et contacts de club (appel WhatsApp en 1 tap)</li>
        </ul>
      </div>
    </div>
  );
};
