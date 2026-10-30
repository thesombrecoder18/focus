import {
  User,
  Semestre,
  Matiere,
  Semaine,
  Seance,
  HistoriqueSeance,
  Presence,
  ImportFichier,
  Devoir,
  Examen,
  Evenement,
  Indisponibilite,
  Invitation,
  UserSettings,
  Evaluation,
  Club,
  ReunionClub,
  TacheClub,
  CompteRendu,
  ContactClub,
  SessionRevision
} from '@/types';
import {
  ISemestreRepository,
  IMatiereRepository,
  ISemaineRepository,
  ISeanceRepository,
  IPresenceRepository,
  IDevoirRepository,
  IExamenRepository,
  IEvenementRepository,
  IImportRepository,
  ISettingsRepository,
  IInvitationRepository,
  IEvaluationRepository,
  IClubRepository,
  ISessionRevisionRepository
} from './interfaces';

const STORAGE_KEYS = {
  USERS: 'elizo_users',
  CURRENT_USER: 'elizo_current_user',
  SEMESTRES: 'elizo_semestres',
  MATIERES: 'elizo_matieres',
  SEMAINES: 'elizo_semaines',
  SEANCES: 'elizo_seances',
  HISTORIQUE: 'elizo_historique_seances',
  PRESENCES: 'elizo_presences',
  IMPORTS: 'elizo_imports',
  DEVOIRS: 'elizo_devoirs',
  EXAMENS: 'elizo_examens',
  EVENEMENTS: 'elizo_evenements',
  INDISPONIBILITES: 'elizo_indisponibilites',
  INVITATIONS: 'elizo_invitations',
  SETTINGS: 'elizo_settings',
  EVALUATIONS: 'elizo_evaluations',
  CLUBS: 'elizo_clubs',
  REUNIONS_CLUB: 'elizo_reunions_club',
  TACHES_CLUB: 'elizo_taches_club',
  COMPTES_RENDUS: 'elizo_comptes_rendus',
  CONTACTS_CLUB: 'elizo_contacts_club',
  REVISIONS: 'elizo_revisions',
};

function getItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error(`Failed to read key ${key} from localStorage`, e);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Failed to write key ${key} to localStorage`, e);
  }
}

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Demo Data Seeder
export function seedDemoDataForUser(userId: string): void {
  const now = new Date().toISOString();

  // 1. Semestre
  const semestreId = `sem_${userId}_m2_s3`;
  const semestre: Semestre = {
    id: semestreId,
    userId,
    nom: 'M2 – Semestre 3',
    niveauFiliere: 'Master 2 – Sécurité des Systèmes d\'Information',
    debut: '2026-10-28',
    fin: '2027-03-03',
    actif: true,
    profilHoraire: 'soir',
    lieuParDefaut: {
      en_ligne: 'https://meet.google.com/xxx-xxxx-xxx',
      presentiel: 'Salle 102',
    },
    periodesSansCours: [
      { debut: '2026-12-23', fin: '2027-01-04', libelle: 'Vacances de fin d\'année' },
    ],
    createdAt: now,
    updatedAt: now,
  };

  // 2. Matières
  const matCyberId = `mat_${userId}_cyber`;
  const matGouvId = `mat_${userId}_gouv`;
  const matElecId = `mat_${userId}_elec`;
  const matCertId = `mat_${userId}_cert`;
  const matRisqId = `mat_${userId}_risq`;
  const matIaId = `mat_${userId}_ia`;

  const matieres: Matiere[] = [
    {
      id: matCyberId,
      userId,
      semestreId,
      intitule: 'Cybercriminalité, cyberéthique et cyberdroit',
      code: 'MASTER-SSI-5321',
      enseignants: ['M. C. A. Fall'],
      coefficient: 3,
      couleur: '#4F46E5', // Indigo
      alias: ['Cybercriminalité', 'Cyberéthique', 'Cyberdroit', 'Droit cyber'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: matGouvId,
      userId,
      semestreId,
      intitule: 'Gouvernance et politique de sécurité',
      enseignants: ['M. Lam'],
      coefficient: 1,
      couleur: '#2563EB', // Blue
      alias: ['Gouvernance', 'Politique de sécurité', 'GPS'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: matElecId,
      userId,
      semestreId,
      intitule: 'Sécurité de l\'électronique et des architectures matérielles',
      enseignants: ['M. Dione'],
      coefficient: 1,
      couleur: '#7C3AED', // Violet
      alias: ['Électronique', 'Architectures matérielles', 'Sécurité matérielle'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: matCertId,
      userId,
      semestreId,
      intitule: 'Préparation à la certification professionnelle',
      enseignants: ['M. Diop'],
      coefficient: 1,
      couleur: '#D97706', // Ambre
      alias: ['Certification', 'Certif', 'PCP'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: matRisqId,
      userId,
      semestreId,
      intitule: 'Gestion des risques (PCA, PRA)',
      enseignants: ['M. Gueye'],
      coefficient: 1,
      couleur: '#059669', // Emeraude
      alias: ['Gestion des risques', 'PCA', 'PRA', 'Risques'],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: matIaId,
      userId,
      semestreId,
      intitule: 'Robustesse et sécurité de l\'intelligence artificielle et du big data',
      enseignants: ['M. Faye'],
      coefficient: 1,
      couleur: '#0891B2', // Cyan
      alias: ['IA et Big Data', 'Robustesse IA', 'Sécurité IA'],
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 3. Semaine du lundi 2026-10-26 (Validée, 14 séances = 28 h)
  const semaineId = `semaine_${userId}_2026_10_26`;
  const semaine: Semaine = {
    id: semaineId,
    userId,
    semestreId,
    lundi: '2026-10-26',
    statut: 'validee',
    source: 'import',
    createdAt: now,
    updatedAt: now,
  };

  // 14 séances
  const seances: Seance[] = [
    // Lundi 2026-10-26
    {
      id: `sec_${userId}_1`,
      userId,
      semaineId,
      matiereId: undefined, // Volontairement À renseigner pour tester
      intituleRecu: 'À renseigner (EC 01)',
      date: '2026-10-26',
      debut: '17:00',
      fin: '19:00',
      modalite: 'en_ligne',
      lien: 'https://meet.google.com/xxx-xxxx-xxx',
      intervenant: 'À renseigner',
      statut: 'provisoire',
      origine: 'import',
      sourceRef: 'EdT_du_26_au_31_oct_2026!Lundi_17h',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec_${userId}_2`,
      userId,
      semaineId,
      matiereId: matCyberId,
      intituleRecu: 'Cybercriminalité, cyberéthique et cyberdroit',
      date: '2026-10-26',
      debut: '19:00',
      fin: '21:00',
      modalite: 'en_ligne',
      lien: 'https://meet.google.com/xxx-xxxx-xxx',
      intervenant: 'M. C. A. Fall',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },

    // Mardi 2026-10-27
    {
      id: `sec_${userId}_3`,
      userId,
      semaineId,
      matiereId: matGouvId,
      intituleRecu: 'Gouvernance et politique de sécurité',
      date: '2026-10-27',
      debut: '17:00',
      fin: '19:00',
      modalite: 'en_ligne',
      lien: 'https://meet.google.com/xxx-xxxx-xxx',
      intervenant: 'M. Lam',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec_${userId}_4`,
      userId,
      semaineId,
      matiereId: matGouvId,
      intituleRecu: 'Gouvernance et politique de sécurité',
      date: '2026-10-27',
      debut: '19:00',
      fin: '21:00',
      modalite: 'en_ligne',
      lien: 'https://meet.google.com/xxx-xxxx-xxx',
      intervenant: 'M. Lam',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },

    // Mercredi 2026-10-28
    {
      id: `sec_${userId}_5`,
      userId,
      semaineId,
      matiereId: matElecId,
      intituleRecu: 'Sécurité de l\'électronique et des architectures matérielles',
      date: '2026-10-28',
      debut: '17:00',
      fin: '19:00',
      modalite: 'presentiel',
      salle: 'Salle 102',
      intervenant: 'M. Dione',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec_${userId}_6`,
      userId,
      semaineId,
      matiereId: matElecId,
      intituleRecu: 'Sécurité de l\'électronique et des architectures matérielles',
      date: '2026-10-28',
      debut: '19:00',
      fin: '21:00',
      modalite: 'presentiel',
      salle: 'Salle 102',
      intervenant: 'M. Dione',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },

    // Jeudi 2026-10-29
    {
      id: `sec_${userId}_7`,
      userId,
      semaineId,
      matiereId: matCertId,
      intituleRecu: 'Préparation à la certification professionnelle',
      date: '2026-10-29',
      debut: '17:00',
      fin: '19:00',
      modalite: 'en_ligne',
      lien: 'https://meet.google.com/xxx-xxxx-xxx',
      intervenant: 'M. Diop',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec_${userId}_8`,
      userId,
      semaineId,
      matiereId: matCyberId,
      intituleRecu: 'Cybercriminalité, cyberéthique et cyberdroit',
      date: '2026-10-29',
      debut: '19:00',
      fin: '21:00',
      modalite: 'en_ligne',
      lien: 'https://meet.google.com/xxx-xxxx-xxx',
      intervenant: 'M. C. A. Fall',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },

    // Vendredi 2026-10-30
    {
      id: `sec_${userId}_9`,
      userId,
      semaineId,
      matiereId: matRisqId,
      intituleRecu: 'Gestion des risques (PCA, PRA)',
      date: '2026-10-30',
      debut: '17:00',
      fin: '19:00',
      modalite: 'en_ligne',
      lien: 'https://meet.google.com/xxx-xxxx-xxx',
      intervenant: 'M. Gueye',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec_${userId}_10`,
      userId,
      semaineId,
      matiereId: matRisqId,
      intituleRecu: 'Gestion des risques (PCA, PRA)',
      date: '2026-10-30',
      debut: '19:00',
      fin: '21:00',
      modalite: 'en_ligne',
      lien: 'https://meet.google.com/xxx-xxxx-xxx',
      intervenant: 'M. Gueye',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },

    // Samedi 2026-10-31 (8h-10h, 10h-12h, pause, 13h-15h, 15h-17h)
    {
      id: `sec_${userId}_11`,
      userId,
      semaineId,
      matiereId: matIaId,
      intituleRecu: 'Robustesse et sécurité de l\'intelligence artificielle et du big data',
      date: '2026-10-31',
      debut: '08:00',
      fin: '10:00',
      modalite: 'presentiel',
      salle: 'Salle 102',
      intervenant: 'M. Faye',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec_${userId}_12`,
      userId,
      semaineId,
      matiereId: matIaId,
      intituleRecu: 'Robustesse et sécurité de l\'intelligence artificielle et du big data',
      date: '2026-10-31',
      debut: '10:00',
      fin: '12:00',
      modalite: 'presentiel',
      salle: 'Salle 102',
      intervenant: 'M. Faye',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec_${userId}_13`,
      userId,
      semaineId,
      matiereId: matIaId,
      intituleRecu: 'Robustesse et sécurité de l\'intelligence artificielle et du big data',
      date: '2026-10-31',
      debut: '13:00',
      fin: '15:00',
      modalite: 'presentiel',
      salle: 'Salle 102',
      intervenant: 'M. Faye',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `sec_${userId}_14`,
      userId,
      semaineId,
      matiereId: matIaId,
      intituleRecu: 'Robustesse et sécurité de l\'intelligence artificielle et du big data',
      date: '2026-10-31',
      debut: '15:00',
      fin: '17:00',
      modalite: 'presentiel',
      salle: 'Salle 102',
      intervenant: 'M. Faye',
      statut: 'prevue',
      origine: 'import',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 4. Devoir démo
  const devoirs: Devoir[] = [
    {
      id: `dev_${userId}_1`,
      userId,
      matiereId: matRisqId,
      titre: 'Rapport d\'analyse des risques PCA / PRA',
      echeance: '2026-11-04T23:59',
      statut: 'a_faire',
      priorite: 'haute',
      notes: 'Étude de cas sur le système bancaire régional.',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 5. Examen démo
  const examens: Examen[] = [
    {
      id: `ex_${userId}_1`,
      userId,
      matiereId: matCyberId,
      date: '2026-11-20',
      heure: '17:00',
      dureeMin: 120,
      salle: 'Amphi B',
      type: 'CC',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 6. Blocs d'indisponibilité récurrents (ex. Travail 09:00 - 16:30 en semaine)
  const indisponibilites: Indisponibilite[] = [1, 2, 3, 4, 5].map(j => ({
    id: `ind_${userId}_${j}`,
    userId,
    jour: j,
    debut: '09:00',
    fin: '16:00',
    libelle: 'Activité professionnelle',
    createdAt: now,
    updatedAt: now,
  }));

  // 7. Évaluations / Notes démo
  const evaluations: Evaluation[] = [
    {
      id: `eval_${userId}_1`,
      userId,
      matiereId: matCyberId,
      intitule: 'Contrôle continu 1 - Analyse de cas pratique',
      note: 15.5,
      bareme: 20,
      coefficient: 1,
      date: '2026-10-20',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: `eval_${userId}_2`,
      userId,
      matiereId: matGouvId,
      intitule: 'Étude de cas ISO 27001 / PSSI',
      note: 16.0,
      bareme: 20,
      coefficient: 1,
      date: '2026-10-22',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // 8. Session de révision démo
  const revisions: SessionRevision[] = [
    {
      id: `rev_${userId}_1`,
      userId,
      matiereId: matCyberId,
      examenId: `ex_${userId}_1`,
      debut: '2026-10-29T15:00',
      dureeMin: 90,
      objectif: 'Réviser la convention de Budapest et le droit pénal spécial cyber',
      statut: 'prevue',
      createdAt: now,
      updatedAt: now,
    },
  ];

  // Save to storage
  const existingSemestres = getItem<Semestre[]>(STORAGE_KEYS.SEMESTRES, []).filter(s => s.userId !== userId);
  setItem(STORAGE_KEYS.SEMESTRES, [...existingSemestres, semestre]);

  const existingMatieres = getItem<Matiere[]>(STORAGE_KEYS.MATIERES, []).filter(m => m.userId !== userId);
  setItem(STORAGE_KEYS.MATIERES, [...existingMatieres, ...matieres]);

  const existingSemaines = getItem<Semaine[]>(STORAGE_KEYS.SEMAINES, []).filter(s => s.userId !== userId);
  setItem(STORAGE_KEYS.SEMAINES, [...existingSemaines, semaine]);

  const existingSeances = getItem<Seance[]>(STORAGE_KEYS.SEANCES, []).filter(s => s.userId !== userId);
  setItem(STORAGE_KEYS.SEANCES, [...existingSeances, ...seances]);

  const existingDevoirs = getItem<Devoir[]>(STORAGE_KEYS.DEVOIRS, []).filter(d => d.userId !== userId);
  setItem(STORAGE_KEYS.DEVOIRS, [...existingDevoirs, ...devoirs]);

  const existingExamens = getItem<Examen[]>(STORAGE_KEYS.EXAMENS, []).filter(e => e.userId !== userId);
  setItem(STORAGE_KEYS.EXAMENS, [...existingExamens, ...examens]);

  const existingIndispos = getItem<Indisponibilite[]>(STORAGE_KEYS.INDISPONIBILITES, []).filter(i => i.userId !== userId);
  setItem(STORAGE_KEYS.INDISPONIBILITES, [...existingIndispos, ...indisponibilites]);

  const existingEvals = getItem<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []).filter(e => e.userId !== userId);
  setItem(STORAGE_KEYS.EVALUATIONS, [...existingEvals, ...evaluations]);

  const existingRevs = getItem<SessionRevision[]>(STORAGE_KEYS.REVISIONS, []).filter(r => r.userId !== userId);
  setItem(STORAGE_KEYS.REVISIONS, [...existingRevs, ...revisions]);

  // Initial Settings
  const defaultSettings: UserSettings = {
    id: `settings_${userId}`,
    userId,
    plageDisponibilite: { debut: '08:00', fin: '22:00' },
    consentementIA: false,
    notifications: {
      rappelCours: true,
      rappelPointage: true,
      seanceModifiee: true,
      edtManquant: true,
      rappelDevoir: true,
      rappelExamen: true,
      heuresCalmesActives: true,
      heuresCalmesDebut: '23:00',
      heuresCalmesFin: '07:00',
    },
    createdAt: now,
    updatedAt: now,
  };
  const existingSettings = getItem<UserSettings[]>(STORAGE_KEYS.SETTINGS, []).filter(s => s.userId !== userId);
  setItem(STORAGE_KEYS.SETTINGS, [...existingSettings, defaultSettings]);
}

// Repositories Implementations

export class SemestreRepository implements ISemestreRepository {
  async getAll(userId: string): Promise<Semestre[]> {
    const all = getItem<Semestre[]>(STORAGE_KEYS.SEMESTRES, []);
    return all.filter(s => s.userId === userId);
  }

  async getActif(userId: string): Promise<Semestre | undefined> {
    const list = await this.getAll(userId);
    return list.find(s => s.actif) || list[0];
  }

  async getById(id: string, userId: string): Promise<Semestre | undefined> {
    const list = await this.getAll(userId);
    return list.find(s => s.id === id);
  }

  async create(data: Omit<Semestre, 'id' | 'createdAt' | 'updatedAt'>): Promise<Semestre> {
    const now = new Date().toISOString();
    const newSem: Semestre = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const all = getItem<Semestre[]>(STORAGE_KEYS.SEMESTRES, []);
    if (newSem.actif) {
      all.forEach(s => {
        if (s.userId === data.userId) s.actif = false;
      });
    }
    setItem(STORAGE_KEYS.SEMESTRES, [...all, newSem]);
    return newSem;
  }

  async update(id: string, userId: string, updates: Partial<Semestre>): Promise<Semestre> {
    const all = getItem<Semestre[]>(STORAGE_KEYS.SEMESTRES, []);
    const idx = all.findIndex(s => s.id === id && s.userId === userId);
    if (idx === -1) throw new Error('Semestre non trouvé');

    if (updates.actif) {
      all.forEach(s => {
        if (s.userId === userId) s.actif = false;
      });
    }

    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.SEMESTRES, all);
    return all[idx];
  }

  async delete(id: string, userId: string): Promise<void> {
    const all = getItem<Semestre[]>(STORAGE_KEYS.SEMESTRES, []);
    setItem(STORAGE_KEYS.SEMESTRES, all.filter(s => !(s.id === id && s.userId === userId)));
  }

  async setActif(id: string, userId: string): Promise<void> {
    const all = getItem<Semestre[]>(STORAGE_KEYS.SEMESTRES, []);
    all.forEach(s => {
      if (s.userId === userId) {
        s.actif = s.id === id;
        s.updatedAt = new Date().toISOString();
      }
    });
    setItem(STORAGE_KEYS.SEMESTRES, all);
  }
}

export class MatiereRepository implements IMatiereRepository {
  async getAll(userId: string, semestreId?: string): Promise<Matiere[]> {
    const all = getItem<Matiere[]>(STORAGE_KEYS.MATIERES, []);
    return all.filter(m => m.userId === userId && (!semestreId || m.semestreId === semestreId));
  }

  async getById(id: string, userId: string): Promise<Matiere | undefined> {
    const all = getItem<Matiere[]>(STORAGE_KEYS.MATIERES, []);
    return all.find(m => m.id === id && m.userId === userId);
  }

  async create(data: Omit<Matiere, 'id' | 'createdAt' | 'updatedAt'>): Promise<Matiere> {
    const now = new Date().toISOString();
    const newM: Matiere = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const all = getItem<Matiere[]>(STORAGE_KEYS.MATIERES, []);
    setItem(STORAGE_KEYS.MATIERES, [...all, newM]);
    return newM;
  }

  async update(id: string, userId: string, updates: Partial<Matiere>): Promise<Matiere> {
    const all = getItem<Matiere[]>(STORAGE_KEYS.MATIERES, []);
    const idx = all.findIndex(m => m.id === id && m.userId === userId);
    if (idx === -1) throw new Error('Matière non trouvée');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.MATIERES, all);
    return all[idx];
  }

  async delete(id: string, userId: string): Promise<void> {
    const all = getItem<Matiere[]>(STORAGE_KEYS.MATIERES, []);
    setItem(STORAGE_KEYS.MATIERES, all.filter(m => !(m.id === id && m.userId === userId)));
  }
}

export class SemaineRepository implements ISemaineRepository {
  async getBySemestre(semestreId: string, userId: string): Promise<Semaine[]> {
    const all = getItem<Semaine[]>(STORAGE_KEYS.SEMAINES, []);
    return all.filter(s => s.userId === userId && s.semestreId === semestreId);
  }

  async getByLundi(lundi: string, userId: string): Promise<Semaine | undefined> {
    const all = getItem<Semaine[]>(STORAGE_KEYS.SEMAINES, []);
    return all.find(s => s.userId === userId && s.lundi === lundi);
  }

  async create(data: Omit<Semaine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Semaine> {
    const now = new Date().toISOString();
    const newSemaine: Semaine = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const all = getItem<Semaine[]>(STORAGE_KEYS.SEMAINES, []);
    setItem(STORAGE_KEYS.SEMAINES, [...all, newSemaine]);
    return newSemaine;
  }

  async update(id: string, userId: string, updates: Partial<Semaine>): Promise<Semaine> {
    const all = getItem<Semaine[]>(STORAGE_KEYS.SEMAINES, []);
    const idx = all.findIndex(s => s.id === id && s.userId === userId);
    if (idx === -1) throw new Error('Semaine non trouvée');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.SEMAINES, all);
    return all[idx];
  }
}

export class SeanceRepository implements ISeanceRepository {
  async getBySemaine(semaineId: string, userId: string): Promise<Seance[]> {
    const all = getItem<Seance[]>(STORAGE_KEYS.SEANCES, []);
    return all.filter(s => s.userId === userId && s.semaineId === semaineId);
  }

  async getByDate(date: string, userId: string): Promise<Seance[]> {
    const all = getItem<Seance[]>(STORAGE_KEYS.SEANCES, []);
    return all.filter(s => s.userId === userId && s.date === date);
  }

  async getById(id: string, userId: string): Promise<Seance | undefined> {
    const all = getItem<Seance[]>(STORAGE_KEYS.SEANCES, []);
    return all.find(s => s.id === id && s.userId === userId);
  }

  async create(data: Omit<Seance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Seance> {
    const now = new Date().toISOString();
    const newS: Seance = {
      ...data,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const all = getItem<Seance[]>(STORAGE_KEYS.SEANCES, []);
    setItem(STORAGE_KEYS.SEANCES, [...all, newS]);
    return newS;
  }

  async update(id: string, userId: string, updates: Partial<Seance>): Promise<Seance> {
    const all = getItem<Seance[]>(STORAGE_KEYS.SEANCES, []);
    const idx = all.findIndex(s => s.id === id && s.userId === userId);
    if (idx === -1) throw new Error('Séance non trouvée');

    const avant = all[idx];
    const now = new Date().toISOString();

    // Track history for changed fields
    const fieldsToTrack: (keyof Seance)[] = ['date', 'debut', 'fin', 'salle', 'lien', 'statut'];
    for (const f of fieldsToTrack) {
      if (updates[f] !== undefined && updates[f] !== avant[f]) {
        await this.addHistorique({
          userId,
          seanceId: id,
          champ: f,
          avant: String(avant[f] ?? ''),
          apres: String(updates[f] ?? ''),
        });
      }
    }

    all[idx] = { ...all[idx], ...updates, updatedAt: now };
    setItem(STORAGE_KEYS.SEANCES, all);
    return all[idx];
  }

  async delete(id: string, userId: string): Promise<void> {
    const all = getItem<Seance[]>(STORAGE_KEYS.SEANCES, []);
    setItem(STORAGE_KEYS.SEANCES, all.filter(s => !(s.id === id && s.userId === userId)));
  }

  async getHistorique(seanceId: string, userId: string): Promise<HistoriqueSeance[]> {
    const all = getItem<HistoriqueSeance[]>(STORAGE_KEYS.HISTORIQUE, []);
    return all.filter(h => h.userId === userId && h.seanceId === seanceId);
  }

  async addHistorique(entry: Omit<HistoriqueSeance, 'id' | 'createdAt' | 'updatedAt'>): Promise<void> {
    const now = new Date().toISOString();
    const newH: HistoriqueSeance = {
      ...entry,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    const all = getItem<HistoriqueSeance[]>(STORAGE_KEYS.HISTORIQUE, []);
    setItem(STORAGE_KEYS.HISTORIQUE, [...all, newH]);
  }
}

export class PresenceRepository implements IPresenceRepository {
  async getByUser(userId: string): Promise<Presence[]> {
    const all = getItem<Presence[]>(STORAGE_KEYS.PRESENCES, []);
    return all.filter(p => p.userId === userId);
  }

  async getBySeance(seanceId: string, userId: string): Promise<Presence | undefined> {
    const all = getItem<Presence[]>(STORAGE_KEYS.PRESENCES, []);
    return all.find(p => p.userId === userId && p.seanceId === seanceId);
  }

  async setPresence(data: Omit<Presence, 'id' | 'createdAt' | 'updatedAt' | 'pointeeLe'>): Promise<Presence> {
    const all = getItem<Presence[]>(STORAGE_KEYS.PRESENCES, []);
    const now = new Date().toISOString();
    const existingIdx = all.findIndex(p => p.userId === data.userId && p.seanceId === data.seanceId);

    if (existingIdx !== -1) {
      all[existingIdx] = {
        ...all[existingIdx],
        ...data,
        pointeeLe: now,
        updatedAt: now,
      };
      setItem(STORAGE_KEYS.PRESENCES, all);
      return all[existingIdx];
    } else {
      const newP: Presence = {
        ...data,
        id: generateId(),
        pointeeLe: now,
        createdAt: now,
        updatedAt: now,
      };
      setItem(STORAGE_KEYS.PRESENCES, [...all, newP]);
      return newP;
    }
  }

  async deletePresence(seanceId: string, userId: string): Promise<void> {
    const all = getItem<Presence[]>(STORAGE_KEYS.PRESENCES, []);
    setItem(STORAGE_KEYS.PRESENCES, all.filter(p => !(p.userId === userId && p.seanceId === seanceId)));
  }
}

export class DevoirRepository implements IDevoirRepository {
  async getAll(userId: string): Promise<Devoir[]> {
    const all = getItem<Devoir[]>(STORAGE_KEYS.DEVOIRS, []);
    return all.filter(d => d.userId === userId);
  }

  async create(data: Omit<Devoir, 'id' | 'createdAt' | 'updatedAt'>): Promise<Devoir> {
    const now = new Date().toISOString();
    const newD: Devoir = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<Devoir[]>(STORAGE_KEYS.DEVOIRS, []);
    setItem(STORAGE_KEYS.DEVOIRS, [...all, newD]);
    return newD;
  }

  async update(id: string, userId: string, updates: Partial<Devoir>): Promise<Devoir> {
    const all = getItem<Devoir[]>(STORAGE_KEYS.DEVOIRS, []);
    const idx = all.findIndex(d => d.id === id && d.userId === userId);
    if (idx === -1) throw new Error('Devoir non trouvé');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.DEVOIRS, all);
    return all[idx];
  }

  async delete(id: string, userId: string): Promise<void> {
    const all = getItem<Devoir[]>(STORAGE_KEYS.DEVOIRS, []);
    setItem(STORAGE_KEYS.DEVOIRS, all.filter(d => !(d.id === id && d.userId === userId)));
  }
}

export class ExamenRepository implements IExamenRepository {
  async getAll(userId: string): Promise<Examen[]> {
    const all = getItem<Examen[]>(STORAGE_KEYS.EXAMENS, []);
    return all.filter(e => e.userId === userId);
  }

  async create(data: Omit<Examen, 'id' | 'createdAt' | 'updatedAt'>): Promise<Examen> {
    const now = new Date().toISOString();
    const newEx: Examen = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<Examen[]>(STORAGE_KEYS.EXAMENS, []);
    setItem(STORAGE_KEYS.EXAMENS, [...all, newEx]);
    return newEx;
  }

  async update(id: string, userId: string, updates: Partial<Examen>): Promise<Examen> {
    const all = getItem<Examen[]>(STORAGE_KEYS.EXAMENS, []);
    const idx = all.findIndex(e => e.id === id && e.userId === userId);
    if (idx === -1) throw new Error('Examen non trouvé');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.EXAMENS, all);
    return all[idx];
  }

  async delete(id: string, userId: string): Promise<void> {
    const all = getItem<Examen[]>(STORAGE_KEYS.EXAMENS, []);
    setItem(STORAGE_KEYS.EXAMENS, all.filter(e => !(e.id === id && e.userId === userId)));
  }
}

export class EvenementRepository implements IEvenementRepository {
  async getAll(userId: string): Promise<Evenement[]> {
    const all = getItem<Evenement[]>(STORAGE_KEYS.EVENEMENTS, []);
    return all.filter(e => e.userId === userId);
  }

  async create(data: Omit<Evenement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evenement> {
    const now = new Date().toISOString();
    const newEv: Evenement = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<Evenement[]>(STORAGE_KEYS.EVENEMENTS, []);
    setItem(STORAGE_KEYS.EVENEMENTS, [...all, newEv]);
    return newEv;
  }

  async update(id: string, userId: string, updates: Partial<Evenement>): Promise<Evenement> {
    const all = getItem<Evenement[]>(STORAGE_KEYS.EVENEMENTS, []);
    const idx = all.findIndex(e => e.id === id && e.userId === userId);
    if (idx === -1) throw new Error('Événement non trouvé');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.EVENEMENTS, all);
    return all[idx];
  }

  async delete(id: string, userId: string): Promise<void> {
    const all = getItem<Evenement[]>(STORAGE_KEYS.EVENEMENTS, []);
    setItem(STORAGE_KEYS.EVENEMENTS, all.filter(e => !(e.id === id && e.userId === userId)));
  }
}

export class ImportRepository implements IImportRepository {
  async getAll(userId: string): Promise<ImportFichier[]> {
    const all = getItem<ImportFichier[]>(STORAGE_KEYS.IMPORTS, []);
    return all.filter(i => i.userId === userId);
  }

  async create(data: Omit<ImportFichier, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImportFichier> {
    const now = new Date().toISOString();
    const newImp: ImportFichier = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<ImportFichier[]>(STORAGE_KEYS.IMPORTS, []);
    setItem(STORAGE_KEYS.IMPORTS, [...all, newImp]);
    return newImp;
  }

  async cancelImport(id: string, userId: string): Promise<void> {
    const all = getItem<ImportFichier[]>(STORAGE_KEYS.IMPORTS, []);
    const imp = all.find(i => i.id === id && i.userId === userId);
    if (!imp) return;
    imp.annule = true;
    setItem(STORAGE_KEYS.IMPORTS, all);

    // Also remove the associated sessions or set week to vide
    const allSemaines = getItem<Semaine[]>(STORAGE_KEYS.SEMAINES, []);
    const allSeances = getItem<Seance[]>(STORAGE_KEYS.SEANCES, []);

    const updatedSemaines = allSemaines.map(s => {
      if (s.userId === userId && imp.semaines.includes(s.lundi)) {
        return { ...s, statut: 'vide' as const };
      }
      return s;
    });
    setItem(STORAGE_KEYS.SEMAINES, updatedSemaines);

    const filteredSeances = allSeances.filter(s => {
      if (s.userId === userId && s.origine === 'import') {
        const week = allSemaines.find(w => w.id === s.semaineId);
        if (week && imp.semaines.includes(week.lundi)) {
          return false;
        }
      }
      return true;
    });
    setItem(STORAGE_KEYS.SEANCES, filteredSeances);
  }
}

export class SettingsRepository implements ISettingsRepository {
  async getSettings(userId: string): Promise<UserSettings> {
    const all = getItem<UserSettings[]>(STORAGE_KEYS.SETTINGS, []);
    const userSettings = all.find(s => s.userId === userId);
    if (userSettings) return userSettings;

    const now = new Date().toISOString();
    const defaultSettings: UserSettings = {
      id: generateId(),
      userId,
      plageDisponibilite: { debut: '08:00', fin: '22:00' },
      consentementIA: false,
      notifications: {
        rappelCours: true,
        rappelPointage: true,
        seanceModifiee: true,
        edtManquant: true,
        rappelDevoir: true,
        rappelExamen: true,
        heuresCalmesActives: true,
        heuresCalmesDebut: '23:00',
        heuresCalmesFin: '07:00',
      },
      createdAt: now,
      updatedAt: now,
    };
    setItem(STORAGE_KEYS.SETTINGS, [...all, defaultSettings]);
    return defaultSettings;
  }

  async updateSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings> {
    const all = getItem<UserSettings[]>(STORAGE_KEYS.SETTINGS, []);
    let idx = all.findIndex(s => s.userId === userId);
    const now = new Date().toISOString();

    if (idx === -1) {
      const created = await this.getSettings(userId);
      all.push(created);
      idx = all.length - 1;
    }

    all[idx] = { ...all[idx], ...updates, updatedAt: now };
    setItem(STORAGE_KEYS.SETTINGS, all);
    return all[idx];
  }

  async getIndisponibilites(userId: string): Promise<Indisponibilite[]> {
    const all = getItem<Indisponibilite[]>(STORAGE_KEYS.INDISPONIBILITES, []);
    return all.filter(i => i.userId === userId);
  }

  async setIndisponibilites(userId: string, items: Indisponibilite[]): Promise<void> {
    const all = getItem<Indisponibilite[]>(STORAGE_KEYS.INDISPONIBILITES, []);
    const otherUsers = all.filter(i => i.userId !== userId);
    setItem(STORAGE_KEYS.INDISPONIBILITES, [...otherUsers, ...items]);
  }
}

export class InvitationRepository implements IInvitationRepository {
  async validateCode(code: string): Promise<boolean> {
    const clean = code.trim().toUpperCase();
    if (clean === 'ESP2026') return true; // Default master invite code
    const all = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, []);
    return all.some(inv => inv.code.toUpperCase() === clean && !inv.revoquee);
  }

  async getInvitations(userId: string): Promise<Invitation[]> {
    const all = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, []);
    return all.filter(i => i.userId === userId);
  }

  async createInvitation(userId: string, email?: string): Promise<Invitation> {
    const now = new Date().toISOString();
    const code = `ESP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
    const newInv: Invitation = {
      id: generateId(),
      userId,
      code,
      email,
      expireLe: new Date(Date.now() + 30 * 86400000).toISOString(),
      revoquee: false,
      createdAt: now,
      updatedAt: now,
    };
    const all = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, []);
    setItem(STORAGE_KEYS.INVITATIONS, [...all, newInv]);
    return newInv;
  }

  async revokeInvitation(id: string, userId: string): Promise<void> {
    const all = getItem<Invitation[]>(STORAGE_KEYS.INVITATIONS, []);
    const inv = all.find(i => i.id === id && i.userId === userId);
    if (inv) {
      inv.revoquee = true;
      inv.updatedAt = new Date().toISOString();
      setItem(STORAGE_KEYS.INVITATIONS, all);
    }
  }
}

export class EvaluationRepository implements IEvaluationRepository {
  async getAll(userId: string, matiereId?: string): Promise<Evaluation[]> {
    const all = getItem<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    return all.filter(e => e.userId === userId && (!matiereId || e.matiereId === matiereId));
  }

  async create(data: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evaluation> {
    const now = new Date().toISOString();
    const newE: Evaluation = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    setItem(STORAGE_KEYS.EVALUATIONS, [...all, newE]);
    return newE;
  }

  async update(id: string, userId: string, updates: Partial<Evaluation>): Promise<Evaluation> {
    const all = getItem<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    const idx = all.findIndex(e => e.id === id && e.userId === userId);
    if (idx === -1) throw new Error('Évaluation non trouvée');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.EVALUATIONS, all);
    return all[idx];
  }

  async delete(id: string, userId: string): Promise<void> {
    const all = getItem<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    setItem(STORAGE_KEYS.EVALUATIONS, all.filter(e => !(e.id === id && e.userId === userId)));
  }
}

export class ClubRepository implements IClubRepository {
  async getAll(userId: string): Promise<Club[]> {
    const legacyDemoClubId = `club_${userId}_comsoc`;
    const all = getItem<Club[]>(STORAGE_KEYS.CLUBS, []);
    const cleaned = all.filter(c => !(c.userId === userId && c.id === legacyDemoClubId));

    if (cleaned.length !== all.length) {
      setItem(STORAGE_KEYS.CLUBS, cleaned);
      const reunions = getItem<ReunionClub[]>(STORAGE_KEYS.REUNIONS_CLUB, []);
      setItem(STORAGE_KEYS.REUNIONS_CLUB, reunions.filter(r => !(r.userId === userId && r.clubId === legacyDemoClubId)));
      const taches = getItem<TacheClub[]>(STORAGE_KEYS.TACHES_CLUB, []);
      setItem(STORAGE_KEYS.TACHES_CLUB, taches.filter(t => !(t.userId === userId && t.clubId === legacyDemoClubId)));
      const comptesRendus = getItem<CompteRendu[]>(STORAGE_KEYS.COMPTES_RENDUS, []);
      setItem(STORAGE_KEYS.COMPTES_RENDUS, comptesRendus.filter(cr => !(cr.userId === userId && cr.clubId === legacyDemoClubId)));
      const contacts = getItem<ContactClub[]>(STORAGE_KEYS.CONTACTS_CLUB, []);
      setItem(STORAGE_KEYS.CONTACTS_CLUB, contacts.filter(c => !(c.userId === userId && c.clubId === legacyDemoClubId)));
    }

    return cleaned.filter(c => c.userId === userId);
  }

  async getById(id: string, userId: string): Promise<Club | undefined> {
    const all = getItem<Club[]>(STORAGE_KEYS.CLUBS, []);
    return all.find(c => c.id === id && c.userId === userId);
  }

  async create(data: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Promise<Club> {
    const now = new Date().toISOString();
    const newC: Club = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<Club[]>(STORAGE_KEYS.CLUBS, []);
    setItem(STORAGE_KEYS.CLUBS, [...all, newC]);
    return newC;
  }

  async update(id: string, userId: string, updates: Partial<Club>): Promise<Club> {
    const all = getItem<Club[]>(STORAGE_KEYS.CLUBS, []);
    const idx = all.findIndex(c => c.id === id && c.userId === userId);
    if (idx === -1) throw new Error('Club non trouvé');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.CLUBS, all);
    return all[idx];
  }

  async delete(id: string, userId: string): Promise<void> {
    const all = getItem<Club[]>(STORAGE_KEYS.CLUBS, []);
    const target = all.find(c => c.id === id && c.userId === userId);
    setItem(STORAGE_KEYS.CLUBS, all.filter(c => !(c.id === id && c.userId === userId)));

    if (!target) return;

    const reunions = getItem<ReunionClub[]>(STORAGE_KEYS.REUNIONS_CLUB, []);
    setItem(STORAGE_KEYS.REUNIONS_CLUB, reunions.filter(r => !(r.userId === userId && r.clubId === id)));
    const taches = getItem<TacheClub[]>(STORAGE_KEYS.TACHES_CLUB, []);
    setItem(STORAGE_KEYS.TACHES_CLUB, taches.filter(t => !(t.userId === userId && t.clubId === id)));
    const comptesRendus = getItem<CompteRendu[]>(STORAGE_KEYS.COMPTES_RENDUS, []);
    setItem(STORAGE_KEYS.COMPTES_RENDUS, comptesRendus.filter(cr => !(cr.userId === userId && cr.clubId === id)));
    const contacts = getItem<ContactClub[]>(STORAGE_KEYS.CONTACTS_CLUB, []);
    setItem(STORAGE_KEYS.CONTACTS_CLUB, contacts.filter(c => !(c.userId === userId && c.clubId === id)));
  }

  // Reunions
  async getReunions(clubId: string, userId: string): Promise<ReunionClub[]> {
    const all = getItem<ReunionClub[]>(STORAGE_KEYS.REUNIONS_CLUB, []);
    return all.filter(r => r.userId === userId && r.clubId === clubId);
  }

  async createReunion(data: Omit<ReunionClub, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReunionClub> {
    const now = new Date().toISOString();
    const newR: ReunionClub = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<ReunionClub[]>(STORAGE_KEYS.REUNIONS_CLUB, []);
    setItem(STORAGE_KEYS.REUNIONS_CLUB, [...all, newR]);
    return newR;
  }

  async deleteReunion(id: string, userId: string): Promise<void> {
    const all = getItem<ReunionClub[]>(STORAGE_KEYS.REUNIONS_CLUB, []);
    setItem(STORAGE_KEYS.REUNIONS_CLUB, all.filter(r => !(r.id === id && r.userId === userId)));
  }

  // Taches
  async getTaches(clubId: string, userId: string): Promise<TacheClub[]> {
    const all = getItem<TacheClub[]>(STORAGE_KEYS.TACHES_CLUB, []);
    return all.filter(t => t.userId === userId && t.clubId === clubId);
  }

  async createTache(data: Omit<TacheClub, 'id' | 'createdAt' | 'updatedAt'>): Promise<TacheClub> {
    const now = new Date().toISOString();
    const newT: TacheClub = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<TacheClub[]>(STORAGE_KEYS.TACHES_CLUB, []);
    setItem(STORAGE_KEYS.TACHES_CLUB, [...all, newT]);
    return newT;
  }

  async updateTache(id: string, userId: string, updates: Partial<TacheClub>): Promise<TacheClub> {
    const all = getItem<TacheClub[]>(STORAGE_KEYS.TACHES_CLUB, []);
    const idx = all.findIndex(t => t.id === id && t.userId === userId);
    if (idx === -1) throw new Error('Tâche non trouvée');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.TACHES_CLUB, all);
    return all[idx];
  }

  async deleteTache(id: string, userId: string): Promise<void> {
    const all = getItem<TacheClub[]>(STORAGE_KEYS.TACHES_CLUB, []);
    setItem(STORAGE_KEYS.TACHES_CLUB, all.filter(t => !(t.id === id && t.userId === userId)));
  }

  // Comptes Rendus
  async getComptesRendus(clubId: string, userId: string): Promise<CompteRendu[]> {
    const all = getItem<CompteRendu[]>(STORAGE_KEYS.COMPTES_RENDUS, []);
    return all.filter(cr => cr.userId === userId && cr.clubId === clubId);
  }

  async createCompteRendu(data: Omit<CompteRendu, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompteRendu> {
    const now = new Date().toISOString();
    const newCR: CompteRendu = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<CompteRendu[]>(STORAGE_KEYS.COMPTES_RENDUS, []);
    setItem(STORAGE_KEYS.COMPTES_RENDUS, [...all, newCR]);
    return newCR;
  }

  async deleteCompteRendu(id: string, userId: string): Promise<void> {
    const all = getItem<CompteRendu[]>(STORAGE_KEYS.COMPTES_RENDUS, []);
    setItem(STORAGE_KEYS.COMPTES_RENDUS, all.filter(cr => !(cr.id === id && cr.userId === userId)));
  }

  // Contacts
  async getContacts(clubId: string, userId: string): Promise<ContactClub[]> {
    const all = getItem<ContactClub[]>(STORAGE_KEYS.CONTACTS_CLUB, []);
    return all.filter(c => c.userId === userId && c.clubId === clubId);
  }

  async createContact(data: Omit<ContactClub, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContactClub> {
    const now = new Date().toISOString();
    const newC: ContactClub = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<ContactClub[]>(STORAGE_KEYS.CONTACTS_CLUB, []);
    setItem(STORAGE_KEYS.CONTACTS_CLUB, [...all, newC]);
    return newC;
  }

  async deleteContact(id: string, userId: string): Promise<void> {
    const all = getItem<ContactClub[]>(STORAGE_KEYS.CONTACTS_CLUB, []);
    setItem(STORAGE_KEYS.CONTACTS_CLUB, all.filter(c => !(c.id === id && c.userId === userId)));
  }
}

export class SessionRevisionRepository implements ISessionRevisionRepository {
  async getAll(userId: string): Promise<SessionRevision[]> {
    const all = getItem<SessionRevision[]>(STORAGE_KEYS.REVISIONS, []);
    return all.filter(r => r.userId === userId);
  }

  async create(data: Omit<SessionRevision, 'id' | 'createdAt' | 'updatedAt'>): Promise<SessionRevision> {
    const now = new Date().toISOString();
    const newR: SessionRevision = { ...data, id: generateId(), createdAt: now, updatedAt: now };
    const all = getItem<SessionRevision[]>(STORAGE_KEYS.REVISIONS, []);
    setItem(STORAGE_KEYS.REVISIONS, [...all, newR]);
    return newR;
  }

  async update(id: string, userId: string, updates: Partial<SessionRevision>): Promise<SessionRevision> {
    const all = getItem<SessionRevision[]>(STORAGE_KEYS.REVISIONS, []);
    const idx = all.findIndex(r => r.id === id && r.userId === userId);
    if (idx === -1) throw new Error('Session non trouvée');
    all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.REVISIONS, all);
    return all[idx];
  }

  async delete(id: string, userId: string): Promise<void> {
    const all = getItem<SessionRevision[]>(STORAGE_KEYS.REVISIONS, []);
    setItem(STORAGE_KEYS.REVISIONS, all.filter(r => !(r.id === id && r.userId === userId)));
  }
}

// User / Account Management
export async function exportAllUserDataAsJson(userId: string): Promise<string> {
  const data = {
    semestres: getItem<Semestre[]>(STORAGE_KEYS.SEMESTRES, []).filter(s => s.userId === userId),
    matieres: getItem<Matiere[]>(STORAGE_KEYS.MATIERES, []).filter(m => m.userId === userId),
    semaines: getItem<Semaine[]>(STORAGE_KEYS.SEMAINES, []).filter(s => s.userId === userId),
    seances: getItem<Seance[]>(STORAGE_KEYS.SEANCES, []).filter(s => s.userId === userId),
    presences: getItem<Presence[]>(STORAGE_KEYS.PRESENCES, []).filter(p => p.userId === userId),
    devoirs: getItem<Devoir[]>(STORAGE_KEYS.DEVOIRS, []).filter(d => d.userId === userId),
    examens: getItem<Examen[]>(STORAGE_KEYS.EXAMENS, []).filter(e => e.userId === userId),
    evenements: getItem<Evenement[]>(STORAGE_KEYS.EVENEMENTS, []).filter(e => e.userId === userId),
    settings: getItem<UserSettings[]>(STORAGE_KEYS.SETTINGS, []).find(s => s.userId === userId),
    indisponibilites: getItem<Indisponibilite[]>(STORAGE_KEYS.INDISPONIBILITES, []).filter(i => i.userId === userId),
  };
  return JSON.stringify(data, null, 2);
}

export async function deleteAllUserData(userId: string): Promise<void> {
  const keys = [
    STORAGE_KEYS.SEMESTRES,
    STORAGE_KEYS.MATIERES,
    STORAGE_KEYS.SEMAINES,
    STORAGE_KEYS.SEANCES,
    STORAGE_KEYS.HISTORIQUE,
    STORAGE_KEYS.PRESENCES,
    STORAGE_KEYS.IMPORTS,
    STORAGE_KEYS.DEVOIRS,
    STORAGE_KEYS.EXAMENS,
    STORAGE_KEYS.EVENEMENTS,
    STORAGE_KEYS.INDISPONIBILITES,
    STORAGE_KEYS.INVITATIONS,
    STORAGE_KEYS.SETTINGS,
  ];

  for (const k of keys) {
    const list = getItem<any[]>(k, []);
    const remaining = list.filter(item => item.userId !== userId);
    setItem(k, remaining);
  }

  // Remove from users list
  const users = getItem<User[]>(STORAGE_KEYS.USERS, []);
  setItem(STORAGE_KEYS.USERS, users.filter(u => u.id !== userId));

  const current = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  if (current?.id === userId) {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}
