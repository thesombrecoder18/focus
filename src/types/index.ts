export type Modalite = 'en_ligne' | 'presentiel' | 'hybride';
export type StatutSeance = 'prevue' | 'provisoire' | 'deplacee' | 'annulee' | 'non_tenue' | 'rattrapage';
export type StatutPresence = 'present' | 'absent' | 'retard' | 'excuse' | 'non_tenu';

export interface Base {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  nom: string;
  email: string;
  role: 'proprietaire' | 'etudiant';
  createdAt: string;
}

export interface Semestre extends Base {
  nom: string;
  niveauFiliere: string;
  debut: string; // YYYY-MM-DD
  fin: string; // YYYY-MM-DD
  actif: boolean;
  profilHoraire: 'soir' | 'journee' | 'auto';
  lieuParDefaut: {
    en_ligne?: string;
    presentiel?: string;
  };
  periodesSansCours: {
    debut: string;
    fin: string;
    libelle: string;
  }[];
}

export interface Matiere extends Base {
  semestreId: string;
  intitule: string;
  code?: string;
  enseignants: string[];
  coefficient: number;
  couleur: string;
  alias: string[];
  seuilAbsences?: number;
}

export interface Semaine extends Base {
  semestreId: string;
  lundi: string; // YYYY-MM-DD (date du lundi)
  statut: 'vide' | 'provisoire' | 'validee';
  source: 'import' | 'saisie' | 'copie' | 'type';
  importId?: string;
}

export interface Seance extends Base {
  semaineId: string;
  matiereId?: string;
  intituleRecu: string;
  date: string; // YYYY-MM-DD
  debut: string; // HH:mm
  fin: string; // HH:mm
  modalite: Modalite;
  salle?: string;
  lien?: string;
  intervenant?: string;
  statut: StatutSeance;
  note?: string;
  origine: 'import' | 'manuelle' | 'copie' | 'type';
  sourceRef?: string;
}

export interface HistoriqueSeance extends Base {
  seanceId: string;
  champ: string;
  avant: string;
  apres: string;
}

export interface Presence extends Base {
  seanceId: string;
  statut: StatutPresence;
  minutesRetard?: number;
  modeSuivi?: Modalite;
  note?: string;
  pointeeLe: string;
  canal: 'app' | 'email';
}

export interface ImportFichier extends Base {
  nomFichier: string;
  empreinte: string;
  format: string;
  semaines: string[];
  avertissements: string[];
  annule: boolean;
}

export interface SemaineType extends Base {
  semestreId: string;
  jour: number; // 1 (lundi) à 7 (dimanche)
  debut: string;
  fin: string;
  matiereId?: string;
  modalite: Modalite;
  lieu?: string;
}

export interface Indisponibilite extends Base {
  jour: number; // 1 à 7
  debut: string;
  fin: string;
  libelle: string;
}

export interface Devoir extends Base {
  matiereId: string;
  titre: string;
  echeance: string; // YYYY-MM-DDTHH:mm ou YYYY-MM-DD
  statut: 'a_faire' | 'en_cours' | 'rendu';
  priorite: 'basse' | 'normale' | 'haute';
  notes?: string;
}

export interface Examen extends Base {
  matiereId: string;
  date: string; // YYYY-MM-DD
  heure: string; // HH:mm
  dureeMin: number;
  salle?: string;
  type: 'CC' | 'partiel' | 'final';
}

export interface Evaluation extends Base {
  matiereId: string;
  intitule: string;
  note: number;
  bareme: number;
  coefficient: number;
  date: string;
}

export interface Evenement extends Base {
  titre: string;
  debut: string; // ISO ou YYYY-MM-DDTHH:mm
  fin: string;
  journeeEntiere: boolean;
  lieu?: string;
  couleur?: string;
  recurrence?: string;
  rappelMin?: number;
}

export interface Club extends Base {
  nom: string;
  role: string;
  couleur: string;
}

export interface ReunionClub extends Base {
  clubId: string;
  titre: string;
  date: string;
  lieu?: string;
  recurrence?: string;
}

export interface TacheClub extends Base {
  clubId: string;
  titre: string;
  echeance?: string;
  statut: 'ouverte' | 'faite';
}

export interface CompteRendu extends Base {
  clubId: string;
  reunionId?: string;
  date: string;
  contenu: string;
}

export interface ContactClub extends Base {
  clubId: string;
  nom: string;
  role?: string;
  telephone?: string;
  email?: string;
}

export interface SessionRevision extends Base {
  matiereId: string;
  examenId?: string;
  debut: string;
  dureeMin: number;
  objectif?: string;
  statut: 'prevue' | 'faite' | 'annulee';
}

export interface EntreeJournal extends Base {
  date: string;
  contenu: string;
  humeur?: string;
  tags: string[];
}

export interface Invitation extends Base {
  code: string;
  email?: string;
  expireLe: string;
  utilisePar?: string;
  revoquee: boolean;
}

export interface NotificationApp extends Base {
  type: string;
  objetId?: string;
  envoiPrevu: string;
  envoyeLe?: string;
  statut: 'prevue' | 'envoyee' | 'echec' | 'annulee';
}

export interface NotificationSettings {
  rappelCours: boolean; // 30 min avant
  rappelPointage: boolean; // 10 min après fin
  seanceModifiee: boolean; // immédiat
  edtManquant: boolean; // vendredi et dimanche soir
  rappelDevoir: boolean; // veille
  rappelExamen: boolean; // J-3 et J-1
  heuresCalmesActives: boolean;
  heuresCalmesDebut: string; // 23:00
  heuresCalmesFin: string; // 07:00
}

export interface UserSettings extends Base {
  plageDisponibilite: {
    debut: string; // 08:00
    fin: string; // 22:00
  };
  consentementIA: boolean;
  notifications: NotificationSettings;
}
