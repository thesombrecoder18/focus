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
  Club,
  ReunionClub,
  TacheClub,
  CompteRendu,
  ContactClub,
  Evaluation,
  SessionRevision,
  Invitation,
  UserSettings
} from '@/types';

export interface ISemestreRepository {
  getAll(userId: string): Promise<Semestre[]>;
  getActif(userId: string): Promise<Semestre | undefined>;
  getById(id: string, userId: string): Promise<Semestre | undefined>;
  create(semestre: Omit<Semestre, 'id' | 'createdAt' | 'updatedAt'>): Promise<Semestre>;
  update(id: string, userId: string, updates: Partial<Semestre>): Promise<Semestre>;
  delete(id: string, userId: string): Promise<void>;
  setActif(id: string, userId: string): Promise<void>;
}

export interface IMatiereRepository {
  getAll(userId: string, semestreId?: string): Promise<Matiere[]>;
  getById(id: string, userId: string): Promise<Matiere | undefined>;
  create(matiere: Omit<Matiere, 'id' | 'createdAt' | 'updatedAt'>): Promise<Matiere>;
  update(id: string, userId: string, updates: Partial<Matiere>): Promise<Matiere>;
  delete(id: string, userId: string): Promise<void>;
}

export interface ISemaineRepository {
  getBySemestre(semestreId: string, userId: string): Promise<Semaine[]>;
  getByLundi(lundi: string, userId: string): Promise<Semaine | undefined>;
  create(semaine: Omit<Semaine, 'id' | 'createdAt' | 'updatedAt'>): Promise<Semaine>;
  update(id: string, userId: string, updates: Partial<Semaine>): Promise<Semaine>;
}

export interface ISeanceRepository {
  getBySemaine(semaineId: string, userId: string): Promise<Seance[]>;
  getByDate(date: string, userId: string): Promise<Seance[]>;
  getById(id: string, userId: string): Promise<Seance | undefined>;
  create(seance: Omit<Seance, 'id' | 'createdAt' | 'updatedAt'>): Promise<Seance>;
  update(id: string, userId: string, updates: Partial<Seance>): Promise<Seance>;
  delete(id: string, userId: string): Promise<void>;
  getHistorique(seanceId: string, userId: string): Promise<HistoriqueSeance[]>;
  addHistorique(entry: Omit<HistoriqueSeance, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>;
}

export interface IPresenceRepository {
  getByUser(userId: string): Promise<Presence[]>;
  getBySeance(seanceId: string, userId: string): Promise<Presence | undefined>;
  setPresence(presence: Omit<Presence, 'id' | 'createdAt' | 'updatedAt' | 'pointeeLe'>): Promise<Presence>;
  deletePresence(seanceId: string, userId: string): Promise<void>;
}

export interface IDevoirRepository {
  getAll(userId: string): Promise<Devoir[]>;
  create(devoir: Omit<Devoir, 'id' | 'createdAt' | 'updatedAt'>): Promise<Devoir>;
  update(id: string, userId: string, updates: Partial<Devoir>): Promise<Devoir>;
  delete(id: string, userId: string): Promise<void>;
}

export interface IExamenRepository {
  getAll(userId: string): Promise<Examen[]>;
  create(examen: Omit<Examen, 'id' | 'createdAt' | 'updatedAt'>): Promise<Examen>;
  update(id: string, userId: string, updates: Partial<Examen>): Promise<Examen>;
  delete(id: string, userId: string): Promise<void>;
}

export interface IEvenementRepository {
  getAll(userId: string): Promise<Evenement[]>;
  create(event: Omit<Evenement, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evenement>;
  update(id: string, userId: string, updates: Partial<Evenement>): Promise<Evenement>;
  delete(id: string, userId: string): Promise<void>;
}

export interface IEvaluationRepository {
  getAll(userId: string, matiereId?: string): Promise<Evaluation[]>;
  create(evalData: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>): Promise<Evaluation>;
  update(id: string, userId: string, updates: Partial<Evaluation>): Promise<Evaluation>;
  delete(id: string, userId: string): Promise<void>;
}

export interface IClubRepository {
  getAll(userId: string): Promise<Club[]>;
  getById(id: string, userId: string): Promise<Club | undefined>;
  create(club: Omit<Club, 'id' | 'createdAt' | 'updatedAt'>): Promise<Club>;
  update(id: string, userId: string, updates: Partial<Club>): Promise<Club>;
  delete(id: string, userId: string): Promise<void>;
  
  // Sub-entities
  getReunions(clubId: string, userId: string): Promise<ReunionClub[]>;
  createReunion(reunion: Omit<ReunionClub, 'id' | 'createdAt' | 'updatedAt'>): Promise<ReunionClub>;
  deleteReunion(id: string, userId: string): Promise<void>;

  getTaches(clubId: string, userId: string): Promise<TacheClub[]>;
  createTache(tache: Omit<TacheClub, 'id' | 'createdAt' | 'updatedAt'>): Promise<TacheClub>;
  updateTache(id: string, userId: string, updates: Partial<TacheClub>): Promise<TacheClub>;
  deleteTache(id: string, userId: string): Promise<void>;

  getComptesRendus(clubId: string, userId: string): Promise<CompteRendu[]>;
  createCompteRendu(cr: Omit<CompteRendu, 'id' | 'createdAt' | 'updatedAt'>): Promise<CompteRendu>;
  deleteCompteRendu(id: string, userId: string): Promise<void>;

  getContacts(clubId: string, userId: string): Promise<ContactClub[]>;
  createContact(contact: Omit<ContactClub, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContactClub>;
  deleteContact(id: string, userId: string): Promise<void>;
}

export interface ISessionRevisionRepository {
  getAll(userId: string): Promise<SessionRevision[]>;
  create(session: Omit<SessionRevision, 'id' | 'createdAt' | 'updatedAt'>): Promise<SessionRevision>;
  update(id: string, userId: string, updates: Partial<SessionRevision>): Promise<SessionRevision>;
  delete(id: string, userId: string): Promise<void>;
}

export interface IImportRepository {
  getAll(userId: string): Promise<ImportFichier[]>;
  create(imp: Omit<ImportFichier, 'id' | 'createdAt' | 'updatedAt'>): Promise<ImportFichier>;
  cancelImport(id: string, userId: string): Promise<void>;
}

export interface ISettingsRepository {
  getSettings(userId: string): Promise<UserSettings>;
  updateSettings(userId: string, updates: Partial<UserSettings>): Promise<UserSettings>;
  getIndisponibilites(userId: string): Promise<Indisponibilite[]>;
  setIndisponibilites(userId: string, items: Indisponibilite[]): Promise<void>;
}

export interface IInvitationRepository {
  validateCode(code: string): Promise<boolean>;
  getInvitations(userId: string): Promise<Invitation[]>;
  createInvitation(userId: string, email?: string): Promise<Invitation>;
  revokeInvitation(id: string, userId: string): Promise<void>;
}
