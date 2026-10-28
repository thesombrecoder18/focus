# Elizo Focus — contexte pour agents IA

> Lis ce fichier puis `STATUS.md` avant toute exploration. Profil et conventions globales : `~/ai-hub/PROFIL.md`, `~/ai-hub/CONVENTIONS.md`.
> Max 80 lignes. Mettre à jour quand la stack, les commandes ou les règles changent.

## Projet
- **But** : Cockpit personnel d'un étudiant en cours du soir (M2 SSI ESP Dakar) réunissant emploi du temps variable, présence, devoirs, examens et calendrier.
- **Pour qui** : Baye Eli (étudiant ESP Dakar) + multi-comptes sur invitation — propriétaire : thesombrecoder18
- **Contexte** : perso → mobile first (360px), zéro friction, interface 100% français
- **Prod** : pas encore déployé (cible Vercel / PWA)

## Stack
- Frontend : React 18, TypeScript, Vite, Tailwind CSS, Lucide React, date-fns (fr), SheetJS (xlsx)
- Stockage : Architecture en Repositories typés avec persistance locale (IndexedDB / LocalStorage) isolée par `userId`
- Thème : Clair / Sombre (prioritaire, contrastes >= 4.5:1)
- PWA : Manifest, Service Worker offline, standalone mobile

## Commandes
```bash
npm install
npm run dev
npm run build
npm run preview
```

## Structure
```
src/
  components/       Composants UI partagés, navigation (TabBar, Sidebar, Sheet), layout
  config/           Configuration globale (nom, baseline, fuseau)
  features/         Modules métier : auth, aujourdhui, etudes, calendrier, import, settings
  i18n/             Fichier unique de tous les textes français
  lib/              Utilitaires dates (Africa/Dakar), calculs créneaux, excel parser
  repositories/     Interfaces et implémentations de persistance isolée par userId
  types/            Modèles de données TypeScript stricts
```

## Règles du projet
- Mobile first absolu : chaque vue validée à 360 px, pas de défilement horizontal.
- Fuseau horaire : Africa/Dakar (UTC+0).
- Tous les textes dans `src/i18n/fr.ts` (aucun texte codé en dur dans les composants).
- Sécurité : validation stricte, aucune macro/formule exécutée à l'import, secrets hors client.
- Pas de commit/push sans accord explicite. Commits en français (`type: description`).

## Docs utiles
- `Cahier des charges — OS LIFE.md` : spécification détaillée complète de l'application.
