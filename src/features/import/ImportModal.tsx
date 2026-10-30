import React, { useState, useRef } from 'react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { FR } from '@/i18n/fr';
import { useData } from '@/context/DataContext';
import { parseScheduleFile, ParseResult, downloadElizoExcelTemplate } from '@/lib/excel';
import { parseIcsContent } from '@/lib/icsImport';
import { Upload, FileText, Download, AlertCircle, FileCode } from 'lucide-react';
import { clsx } from 'clsx';

type ImportTab = 'excel' | 'ics';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose }) => {
  const { matieres, activeSemestre, currentWeekMonday, applyImportResult } = useData();

  const [activeTab, setActiveTab] = useState<ImportTab>('excel');
  const [isLoading, setIsLoading] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [adjustSemester, setAdjustSemester] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const excelFileRef = useRef<HTMLInputElement>(null);
  const icsFileRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop lourd (taille maximale : 10 Mo).');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await parseScheduleFile(file, matieres, currentWeekMonday);
      setParseResult(result);
      if (activeSemestre && result.semaineLundi < activeSemestre.debut) {
        setAdjustSemester(true);
      }
    } catch (err) {
      console.error(err);
      setError(FR.errors.fichierInvalide);
    } finally {
      setIsLoading(false);
    }
  };

  const handleIcsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const result = parseIcsContent(text, file.name, matieres, currentWeekMonday);
      setParseResult(result);
      if (activeSemestre && result.semaineLundi < activeSemestre.debut) {
        setAdjustSemester(true);
      }
    } catch (err) {
      console.error(err);
      setError('Fichier .ics invalide.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!parseResult) return;
    setIsLoading(true);
    try {
      await applyImportResult(parseResult, adjustSemester);
      onClose();
      setParseResult(null);
    } catch (e) {
      console.error(e);
      setError(FR.errors.generique);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReview = () => {
    setParseResult(null);
    if (excelFileRef.current) excelFileRef.current.value = '';
    if (icsFileRef.current) icsFileRef.current.value = '';
  };

  const handleEditRowField = (tempId: string, field: 'matiereIntitule' | 'intervenant' | 'salle' | 'debut' | 'fin', val: string) => {
    if (!parseResult) return;
    setParseResult({
      ...parseResult,
      seances: parseResult.seances.map(s => {
        if (s.tempId === tempId) {
          return { ...s, [field]: val };
        }
        return s;
      }),
    });
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title={parseResult ? FR.importEdt.revueTitre : FR.importEdt.titre}
      maxHeight="max-h-[92vh]"
    >
      {!parseResult ? (
        <div className="space-y-4">
          {/* Subheader tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-[#F7F8FA] dark:bg-[#0E1014] rounded-btn text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('excel')}
              className={clsx(
                "py-2 rounded-lg transition-colors truncate px-1",
                activeTab === 'excel' ? "bg-white dark:bg-[#161A21] text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-[#6B7280]"
              )}
            >
              Excel / CSV
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('ics')}
              className={clsx(
                "py-2 rounded-lg transition-colors truncate px-1",
                activeTab === 'ics' ? "bg-white dark:bg-[#161A21] text-indigo-600 dark:text-indigo-400 shadow-xs" : "text-[#6B7280]"
              )}
            >
              Fichier .ICS
            </button>
          </div>

          {error && (
            <div className="flex items-center p-3 rounded-btn bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Tab 1: Excel */}
          {activeTab === 'excel' && (
            <div className="space-y-4">
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                {FR.importEdt.descriptionFormat}
              </p>

              <div
                onClick={() => excelFileRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E5E7EB] dark:border-[#262B35] hover:border-indigo-500 rounded-card cursor-pointer bg-[#F7F8FA] dark:bg-[#0E1014]/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] dark:text-[#818CF8] flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] text-center">
                  {isLoading ? "Traitement du fichier..." : FR.importEdt.glisserFichier}
                </p>
                <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF] mt-1 text-center">
                  {FR.importEdt.formatsAcceptes}
                </p>
                <input
                  ref={excelFileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleExcelUpload}
                  className="hidden"
                />
              </div>

              <div className="p-4 rounded-card bg-white dark:bg-[#161A21] border border-[#E5E7EB] dark:border-[#262B35] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-[#6B7280]" />
                  <div>
                    <h4 className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6]">
                      Modèle Excel Elizo (Saisie)
                    </h4>
                    <p className="text-[11px] text-[#6B7280] dark:text-[#9CA3AF]">
                      Pratique pour préparer une semaine manuellement.
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  icon={<Download className="w-3.5 h-3.5" />}
                  onClick={downloadElizoExcelTemplate}
                >
                  Télécharger
                </Button>
              </div>
            </div>
          )}

          {/* Tab 2: Fichier .ICS */}
          {activeTab === 'ics' && (
            <div className="space-y-4">
              <p className="text-xs text-[#6B7280] dark:text-[#9CA3AF]">
                Importe un fichier d'agenda iCalendar (.ics).
              </p>
              <div
                onClick={() => icsFileRef.current?.click()}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-[#E5E7EB] dark:border-[#262B35] hover:border-indigo-500 rounded-card cursor-pointer bg-[#F7F8FA] dark:bg-[#0E1014]/50 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mb-3">
                  <FileCode className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-[#111827] dark:text-[#F3F4F6] text-center">
                  {isLoading ? "Lecture du fichier .ics..." : "Sélectionner un fichier .ics"}
                </p>
                <input
                  ref={icsFileRef}
                  type="file"
                  accept=".ics,text/calendar"
                  onChange={handleIcsUpload}
                  className="hidden"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Interactive Review Screen */
        <div className="space-y-4">
          <div className="p-3.5 rounded-card bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800/40">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#111827] dark:text-[#F3F4F6]">
                  Source : <span className="font-mono">{parseResult.nomFichier}</span>
                </p>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-300 font-medium mt-0.5">
                  Format : {parseResult.formatDetecte} {parseResult.ongletNom ? `(${parseResult.ongletNom})` : ''}
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                {parseResult.seances.length} {FR.importEdt.nbSeances}
              </span>
            </div>
          </div>

          {activeSemestre && parseResult.semaineLundi < activeSemestre.debut && (
            <div className="p-3.5 rounded-card bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-2">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0 mt-0.5 text-amber-600" />
                <p>{FR.importEdt.semaineAvantDebutSemestre}</p>
              </div>
              <div className="flex items-center space-x-2 pl-6">
                <input
                  type="checkbox"
                  id="adjustSem"
                  checked={adjustSemester}
                  onChange={e => setAdjustSemester(e.target.checked)}
                  className="rounded text-indigo-600"
                />
                <label htmlFor="adjustSem" className="font-semibold cursor-pointer">
                  {FR.importEdt.avancerSemestre} (de {activeSemestre.debut} à {parseResult.semaineLundi})
                </label>
              </div>
            </div>
          )}

          <div className="space-y-2 max-h-[46vh] overflow-y-auto pr-1">
            {parseResult.seances.map(row => {
              const hasWarn = row.avertissements.length > 0;

              return (
                <div
                  key={row.tempId}
                  className={clsx(
                    "p-3 rounded-card border bg-white dark:bg-[#161A21] space-y-2 text-xs",
                    hasWarn
                      ? "border-amber-300 dark:border-amber-700/60 bg-amber-50/20"
                      : "border-[#E5E7EB] dark:border-[#262B35]"
                  )}
                >
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span>
                      {row.jourNom} · {row.date} ({row.debut}–{row.fin})
                    </span>
                    <span
                      className={clsx(
                        "px-2 py-0.5 rounded-full text-[10px]",
                        row.modalite === 'en_ligne'
                          ? "bg-[#DCEFFC] text-[#0B67A7]"
                          : "bg-[#F5E7D0] text-[#8D662F]"
                      )}
                    >
                      {row.modalite === 'en_ligne' ? 'En ligne' : 'Présentiel'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                        Matière
                      </label>
                      <input
                        type="text"
                        value={row.matiereIntitule}
                        onChange={e => handleEditRowField(row.tempId, 'matiereIntitule', e.target.value)}
                        className="w-full h-8 px-2 rounded-btn bg-[#F7F8FA] dark:bg-[#0E1014] border border-[#E5E7EB] dark:border-[#262B35] text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-[#6B7280] dark:text-[#9CA3AF] uppercase">
                        Intervenant
                      </label>
                      <input
                        type="text"
                        value={row.intervenant || ''}
                        onChange={e => handleEditRowField(row.tempId, 'intervenant', e.target.value)}
                        className="w-full h-8 px-2 rounded-btn bg-[#F7F8FA] dark:bg-[#0E1014] border border-[#E5E7EB] dark:border-[#262B35] text-xs"
                      />
                    </div>
                  </div>

                  {hasWarn && (
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                      ⚠️ {row.avertissements.join(' · ')}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-2 flex space-x-2">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={handleCancelReview}
              disabled={isLoading}
            >
              {FR.importEdt.annulerImport}
            </Button>
            <Button
              type="button"
              fullWidth
              onClick={handleValidate}
              disabled={isLoading}
            >
              {isLoading ? "Enregistrement..." : FR.importEdt.validerSemaine}
            </Button>
          </div>
        </div>
      )}
    </BottomSheet>
  );
};
