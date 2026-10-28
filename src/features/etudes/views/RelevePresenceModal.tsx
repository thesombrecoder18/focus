import React from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useData } from '@/context/DataContext';
import { CheckCircle2, AlertTriangle, Printer, Download, Clock, ShieldCheck } from 'lucide-react';

interface RelevePresenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RelevePresenceModal: React.FC<RelevePresenceModalProps> = ({ isOpen, onClose }) => {
  const {
    matieres,
    matieresStats,
    globalPresenceRate,
    activeSemestre,
    allSeances,
    presences,
  } = useData();

  // Compute total planned vs attended hours
  let totalHoursPlanned = 0;
  let totalHoursAttended = 0;

  allSeances.forEach(s => {
    if (s.statut === 'annulee' || s.statut === 'non_tenue') return;
    const [hDeb, mDeb] = s.debut.split(':').map(Number);
    const [hFin, mFin] = s.fin.split(':').map(Number);
    const durationHours = (hFin * 60 + mFin - (hDeb * 60 + mDeb)) / 60;

    totalHoursPlanned += durationHours;

    const pres = presences.find(p => p.seanceId === s.id);
    if (pres && (pres.statut === 'present' || pres.statut === 'retard')) {
      totalHoursAttended += durationHours;
    }
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Relevé officiel d'assiduité" maxHeight="max-h-[92vh]">
      <div className="space-y-4 text-xs sm:text-sm">
        {/* Header Summary */}
        <div className="p-4 rounded-card bg-[#F7F8FA] dark:bg-[#0E1014] border border-[#E5E7EB] dark:border-[#262B35] space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {activeSemestre ? activeSemestre.niveauFiliere : "ESP Dakar"}
              </p>
              <h3 className="text-base font-bold text-[#111827] dark:text-[#F3F4F6]">
                {activeSemestre ? activeSemestre.nom : "Semestre en cours"}
              </h3>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300 font-bold">
              {globalPresenceRate} % d'assiduité
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5E7EB]/50 dark:border-[#262B35]/50">
            <div>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Heures suivies :</span>
              <p className="text-sm font-bold text-[#111827] dark:text-[#F3F4F6] font-mono">
                {Math.round(totalHoursAttended)} h / {Math.round(totalHoursPlanned)} h
              </p>
            </div>
            <div>
              <span className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">Formule de calcul :</span>
              <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                (Présents + Retards) ÷ Séances tenues
              </p>
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="overflow-x-auto rounded-card border border-[#E5E7EB] dark:border-[#262B35]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F8FA] dark:bg-[#0E1014] border-b border-[#E5E7EB] dark:border-[#262B35] text-[#6B7280] dark:text-[#9CA3AF]">
              <tr>
                <th className="p-2.5">Matière</th>
                <th className="p-2.5 text-center">Tenues</th>
                <th className="p-2.5 text-center text-emerald-600">Prés.</th>
                <th className="p-2.5 text-center text-amber-600">Ret.</th>
                <th className="p-2.5 text-center text-red-600">Abs.</th>
                <th className="p-2.5 text-center text-slate-500">Exc.</th>
                <th className="p-2.5 text-right font-bold">Taux</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]/60 dark:divide-[#262B35]/60 bg-white dark:bg-[#161A21]">
              {matieres.map(m => {
                const st = matieresStats[m.id];
                const isOverThreshold = m.seuilAbsences && st && st.absents >= m.seuilAbsences;

                return (
                  <tr key={m.id} className={isOverThreshold ? "bg-red-50/20" : ""}>
                    <td className="p-2.5 font-medium text-[#111827] dark:text-[#F3F4F6]">
                      <div className="truncate max-w-[140px] sm:max-w-xs">
                        {m.intitule}
                      </div>
                      {isOverThreshold && (
                        <span className="text-[10px] text-red-500 font-bold flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-0.5" /> Seuil d'absences dépassé
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-mono">{st?.totalTenues || 0}</td>
                    <td className="p-2.5 text-center font-mono text-emerald-600 font-semibold">{st?.presents || 0}</td>
                    <td className="p-2.5 text-center font-mono text-amber-600">{st?.retards || 0}</td>
                    <td className="p-2.5 text-center font-mono text-red-600 font-bold">{st?.absents || 0}</td>
                    <td className="p-2.5 text-center font-mono text-slate-500">{st?.excuses || 0}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-[#111827] dark:text-[#F3F4F6]">
                      {st ? `${st.tauxPresence} %` : '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 flex space-x-2">
          <Button
            type="button"
            variant="outline"
            fullWidth
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Imprimer / Exporter PDF
          </Button>
          <Button
            type="button"
            fullWidth
            onClick={onClose}
          >
            Fermer
          </Button>
        </div>
      </div>
    </BottomSheet>
  );
};
