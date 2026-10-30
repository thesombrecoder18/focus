import React, { useState, useEffect, useRef } from 'react';
import { FR } from '@/i18n/fr';
import { Timer, Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TimerMinuteurProps {
  dureeMin: number;
  onFini?: () => void;
}

type PhasePomodoro = 'travail' | 'pause';

const PAUSE_COURTE_MIN = 5;

export const TimerMinuteur: React.FC<TimerMinuteurProps> = ({ dureeMin, onFini }) => {
  const [secondesRestantes, setSecondesRestantes] = useState(dureeMin * 60);
  const [actif, setActif] = useState(false);
  const [fini, setFini] = useState(false);
  const [phase, setPhase] = useState<PhasePomodoro>('travail');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSecondes = phase === 'travail' ? dureeMin * 60 : PAUSE_COURTE_MIN * 60;

  useEffect(() => {
    setSecondesRestantes(dureeMin * 60);
    setPhase('travail');
    setActif(false);
    setFini(false);
  }, [dureeMin]);

  useEffect(() => {
    if (actif && !fini) {
      intervalRef.current = setInterval(() => {
        setSecondesRestantes(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setActif(false);
            setFini(true);
            onFini?.();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [actif, fini, onFini]);

  const reinitialiser = () => {
    clearInterval(intervalRef.current!);
    setSecondesRestantes(totalSecondes);
    setActif(false);
    setFini(false);
  };

  const basculerPause = () => {
    if (phase === 'travail') {
      setPhase('pause');
      setSecondesRestantes(PAUSE_COURTE_MIN * 60);
    } else {
      setPhase('travail');
      setSecondesRestantes(dureeMin * 60);
    }
    setActif(false);
    setFini(false);
  };

  const min = Math.floor(secondesRestantes / 60);
  const sec = secondesRestantes % 60;
  const progression = ((totalSecondes - secondesRestantes) / totalSecondes) * 100;

  const rayon = 52;
  const circonference = 2 * Math.PI * rayon;
  const dashoffset = circonference - (progression / 100) * circonference;

  const couleurPhase = phase === 'travail'
    ? 'text-emerald-500'
    : 'text-sky-400';
  const couleurCercle = phase === 'travail' ? '#10B981' : '#38BDF8';

  return (
    <div className="flex flex-col items-center gap-4 py-2">
      {/* Badge phase */}
      <span className={`text-xs font-semibold uppercase tracking-widest ${couleurPhase}`}>
        {phase === 'travail' ? FR.revisions.timer.phaseTravail : FR.revisions.timer.phasePause}
      </span>

      {/* Cercle SVG */}
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          {/* Piste de fond */}
          <circle
            cx="60" cy="60" r={rayon}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-[#E5E7EB] dark:text-[#262B35]"
          />
          {/* Progression */}
          <circle
            cx="60" cy="60" r={rayon}
            stroke={fini ? '#10B981' : couleurCercle}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circonference}
            strokeDashoffset={fini ? 0 : dashoffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>
        {/* Affichage temps */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {fini ? (
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          ) : (
            <span className="text-3xl font-extrabold tabular-nums text-[#111827] dark:text-[#F3F4F6] tracking-tight">
              {String(min).padStart(2, '0')}:{String(sec).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Message fini */}
      {fini && (
        <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 text-center">
          {phase === 'travail' ? FR.revisions.timer.finTravail : FR.revisions.timer.finPause}
        </p>
      )}

      {/* Contrôles */}
      <div className="flex items-center gap-3">
        <button
          onClick={reinitialiser}
          title={FR.revisions.timer.reinitialiser}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#6B7280] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => { if (!fini) setActif(a => !a); }}
          disabled={fini}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-md transition-all duration-200 active:scale-95 ${
            phase === 'travail'
              ? 'bg-emerald-500 hover:bg-emerald-600'
              : 'bg-sky-400 hover:bg-sky-500'
          } disabled:opacity-50`}
        >
          {actif ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>

        <button
          onClick={basculerPause}
          title={phase === 'travail' ? FR.revisions.timer.demarrerPause : FR.revisions.timer.reprendreTravail}
          className="w-10 h-10 rounded-full flex items-center justify-center text-[#6B7280] dark:text-[#9CA3AF] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
        >
          <Timer className="w-4 h-4" />
        </button>
      </div>

      <p className="text-[10px] text-[#9CA3AF] text-center">
        {FR.revisions.timer.aide}
      </p>
    </div>
  );
};
