import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Semestre,
  Matiere,
  Semaine,
  Seance,
  Presence,
  Devoir,
  Examen,
  Evenement,
  Evaluation,
  Club,
  ReunionClub,
  TacheClub,
  CompteRendu,
  ContactClub,
  SessionRevision,
  UserSettings,
  Indisponibilite,
  StatutPresence,
  StatutSeance,
  Modalite
} from '@/types';
import {
  semestreRepo,
  matiereRepo,
  semaineRepo,
  seanceRepo,
  presenceRepo,
  devoirRepo,
  examenRepo,
  evenementRepo,
  settingsRepo,
  importRepo,
  evaluationRepo,
  clubRepo,
  revisionRepo
} from '@/repositories';
import { useAuth } from './AuthContext';
import { ParseResult } from '@/lib/excel';

export interface MatiereStats {
  matiereId: string;
  totalTenues: number;
  presents: number;
  retards: number;
  absents: number;
  excuses: number;
  tauxPresence: number; // percentage 0-100
}

interface DataContextType {
  isLoading: boolean;
  semestres: Semestre[];
  activeSemestre: Semestre | undefined;
  matieres: Matiere[];
  matieresStats: Record<string, MatiereStats>;
  globalPresenceRate: number;
  currentWeekMonday: string;
  currentSemaine: Semaine | undefined;
  seancesForCurrentWeek: Seance[];
  allSeances: Seance[];
  presences: Presence[];
  devoirs: Devoir[];
  examens: Examen[];
  evenements: Evenement[];
  settings: UserSettings | null;
  indisponibilites: Indisponibilite[];

  // Phase 2: Evaluations & Moyennes
  evaluations: Evaluation[];
  matiereAverages: Record<string, number>;
  generalAverage: number;
  createEvaluation: (data: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Evaluation>;
  updateEvaluation: (id: string, updates: Partial<Evaluation>) => Promise<void>;
  deleteEvaluation: (id: string) => Promise<void>;

  // Phase 2: Clubs
  clubs: Club[];
  reunionsClub: ReunionClub[];
  tachesClub: TacheClub[];
  comptesRendus: CompteRendu[];
  contactsClub: ContactClub[];
  createClub: (data: Omit<Club, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Club>;
  updateClub: (id: string, updates: Partial<Club>) => Promise<void>;
  deleteClub: (id: string) => Promise<void>;
  createReunionClub: (data: Omit<ReunionClub, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<ReunionClub>;
  deleteReunionClub: (id: string) => Promise<void>;
  createTacheClub: (data: Omit<TacheClub, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<TacheClub>;
  toggleTacheClub: (id: string) => Promise<void>;
  deleteTacheClub: (id: string) => Promise<void>;
  createCompteRendu: (data: Omit<CompteRendu, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<CompteRendu>;
  deleteCompteRendu: (id: string) => Promise<void>;
  createContactClub: (data: Omit<ContactClub, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<ContactClub>;
  deleteContactClub: (id: string) => Promise<void>;

  // Phase 2: Révisions
  revisions: SessionRevision[];
  createRevision: (data: Omit<SessionRevision, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<SessionRevision>;
  updateRevision: (id: string, updates: Partial<SessionRevision>) => Promise<void>;
  deleteRevision: (id: string) => Promise<void>;
  totalRevisionMinutesPerMatiere: Record<string, number>;
  
  // Navigation & Actions
  setCurrentWeekMonday: (lundi: string) => void;
  setActiveSemestreId: (id: string) => Promise<void>;
  createSemestre: (data: Omit<Semestre, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Semestre>;
  updateSemestre: (id: string, updates: Partial<Semestre>) => Promise<void>;
  
  // Matiere
  createMatiere: (data: Omit<Matiere, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Matiere>;
  updateMatiere: (id: string, updates: Partial<Matiere>) => Promise<void>;
  deleteMatiere: (id: string) => Promise<void>;

  // Seances
  createSeance: (data: Omit<Seance, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Seance>;
  updateSeance: (id: string, updates: Partial<Seance>) => Promise<void>;
  cancelSeance: (id: string) => Promise<void>;
  deleteSeance: (id: string) => Promise<void>;

  // Presence
  setPresence: (seanceId: string, statut: StatutPresence, minutesRetard?: number, note?: string) => Promise<void>;
  getPresenceForSeance: (seanceId: string) => Presence | undefined;

  // Devoir & Examen & Evenement
  createDevoir: (data: Omit<Devoir, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Devoir>;
  toggleDevoirRendu: (id: string) => Promise<void>;
  deleteDevoir: (id: string) => Promise<void>;
  createExamen: (data: Omit<Examen, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Examen>;
  deleteExamen: (id: string) => Promise<void>;
  createEvenement: (data: Omit<Evenement, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => Promise<Evenement>;

  // Import
  applyImportResult: (result: ParseResult, adjustSemesterStart?: boolean) => Promise<void>;

  // Refresh
  refresh: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser } = useAuth();
  const userId = currentUser?.id;

  const [isLoading, setIsLoading] = useState(true);
  const [semestres, setSemestres] = useState<Semestre[]>([]);
  const [activeSemestre, setActiveSemestre] = useState<Semestre | undefined>(undefined);
  const [matieres, setMatieres] = useState<Matiere[]>([]);
  const [allSeances, setAllSeances] = useState<Seance[]>([]);
  const [presences, setPresences] = useState<Presence[]>([]);
  const [devoirs, setDevoirs] = useState<Devoir[]>([]);
  const [examens, setExamens] = useState<Examen[]>([]);
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [indisponibilites, setIndisponibilites] = useState<Indisponibilite[]>([]);

  // Phase 2 state
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [reunionsClub, setReunionsClub] = useState<ReunionClub[]>([]);
  const [tachesClub, setTachesClub] = useState<TacheClub[]>([]);
  const [comptesRendus, setComptesRendus] = useState<CompteRendu[]>([]);
  const [contactsClub, setContactsClub] = useState<ContactClub[]>([]);
  const [revisions, setRevisions] = useState<SessionRevision[]>([]);

  // Default demo week Monday: 2026-10-26 as per specifications
  const [currentWeekMonday, setCurrentWeekMonday] = useState<string>('2026-10-26');
  const [currentSemaine, setCurrentSemaine] = useState<Semaine | undefined>(undefined);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSemestres([]);
      setActiveSemestre(undefined);
      setMatieres([]);
      setAllSeances([]);
      setPresences([]);
      setDevoirs([]);
      setExamens([]);
      setEvenements([]);
      setIsLoading(false);
      return;
    }

    try {
      const [
        semList,
        activeSem,
        matList,
        allPresences,
        allDevs,
        allExams,
        allEvents,
        uSettings,
        uIndispos,
        allEvals,
        allClubs,
        allRevs
      ] = await Promise.all([
        semestreRepo.getAll(userId),
        semestreRepo.getActif(userId),
        matiereRepo.getAll(userId),
        presenceRepo.getByUser(userId),
        devoirRepo.getAll(userId),
        examenRepo.getAll(userId),
        evenementRepo.getAll(userId),
        settingsRepo.getSettings(userId),
        settingsRepo.getIndisponibilites(userId),
        evaluationRepo.getAll(userId),
        clubRepo.getAll(userId),
        revisionRepo.getAll(userId)
      ]);

      setSemestres(semList);
      setActiveSemestre(activeSem);
      setMatieres(matList);
      setPresences(allPresences);
      setDevoirs(allDevs);
      setExamens(allExams);
      setEvenements(allEvents);
      setSettings(uSettings);
      setIndisponibilites(uIndispos);
      setEvaluations(allEvals);
      setClubs(allClubs);
      setRevisions(allRevs);

      // Fetch club sub-items
      if (allClubs.length > 0) {
        const reunionsList: ReunionClub[] = [];
        const tachesList: TacheClub[] = [];
        const crList: CompteRendu[] = [];
        const contactsList: ContactClub[] = [];

        for (const c of allClubs) {
          const [r, t, cr, cont] = await Promise.all([
            clubRepo.getReunions(c.id, userId),
            clubRepo.getTaches(c.id, userId),
            clubRepo.getComptesRendus(c.id, userId),
            clubRepo.getContacts(c.id, userId),
          ]);
          reunionsList.push(...r);
          tachesList.push(...t);
          crList.push(...cr);
          contactsList.push(...cont);
        }
        setReunionsClub(reunionsList);
        setTachesClub(tachesList);
        setComptesRendus(crList);
        setContactsClub(contactsList);
      } else {
        setReunionsClub([]);
        setTachesClub([]);
        setComptesRendus([]);
        setContactsClub([]);
      }

      // Load current week
      const currentSem = await semaineRepo.getByLundi(currentWeekMonday, userId);
      setCurrentSemaine(currentSem);

      // Load all séances
      const allS: Seance[] = [];
      const allSemaines = await Promise.all(semList.map(s => semaineRepo.getBySemestre(s.id, userId)));
      const flattenedSemaines = allSemaines.flat();

      for (const sem of flattenedSemaines) {
        const sList = await seanceRepo.getBySemaine(sem.id, userId);
        allS.push(...sList);
      }
      setAllSeances(allS);
    } catch (e) {
      console.error('Failed to load data', e);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currentWeekMonday]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Derived sessions for current week
  const seancesForCurrentWeek = allSeances.filter(s => {
    if (currentSemaine && s.semaineId === currentSemaine.id) return true;
    return false;
  }).sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.debut.localeCompare(b.debut);
  });

  // Calculate attendance statistics per matiere
  // Formula: taux = (présents + retards) / séances tenues (non_tenu excluded)
  const matieresStats = React.useMemo(() => {
    const stats: Record<string, MatiereStats> = {};

    matieres.forEach(m => {
      stats[m.id] = {
        matiereId: m.id,
        totalTenues: 0,
        presents: 0,
        retards: 0,
        absents: 0,
        excuses: 0,
        tauxPresence: 100,
      };
    });

    for (const p of presences) {
      const seance = allSeances.find(s => s.id === p.seanceId);
      if (!seance || !seance.matiereId || !stats[seance.matiereId]) continue;

      if (p.statut === 'non_tenu') continue;

      const st = stats[seance.matiereId];
      st.totalTenues += 1;

      if (p.statut === 'present') st.presents += 1;
      else if (p.statut === 'retard') st.retards += 1;
      else if (p.statut === 'absent') st.absents += 1;
      else if (p.statut === 'excuse') st.excuses += 1;

      st.tauxPresence = st.totalTenues > 0
        ? Math.round(((st.presents + st.retards) / st.totalTenues) * 100)
        : 100;
    }

    return stats;
  }, [matieres, presences, allSeances]);

  // Global attendance rate
  const globalPresenceRate = React.useMemo(() => {
    let totalTenues = 0;
    let totalPresentsRetards = 0;

    Object.values(matieresStats).forEach(st => {
      totalTenues += st.totalTenues;
      totalPresentsRetards += (st.presents + st.retards);
    });

    return totalTenues > 0 ? Math.round((totalPresentsRetards / totalTenues) * 100) : 100;
  }, [matieresStats]);

  // Phase 2: Calculate Weighted Averages
  const matiereAverages = React.useMemo(() => {
    const avgs: Record<string, number> = {};

    matieres.forEach(m => {
      const evals = evaluations.filter(e => e.matiereId === m.id);
      if (evals.length === 0) {
        avgs[m.id] = 0;
        return;
      }

      let totalPoints = 0;
      let totalCoef = 0;

      evals.forEach(e => {
        // Standardize note on /20
        const noteSur20 = e.bareme > 0 ? (e.note / e.bareme) * 20 : e.note;
        totalPoints += noteSur20 * (e.coefficient || 1);
        totalCoef += (e.coefficient || 1);
      });

      avgs[m.id] = totalCoef > 0 ? Math.round((totalPoints / totalCoef) * 100) / 100 : 0;
    });

    return avgs;
  }, [matieres, evaluations]);

  const generalAverage = React.useMemo(() => {
    let totalScore = 0;
    let totalWeight = 0;

    matieres.forEach(m => {
      const avg = matiereAverages[m.id];
      if (avg > 0) {
        totalScore += avg * (m.coefficient || 1);
        totalWeight += (m.coefficient || 1);
      }
    });

    return totalWeight > 0 ? Math.round((totalScore / totalWeight) * 100) / 100 : 0;
  }, [matieres, matiereAverages]);

  // Phase 2: Total revision minutes per matiere
  const totalRevisionMinutesPerMatiere = React.useMemo(() => {
    const mins: Record<string, number> = {};
    matieres.forEach(m => { mins[m.id] = 0; });

    revisions.forEach(r => {
      if (r.statut === 'faite' || r.statut === 'prevue') {
        mins[r.matiereId] = (mins[r.matiereId] || 0) + r.dureeMin;
      }
    });

    return mins;
  }, [matieres, revisions]);

  // Presence helper
  const getPresenceForSeance = (seanceId: string) => {
    return presences.find(p => p.seanceId === seanceId);
  };

  const setPresence = async (
    seanceId: string,
    statut: StatutPresence,
    minutesRetard?: number,
    note?: string
  ) => {
    if (!userId) return;
    const seance = allSeances.find(s => s.id === seanceId);
    await presenceRepo.setPresence({
      userId,
      seanceId,
      statut,
      minutesRetard,
      modeSuivi: seance?.modalite,
      note,
      canal: 'app',
    });
    await refresh();
  };

  const setActiveSemestreId = async (id: string) => {
    if (!userId) return;
    await semestreRepo.setActif(id, userId);
    await refresh();
  };

  const createSemestre = async (data: Omit<Semestre, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await semestreRepo.create({ ...data, userId });
    await refresh();
    return created;
  };

  const updateSemestre = async (id: string, updates: Partial<Semestre>) => {
    if (!userId) return;
    await semestreRepo.update(id, userId, updates);
    await refresh();
  };

  const createMatiere = async (data: Omit<Matiere, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await matiereRepo.create({ ...data, userId });
    await refresh();
    return created;
  };

  const updateMatiere = async (id: string, updates: Partial<Matiere>) => {
    if (!userId) return;
    await matiereRepo.update(id, userId, updates);
    await refresh();
  };

  const deleteMatiere = async (id: string) => {
    if (!userId) return;
    await matiereRepo.delete(id, userId);
    await refresh();
  };

  const createSeance = async (data: Omit<Seance, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await seanceRepo.create({ ...data, userId });
    await refresh();
    return created;
  };

  const updateSeance = async (id: string, updates: Partial<Seance>) => {
    if (!userId) return;
    await seanceRepo.update(id, userId, updates);
    await refresh();
  };

  const cancelSeance = async (id: string) => {
    if (!userId) return;
    const s = allSeances.find(item => item.id === id);
    const newStatut: StatutSeance = s?.statut === 'annulee' ? 'prevue' : 'annulee';
    await seanceRepo.update(id, userId, { statut: newStatut });
    await refresh();
  };

  const deleteSeance = async (id: string) => {
    if (!userId) return;
    await seanceRepo.delete(id, userId);
    await refresh();
  };

  const createDevoir = async (data: Omit<Devoir, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await devoirRepo.create({ ...data, userId });
    await refresh();
    return created;
  };

  const toggleDevoirRendu = async (id: string) => {
    if (!userId) return;
    const d = devoirs.find(item => item.id === id);
    if (!d) return;
    const newStatut = d.statut === 'rendu' ? 'a_faire' : 'rendu';
    await devoirRepo.update(id, userId, { statut: newStatut });
    await refresh();
  };

  const deleteDevoir = async (id: string) => {
    if (!userId) return;
    await devoirRepo.delete(id, userId);
    await refresh();
  };

  const createExamen = async (data: Omit<Examen, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await examenRepo.create({ ...data, userId });
    await refresh();
    return created;
  };

  const deleteExamen = async (id: string) => {
    if (!userId) return;
    await examenRepo.delete(id, userId);
    await refresh();
  };

  const createEvenement = async (data: Omit<Evenement, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await evenementRepo.create({ ...data, userId });
    await refresh();
    return created;
  };

  // Phase 2: Evaluations
  const createEvaluation = async (data: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await evaluationRepo.create({ ...data, userId });
    await refresh();
    return created;
  };

  const updateEvaluation = async (id: string, updates: Partial<Evaluation>) => {
    if (!userId) return;
    await evaluationRepo.update(id, userId, updates);
    await refresh();
  };

  const deleteEvaluation = async (id: string) => {
    if (!userId) return;
    await evaluationRepo.delete(id, userId);
    await refresh();
  };

  // Phase 2: Clubs
  const createClub = async (data: Omit<Club, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await clubRepo.create({ ...data, userId });
    await refresh();
    return created;
  };

  const updateClub = async (id: string, updates: Partial<Club>) => {
    if (!userId) return;
    await clubRepo.update(id, userId, updates);
    await refresh();
  };

  const deleteClub = async (id: string) => {
    if (!userId) return;
    await clubRepo.delete(id, userId);
    await refresh();
  };

  const createReunionClub = async (data: Omit<ReunionClub, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await clubRepo.createReunion({ ...data, userId });
    await refresh();
    return created;
  };

  const deleteReunionClub = async (id: string) => {
    if (!userId) return;
    await clubRepo.deleteReunion(id, userId);
    await refresh();
  };

  const createTacheClub = async (data: Omit<TacheClub, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await clubRepo.createTache({ ...data, userId });
    await refresh();
    return created;
  };

  const toggleTacheClub = async (id: string) => {
    if (!userId) return;
    const t = tachesClub.find(item => item.id === id);
    if (!t) return;
    const newStatut = t.statut === 'ouverte' ? 'faite' : 'ouverte';
    await clubRepo.updateTache(id, userId, { statut: newStatut });
    await refresh();
  };

  const deleteTacheClub = async (id: string) => {
    if (!userId) return;
    await clubRepo.deleteTache(id, userId);
    await refresh();
  };

  const createCompteRendu = async (data: Omit<CompteRendu, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await clubRepo.createCompteRendu({ ...data, userId });
    await refresh();
    return created;
  };

  const deleteCompteRendu = async (id: string) => {
    if (!userId) return;
    await clubRepo.deleteCompteRendu(id, userId);
    await refresh();
  };

  const createContactClub = async (data: Omit<ContactClub, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await clubRepo.createContact({ ...data, userId });
    await refresh();
    return created;
  };

  const deleteContactClub = async (id: string) => {
    if (!userId) return;
    await clubRepo.deleteContact(id, userId);
    await refresh();
  };

  // Phase 2: Révisions
  const createRevision = async (data: Omit<SessionRevision, 'id' | 'createdAt' | 'updatedAt' | 'userId'>) => {
    if (!userId) throw new Error('Non authentifié');
    const created = await revisionRepo.create({ ...data, userId });
    await refresh();
    return created;
  };

  const updateRevision = async (id: string, updates: Partial<SessionRevision>) => {
    if (!userId) return;
    await revisionRepo.update(id, userId, updates);
    await refresh();
  };

  const deleteRevision = async (id: string) => {
    if (!userId) return;
    await revisionRepo.delete(id, userId);
    await refresh();
  };

  const applyImportResult = async (result: ParseResult, adjustSemesterStart?: boolean) => {
    if (!userId || !activeSemestre) return;

    // 1. If user agreed to adjust semester start
    if (adjustSemesterStart && activeSemestre.debut > result.semaineLundi) {
      await semestreRepo.update(activeSemestre.id, userId, {
        debut: result.semaineLundi,
      });
    }

    // 2. Find or create Semaine
    let semaine = await semaineRepo.getByLundi(result.semaineLundi, userId);
    if (!semaine) {
      semaine = await semaineRepo.create({
        userId,
        semestreId: activeSemestre.id,
        lundi: result.semaineLundi,
        statut: 'validee',
        source: 'import',
      });
    } else {
      await semaineRepo.update(semaine.id, userId, { statut: 'validee' });
    }

    // 3. Create Import log
    const importLog = await importRepo.create({
      userId,
      nomFichier: result.nomFichier,
      empreinte: `${result.nomFichier}_${Date.now()}`,
      format: result.formatDetecte,
      semaines: [result.semaineLundi],
      avertissements: result.avertissementsGlobaux,
      annule: false,
    });

    // 4. Existing sessions for this week (to preserve attendance on re-import)
    const existingForWeek = await seanceRepo.getBySemaine(semaine.id, userId);
    const existingPresences = await presenceRepo.getByUser(userId);

    // Remove old sessions
    for (const oldS of existingForWeek) {
      await seanceRepo.delete(oldS.id, userId);
    }

    // 5. Insert new sessions and re-link presences if matching
    for (const row of result.seances) {
      const createdS = await seanceRepo.create({
        userId,
        semaineId: semaine.id,
        matiereId: row.matiereId,
        intituleRecu: row.matiereIntitule,
        date: row.date,
        debut: row.debut,
        fin: row.fin,
        modalite: row.modalite,
        salle: row.salle,
        lien: row.lien,
        intervenant: row.intervenant,
        statut: row.statut,
        note: row.note,
        origine: 'import',
        sourceRef: row.sourceRef,
      });

      // Check if there was an existing session on same day/hour with attendance
      const matchingOld = existingForWeek.find(
        os => os.date === row.date && os.debut === row.debut && os.matiereId === row.matiereId
      );
      if (matchingOld) {
        const pres = existingPresences.find(p => p.seanceId === matchingOld.id);
        if (pres) {
          // Relink presence to newly created session
          await presenceRepo.setPresence({
            userId,
            seanceId: createdS.id,
            statut: pres.statut,
            minutesRetard: pres.minutesRetard,
            modeSuivi: pres.modeSuivi,
            note: pres.note,
            canal: pres.canal,
          });
        }
      }
    }

    setCurrentWeekMonday(result.semaineLundi);
    await refresh();
  };

  return (
    <DataContext.Provider
      value={{
        isLoading,
        semestres,
        activeSemestre,
        matieres,
        matieresStats,
        globalPresenceRate,
        currentWeekMonday,
        currentSemaine,
        seancesForCurrentWeek,
        allSeances,
        presences,
        devoirs,
        examens,
        evenements,
        settings,
        indisponibilites,
        setCurrentWeekMonday,
        setActiveSemestreId,
        createSemestre,
        updateSemestre,
        createMatiere,
        updateMatiere,
        deleteMatiere,
        createSeance,
        updateSeance,
        cancelSeance,
        deleteSeance,
        setPresence,
        getPresenceForSeance,
        createDevoir,
        toggleDevoirRendu,
        deleteDevoir,
        createExamen,
        deleteExamen,
        createEvenement,
        applyImportResult,
        refresh,

        // Phase 2
        evaluations,
        matiereAverages,
        generalAverage,
        createEvaluation,
        updateEvaluation,
        deleteEvaluation,
        clubs,
        reunionsClub,
        tachesClub,
        comptesRendus,
        contactsClub,
        createClub,
        updateClub,
        deleteClub,
        createReunionClub,
        deleteReunionClub,
        createTacheClub,
        toggleTacheClub,
        deleteTacheClub,
        createCompteRendu,
        deleteCompteRendu,
        createContactClub,
        deleteContactClub,
        revisions,
        createRevision,
        updateRevision,
        deleteRevision,
        totalRevisionMinutesPerMatiere,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within a DataProvider');
  return context;
};
