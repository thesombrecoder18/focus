# Elizo Focus

> Ton cockpit d'étudiant du soir. — Application mobile first pour pilotage des études du soir (emploi du temps variable, présence, devoirs, examens, calendrier, clubs, révisions).

**Propriétaire** : thesombrecoder18 — Utilisateur principal : Baye Eli (M2 SSI, ESP Dakar)  
**Version** : 1.0.0 (MVP — Phase 1 livrée)  
**Statut** : Actif · 50 % · Cible déploiement Vercel / PWA

---

## Présentation

Elizo Focus réunit en une seule interface :

- **Emploi du temps variable** : séances datées semaine par semaine, 4 vues (Liste, Créneaux, Heures, Mois), déplacement/annulation avec historique
- **Pointage de présence** : 1 tap, calcul dynamique de l'assiduité par matière
- **Devoirs & Examens** : suivi des échéances, statut, priorité, compte à rebours
- **Calendrier unifié** : cours, devoirs, examens, événements, clubs, révisions — export `.ics`
- **Aujourd'hui (dashboard)** : prochain cours, séances à pointer, journée, créneaux libres, à rendre, examens
- **Paramètres** : thème clair/sombre, plages de disponibilité, invitations, export JSON des données

Interface **100% français**, **mobile first (360px)**, thème sombre prioritaire, PWA installable.

---

## Stack

| Couche | Technologie |
|--------|-------------|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Routage | React Router DOM |
| Styles | Tailwind CSS |
| Icônes | Lucide React |
| Dates | date-fns (locale fr, fuseau Africa/Dakar) |
| Import Excel | SheetJS (xlsx) |
| Persistance | Repositories typés, IndexedDB / LocalStorage isolés par `userId` |

---

## Installation & lancement

```bash
# 1. Dépendances
npm install

# 2. Serveur de développement
npm run dev

# 3. Build de production
npm run build

# 4. Prévisualisation du build
npm run preview
```

Compte démo automatique (Baye Eli) avec code d'invitation `ESP2026`.

---

## Structure du projet

```
src/
  components/       UI partagés (layout, forms, seance, ui)
  config/           Configuration globale (nom, baseline, fuseau)
  context/          Auth, Theme, Data providers
  features/         Modules métier : auth, aujourdhui, etudes, calendrier, clubs, revisions, journal, import, settings
  i18n/             Textes français centralisés (fr.ts)
  lib/              Utilitaires dates, calculs créneaux, parser Excel, ICS
  repositories/     Interfaces et implémentations de persistance isolée par userId
  types/            Modèles de données TypeScript stricts
```

---

## Design system

- **Palette** : Fond `#F7F8FA` / `#0F1117`, surface `#FFFFFF` / `#161922`, accent indigo `#4F46E5` / `#818CF8`
- **Rayons** : cartes `16px`, boutons `10px`
- **Animations** : transitions `duration-200 ease-in-out`, micro-interactions (hover, active scale)
- **Mobile first** : chaque vue validée à 360px, pas de défilement horizontal, zones tactiles ≥ 44×44px
- **Textes** : tous dans `src/i18n/fr.ts` (aucune chaîne en dur dans les composants)
- **Icônes** : exclusivement Lucide React

---

## Règles du projet

- Fuseau horaire : **Africa/Dakar (UTC+0)**
- Tous les textes centralisés dans `src/i18n/fr.ts`
- Sécurité : validation stricte, aucune macro/formule exécutée à l'import, secrets hors client
- Pas de commit/push sans accord explicite. Commits en français (`type: description`)

---

## Roadmap

| Version | Contenu |
|---------|---------|
| **MVP (V1.0)** | Auth, thèmes, PWA, Aujourd'hui, Études (semestres, matières, EDT variable, devoirs, examens), import Excel/CSV, pointage, Calendrier, notifications e-mail |
| **V1.1** | Notes & moyennes, import IA (PDF/photo/texte/ICS), export .ics, relevé de présence, Clubs complets, Révisions |
| **V1.2** | Journal, notifications push, résumé hebdomadaire |
| **V2** | Offline total, connexion Google, verrouillage Journal, version anglaise, multi-utilisateurs |

---

## Contribuer

Les modifications se font sur des branches dédiées. Aucun commit direct sur `main` sans accord. Les messages de commit suivent la convention française `type: description`.

---

## Licence

Usage personnel — Baye Eli / thesombrecoder18.
