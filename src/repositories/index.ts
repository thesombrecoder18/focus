import {
  SemestreRepository,
  MatiereRepository,
  SemaineRepository,
  SeanceRepository,
  PresenceRepository,
  DevoirRepository,
  ExamenRepository,
  EvenementRepository,
  ImportRepository,
  SettingsRepository,
  InvitationRepository,
  EvaluationRepository,
  ClubRepository,
  SessionRevisionRepository,
} from './storage';

export const semestreRepo = new SemestreRepository();
export const matiereRepo = new MatiereRepository();
export const semaineRepo = new SemaineRepository();
export const seanceRepo = new SeanceRepository();
export const presenceRepo = new PresenceRepository();
export const devoirRepo = new DevoirRepository();
export const examenRepo = new ExamenRepository();
export const evenementRepo = new EvenementRepository();
export const importRepo = new ImportRepository();
export const settingsRepo = new SettingsRepository();
export const invitationRepo = new InvitationRepository();
export const evaluationRepo = new EvaluationRepository();
export const clubRepo = new ClubRepository();
export const revisionRepo = new SessionRevisionRepository();

export * from './interfaces';
export * from './storage';
