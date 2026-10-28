# Cahier des charges — Elizo Focus

*Application web mobile first de pilotage des études du soir · Version finale 2.0 · 27 octobre 2026*

**★ Nouveau** = ajouté dans cette version (nouveau nom, cours du soir, emploi du temps variable, import, pointage de présence). Tout le reste a été relu et validé.

## 1. Contexte et vision

Elizo Focus est l'outil personnel d'un étudiant en cours du soir : il réunit l'emploi du temps (qui change chaque semaine), la présence aux cours, les devoirs, les examens, les notes, le calendrier, les clubs, les révisions et le journal. Baye Eli en est l'utilisateur principal ; l'application reste multi-comptes pour pouvoir s'ouvrir à d'autres étudiants plus tard.

**Nom ★** : « Elizo Focus » (nom validé), construit sur « Eli » : personnel et facile à retenir ; « Focus » rappelle l'objectif de concentration sur les études. Nom court : « Elizo ». Baseline : « Ton cockpit d'étudiant du soir. » Le nom est défini à un seul endroit de la configuration pour pouvoir changer sans refonte ; disponibilité du domaine et du nom à vérifier avant le lancement.

**Objectifs**

- Savoir à tout moment quel cours a lieu, quand, où (salle ou lien) et avec quel intervenant.
- Importer l'emploi du temps de la semaine en moins d'une minute, sans tout ressaisir.
- Pointer sa présence en un geste et suivre son assiduité par matière.
- Voir sa journée et ce qui arrive (devoirs, examens, tâches de club) d'un coup d'œil.
- Tout faire depuis un téléphone, de préférence d'une main.

**Cible** : un étudiant en cours du soir ou à horaires flexibles (premier utilisateur : Master 2 SSI, ESP/UCAD Dakar). Langue : français. Ton : tutoiement, chaleureux et encourageant (ex. « Rien à rendre cette semaine. Bien joué ! »).

## 2. Périmètre

| Module | Décision |
| --- | --- |
| Aujourd'hui (tableau de bord) | Conservé, adapté aux cours du soir ★ |
| Études (semestres, matières, emploi du temps, devoirs, examens, notes) | Conservé ; emploi du temps variable, import et présence ★ |
| Calendrier | Conservé ; axe horaire adapté ★ |
| Clubs | Conservé (personnels, sans invitation de membres) |
| Révisions | Conservé (planification seulement, sans fiches mémoire) |
| Journal | Conservé (verrouillage par code après la V1) |
| Paramètres, thème, notifications, déconnexion | Conservé |
| Objectifs, Habitudes, Santé, Notes (module autonome) | **Exclus** |
| Carrière | **Exclu** |

Conséquences : plus de bouton « Objectif », de carte « Habitudes » ni de rubrique Carrière. L'onglet « Notes » d'Études (notes d'évaluation et moyennes) reste.

## 3. Utilisateurs et parcours clés

1. **Inscription / connexion** : créer un compte, se connecter, retrouver son mot de passe.
2. **Début de semestre** : créer le semestre, ajouter les matières, choisir son profil horaire (cours du soir).
3. **Chaque semaine** ★ : importer l'emploi du temps (fichier Excel, PDF, photo ou texte collé), vérifier l'écran de revue, valider.
4. **Avant le cours** ★ : voir le prochain cours, rejoindre le lien en ligne ou repérer la salle.
5. **Après le cours** ★ : pointer sa présence en un geste, y compris depuis l'e-mail de rappel.
6. **En journée, entre deux cours** : ajouter un devoir ou un événement, planifier une révision dans un créneau libre.
7. **Le soir** : écrire dans le journal, consulter ses clubs.

Un seul rôle utilisateur. Chaque compte ne voit que ses propres données ; dans un club, le rôle (Membre, etc.) est un attribut du club, pas un rôle système.

## 4. Exigences fonctionnelles

### 4.1 Authentification et e-mails

- Inscription sur invitation ★ (lien ou code généré par le propriétaire, pas d'inscription libre) : nom d'affichage, e-mail, mot de passe (8 caractères minimum), confirmation, acceptation des CGU et de la politique de confidentialité.
- Connexion : e-mail, mot de passe, lien « Mot de passe oublié ? », bouton afficher/masquer le mot de passe, indicateur de force.
- Mot de passe oublié : lien de réinitialisation envoyé par e-mail (expéditeur décrit en 4.11).
- Un visiteur non connecté est redirigé vers `/connexion`.
- Limitation des tentatives (anti brute force) et vérification de l'adresse e-mail.
- Connexion Google : optionnelle, en V2.
- Suppression du compte et export des données depuis Paramètres.

### 4.2 Aujourd'hui (tableau de bord)

- Salutation selon l'heure (« Bonsoir Baye Eli »), date du jour, flèches pour changer de jour.
- Phrase d'état adaptée ★ : « Prochain cours dans 1 h 12 : Gouvernance et politique de sécurité (en ligne). » ou « Rien de prévu : une journée libre pour avancer à ton rythme. »
- Actions rapides : Devoir, Événement, Révision (l'action « Objectif » est retirée).
- **Prochain cours** ★ : matière, horaire, intervenant, modalité, compte à rebours, bouton « Rejoindre » (lien en ligne) ou salle ; pendant le cours, bouton « Présent ».
- **À pointer** ★ : séances passées sans présence enregistrée, pointables en un geste.
- **Ma journée** : séances et événements du jour en chronologie, avec l'état de présence ; lien vers Calendrier.
- **Créneaux libres** : entre les cours, examens et événements, dans la plage de disponibilité réglée (par défaut 8 h – 22 h, réglable par jour dans Paramètres), avec la durée (ex. 20:23 – 22:00 = 1 h 36).
- **À rendre bientôt** (devoirs de la semaine), **Tâches de club** (7 prochains jours), **Examens à venir**.
- Bannière ★ quand la semaine suivante n'a pas d'emploi du temps : « Importer l'emploi du temps de la semaine du 2 nov. ».
- États vides rédigés et encourageants pour chaque carte.

**Mobile** : cartes en une seule colonne, dans cet ordre : Prochain cours, À pointer, Ma journée, À rendre bientôt, Examens à venir, Tâches de club, Créneaux libres.

### 4.3 Études : semestres, matières, devoirs, examens, notes

Cinq onglets : **Emploi du temps** (affiché par défaut ★), **Matières**, **Devoirs**, **Examens**, **Notes**. L'emploi du temps, l'import et le pointage sont détaillés en 4.4 à 4.6.

**Semestres ★** (cours du soir, horaires flexibles)

- Sélecteur de semestre actif et bouton « Gérer les semestres » (ex. « M2 – Semestre 3 », du 28 oct. 2026 au 3 mars 2027). Plusieurs semestres sont conservés, un seul est actif.
- Un semestre porte : nom, niveau et filière, dates de début et de fin, **profil horaire**, **périodes sans cours** (vacances, jours fériés, semaines d'examens) et **lieu par défaut selon la modalité** (lien de visioconférence unique pour l'en ligne, salle habituelle pour le présentiel), repris automatiquement à la saisie et à l'import.
- Profils horaires : *Cours du soir* (fenêtre d'affichage 16 h – 22 h), *Journée* (8 h – 18 h), *Automatique* (fenêtre calculée sur les séances de la semaine). Le profil ne limite rien : il règle l'affichage et les créneaux libres.
- Une semaine peut précéder la date de début déclarée du semestre (cas du lundi 26 oct. avant le 28 oct.) : l'application propose d'avancer la date de début.

**Matières**

- Moyenne générale et bouton « Ajouter une matière ».
- Carte matière : intitulé (2 lignes, nom complet au détail), code (ex. MASTER-SSI-5321), enseignant, moyenne, coefficient, **présence (ex. 8/9 · 89 %)** ★, barre de couleur, boutons modifier et supprimer.
- ★ Alias (noms alternatifs rencontrés dans les emplois du temps) pour le rapprochement automatique à l'import, plusieurs intervenants possibles, seuil d'absences facultatif avec alerte.

**Devoirs** : titre, matière, échéance, statut (à faire / en cours / rendu), priorité, notes ; case « rendu » d'un geste.

**Examens** : matière, date, heure, durée, salle, type (CC, partiel, examen final) ; ils apparaissent dans Calendrier avec un compte à rebours.

**Notes** : note, barème, coefficient d'évaluation, type ; moyenne pondérée par matière et moyenne générale pondérée par les coefficients de matière.

Suppression avec confirmation et possibilité d'annuler.

### 4.4 Emploi du temps variable (cours du soir) ★

L'emploi du temps est organisé **semaine par semaine**, parce qu'il change chaque semaine. Chaque séance existe à une date précise : il n'y a pas de grille fixe à ressaisir.

**Modèle**

- **Semaine** : du lundi au dimanche, rattachée à un semestre ; statut *Vide*, *Provisoire* (préremplie, non confirmée) ou *Validée* (importée ou confirmée). Le sélecteur de semaine affiche un point d'état par semaine.
- **Séance** : date, début, fin, matière (ou « À renseigner »), intervenant, modalité (en ligne, présentiel ou hybride), salle ou lien, note. Statuts : *Prévue*, *Provisoire*, *Déplacée*, *Annulée*, *Non tenue*, *Rattrapage*.
- **Modification d'une seule séance** (déplacer, annuler, changer de salle ou de lien) sans toucher aux autres ; l'historique garde « avant → après » et déclenche une notification.
- **Semaine type** (facultative) : modèle qui préremplit une semaine non encore publiée. Les séances préremplies sont **provisoires** (bordure pointillée, mention « à confirmer ») tant que le vrai emploi du temps n'est pas importé : aucun horaire incertain n'est présenté comme certain.
- **Copier la semaine précédente** (en provisoire) et **appliquer une semaine à une plage de dates** en excluant les périodes sans cours.
- Horaires libres : une séance à 8 h le samedi ou à 21 h 30 est acceptée sans restriction. Fuseau Africa/Dakar (UTC+0, sans changement d'heure).
- Contrôles à chaque enregistrement : chevauchement, fin avant début, séance hors semestre (avertissement), doublon.

**Précision**

- Les horaires sont conservés tels que reçus, à la minute (« 17h00 – 19h00 ») ; seul l'affichage est adapté.
- Une information manquante n'est jamais devinée : elle s'affiche « À renseigner », la séance reste modifiable et apparaît dans les alertes d'« Aujourd'hui ».
- Une séance importée garde sa source (fichier, feuille, cellule) pour pouvoir être vérifiée.

**Affichage**

Problème visé : dans une grille qui commence à 8 h, un cours à 17 h se retrouve tout en bas. La grille fixe 8 h – 22 h n'est plus l'affichage par défaut. Quatre vues, mémorisées par appareil :

1. **Liste** (défaut sur mobile) : jours en accordéon (aujourd'hui ouvert). Chaque séance est une carte : horaire, matière, intervenant, pastille de modalité, salle ou bouton « Rejoindre », état de présence. Aucune heure vide à parcourir.
2. **Créneaux** (défaut sur tablette et bureau) : colonnes = jours, lignes = séances classées par horaire (matin, après-midi, soir) et construites à partir des données. Une semaine du soir tient sur un écran, et un samedi de journée complète s'insère sans étirer les autres jours.
3. **Heures** : grille horaire à **axe compressé**. Les heures sans aucune séance dans la semaine affichée sont masquées (marqueur « ⋯ ») ; pour une semaine du soir, l'axe démarre vers 16 h 30 et défile jusqu'à « maintenant ». Un bouton « Journée complète » affiche tout.
4. **Mois** : points de couleur et nombre de séances par jour.

Éléments communs : ligne « maintenant », séance en cours mise en avant, couleur par modalité (en ligne = bleu, présentiel = sable, comme dans le fichier de l'ESP), provisoire = pointillé, annulée = barrée.

**Mobile** : balayage gauche/droite pour changer de jour ou de semaine, pastilles Lun–Sam fixes en haut, actions dans une feuille inférieure.

### 4.5 Import de l'emploi du temps ★

Objectif : ne plus rien ressaisir chaque semaine. On importe, on vérifie, on valide.

| Source | Traitement |
| --- | --- |
| Excel (.xlsx, .xlsm, .xls) | Lecture des valeurs affichées. Deux modèles reconnus, le premier étant prioritaire (le fichier de l'ESP arrive a priori dans ce modèle chaque semaine) : la grille hebdomadaire (jour × créneau) et le tableau « Saisie » (JOUR, MODALITÉ, DÉBUT, FIN, EC, ENSEIGNANT, SALLE OU LIEN, OBSERVATIONS) |
| CSV | Mêmes colonnes que le tableau « Saisie » |
| PDF, photo, capture d'écran | Extraction par IA (lecture d'image), toujours suivie de l'écran de revue |
| Texte collé | Message WhatsApp ou e-mail contenant l'emploi du temps, analysé par IA |
| Fichier ICS | Import d'un calendrier |

Un modèle Excel Elizo (tableau « Saisie ») est téléchargeable depuis l'écran d'import.

**Parcours**

1. Bouton « Importer » depuis la bannière d'Aujourd'hui, l'onglet Emploi du temps ou Calendrier : choix du fichier, de la photo ou du texte.
2. Détection du format, de la semaine (nom de l'onglet, par exemple « EdT\_du\_26\_au\_31\_oct\_2026 », titre ou dates du fichier ; sinon sélecteur de semaine) et du semestre.
3. Normalisation : jours en français, horaires « 17h00 – 19h00 », « SALLE : 102 », liens de visioconférence, noms d'intervenants (« M. C. A. FALL »).
4. Rapprochement avec les matières existantes (nom sans accents ni casse, puis alias). Une matière inconnue est proposée à la création.
5. **Écran de revue** : aperçu en vue Créneaux et liste éditable ; chaque ligne porte ses avertissements et se corrige sans quitter l'écran.
6. Validation : la semaine devient *Validée*, le fichier d'origine est conservé et « Annuler l'import » reste possible.

**Contrôles et avertissements**

- Séance sans matière ou sans intervenant (« à renseigner »), ou mention « non confirmé » / « modèle non validé » : importée en *À compléter* ou *Provisoire*, jamais ignorée.
- Chevauchement, fin avant début, durée supérieure à 4 h, doublon, jour hors de la semaine.
- Modalité incohérente avec le lieu (en ligne sans lien, présentiel sans salle) : le lieu par défaut du semestre est proposé.
- Semaine hors des dates du semestre : proposition d'ajuster le semestre.
- Horaire de fin différent de la règle écrite dans le fichier (ex. 17 h contre 16 h 30) : avertissement, les créneaux saisis priment.
- Plusieurs feuilles : une semaine par feuille, import groupé possible.

**Réimport d'une semaine** : comparaison *ajouté / modifié / supprimé* ; l'utilisateur choisit ligne par ligne. Les présences déjà pointées sont conservées pour les séances qui correspondent (même matière, même jour, même heure).

**Sécurité** : taille maximale 10 Mo, type de fichier vérifié, lecture côté serveur, **macros et formules jamais exécutées** (valeurs calculées lues, liens externes ignorés), stockage privé. Pour photo, PDF et texte, l'envoi à un service d'IA est signalé et activable dans Paramètres.

**Mobile** : écran d'import plein écran en étapes (« Fichier », « Photo », « Coller du texte »), revue en cartes, bouton « Valider » collé en bas de l'écran.

### 4.6 Pointage de présence ★

- **Statuts** : *Présent·e*, *Absent·e*, *En retard* (minutes facultatives), *Excusé·e* (note facultative) et *Non tenu* (cours annulé ou non assuré : exclu des statistiques). Une séance terminée sans pointage passe en « À pointer ».
- **Mode suivi** (en ligne ou présentiel) repris de la séance et modifiable : prévu en présentiel, suivi en ligne.
- **Quand** : dès l'heure de début de la séance, jamais pour une séance future. Modification possible à tout moment, avec historique.
- **Où pointer** : carte « Prochain cours » (un geste), fiche de la séance, liste « À pointer » (rattrapage de plusieurs séances par balayage), lien signé dans l'e-mail envoyé à la fin du cours (sans ouvrir l'application).
- **Statistiques** : par matière (séances tenues, présent, absent, retard, excusé et **taux de présence** = présences et retards ÷ séances tenues), par semaine et par semestre ; heures suivies sur heures prévues ; alerte quand le seuil d'absences d'une matière est atteint.
- Les pointages apparaissent dans Calendrier (icône sur la séance), dans la carte matière et dans « Aujourd'hui ».
- Export du relevé de présence (PDF ou CSV) en V1.1.

### 4.7 Calendrier

- Vues **Mois, Semaine, Jour, Agenda** ; navigation précédent / suivant / « Aujourd'hui » ; titre de période (ex. « 26 oct. – 1 nov. 2026 »).
- Filtres par type sous forme de pastilles : Cours, Devoirs, Examens, Événements, Clubs, Révisions (icône et couleur).
- Boutons **Exporter** (fichier .ics, compatible Google Calendar, Apple, Outlook) et **+ Événement**.
- **Axe horaire adapté ★** : même logique qu'en 4.4 (axe compressé, fenêtre calculée sur les séances, défilement jusqu'à « maintenant », bouton « Journée complète »). Le calendrier n'ouvre plus à 8 h pour une semaine de cours du soir.
- **Séances de cours ★** : couleur par modalité, états provisoire et annulé, icône de présence ; un appui ouvre la fiche de la séance (pointage, lieu, lien).
- Événements personnels : titre, début et fin, journée entière, lieu, couleur, rappel ; récurrence hebdomadaire ou quotidienne ; glisser pour déplacer ; détection des conflits, cours compris.
- **Mobile** : vue Agenda par défaut ; Jour disponible ; Semaine à partir de 768 px ; Mois en vue compacte avec points de couleur.

### 4.8 Clubs

- Description : « Tes clubs, leurs réunions, tes tâches, les comptes rendus et les contacts. »
- Bouton **+ Club**. Carte club : nom, badge de rôle (ex. « Membre »), prochaine réunion (ex. « Réunion Hebdomadaire · ven. 30 oct. »), nombre de tâches ouvertes.
- Les tâches de club remontent dans « Aujourd'hui » et les réunions dans Calendrier.

**Page détail d'un club**

- Onglets : Réunions, Tâches, Comptes rendus, Contacts.
- Réunions : titre, date, lieu, récurrence ; compte rendu rattaché.
- Tâches : titre, échéance, statut. Les clubs sont **personnels** : pas d'invitation de membres ni de collaboration multi-utilisateurs.
- Comptes rendus : texte libre, daté, lié à une réunion.
- Contacts : nom, rôle, téléphone, e-mail, appel ou WhatsApp en un geste sur mobile.
- Rôle personnalisable (Membre, Responsable, Président, etc.).

### 4.9 Révisions&#32;

- Planifier des sessions de révision : matière, date, durée, objectif de la session, statut.
- Proposer automatiquement des créneaux issus de « Créneaux libres ».
- Lier une session à un examen à venir ; compte à rebours par examen.
- Minuteur de concentration simple (type Pomodoro), temps de révision cumulé par matière.
- Les sessions apparaissent dans Calendrier (couleur menthe, icône ampoule).
- Pas de fiches mémoire ni de flashcards (décision validée).

### 4.10 Journal&#32;

- Entrées datées (une ou plusieurs par jour), texte libre, éditeur simple.
- Humeur optionnelle et tags.
- Liste chronologique, recherche, filtre par date.
- Données strictement privées ; verrouillage de l'accès par code ou nouvelle saisie du mot de passe, prévu après la V1 (V2).
- Brouillon enregistré automatiquement.

### 4.11 Paramètres et notifications

- **Thème** : Système, Clair ou Sombre ; le thème sombre est prioritaire dès le MVP (fond #0E1014).
- **Profil** : nom d'affichage, e-mail, mot de passe, langue (français), invitations (création et révocation des codes) ★.
- **Disponibilité** ★ : plage de disponibilité par jour de la semaine et blocs indisponibles récurrents (travail, trajet) qui alimentent les créneaux libres.
- **IA et import** ★ : consentement à l'envoi de photos, PDF ou textes à un service d'IA pour l'import.
- **Données** : export et suppression du compte.

**Notifications par e-mail dès la V1 ★**

| Type | Moment (réglable) |
| --- | --- |
| Rappel de cours | 30 min avant, avec lien ou salle |
| Pointage de présence | 10 min après la fin du cours, avec boutons Présent / Absent |
| Séance déplacée ou annulée | Immédiat |
| Emploi du temps manquant | Vendredi soir et dimanche soir si la semaine suivante est vide |
| Devoir à rendre | La veille de l'échéance |
| Examen | J-3 et J-1 |

Chaque type s'active ou se désactive séparément, avec des heures calmes.

**Expéditeur** : un compte Gmail du propriétaire de l'application (SMTP avec mot de passe d'application, ou API Gmail). Les identifiants restent dans les variables d'environnement du serveur, jamais côté navigateur. Un compte Gmail gratuit permet environ 500 destinataires par jour, ce qui suffit à un usage personnel ; un service d'envoi dédié sera nécessaire si l'application s'ouvre à d'autres utilisateurs. Les notifications push (PWA) arrivent en V1.2.

## 5. Design system — mobile first

### 5.1 Principes

1. **Mobile d'abord** : chaque écran est conçu et validé à 360 px de large avant d'être étendu. Le bureau est une adaptation, pas la référence.
2. **Une action principale par écran**, accessible au pouce.
3. **Calme et lisible** : peu de couleurs, beaucoup d'espace, une couleur d'accent unique.
4. **Encourageant** : micro-textes humains, états vides utiles.
5. **Rapide** : saisie en 3 touches ou moins, aucune page lourde.

### 5.2 Breakpoints

| Nom | Largeur | Navigation | Mise en page |
| --- | --- | --- | --- |
| Mobile | 0–639 px | Barre d'onglets en bas | 1 colonne, marges 16 px |
| Tablette | 640–1023 px | Barre en bas ou rail d'icônes | 1–2 colonnes, marges 24 px |
| Bureau | ≥ 1024 px | Sidebar fixe (≈ 260 px) | 2 colonnes, contenu max 1200 px |

### 5.3 Navigation

- **Mobile** : barre d'onglets fixe en bas (hauteur 56 px + zone sûre) avec 4 entrées — **Aujourd'hui, Études, Calendrier, Clubs** — et un onglet **Plus** ouvrant une feuille avec Révisions, Journal, Paramètres, thème et déconnexion.
- **Bureau** : sidebar avec logo « Elizo Focus » (pastille « E » indigo), 6 modules (Aujourd'hui, Études, Calendrier, Clubs, Révisions, Journal), et en bas Paramètres, Thème, Se déconnecter, utilisateur connecté.
- Item actif : fond teinté d'accent et texte accent.
- Création rapide : bouton flottant « + » (mobile) ouvrant une feuille avec Devoir, Événement, Révision, Importer l'emploi du temps ; équivalent en boutons dans l'en-tête sur bureau.

### 5.4 Couleurs (valeurs approximatives relevées sur les captures, à confirmer)

| Rôle | Clair | Sombre |
| --- | --- | --- |
| Accent principal (indigo) | ≈ #4F46E5 | ≈ #818CF8 |
| Fond de page | ≈ #F7F8FA | #0E1014 |
| Surface (cartes) | #FFFFFF | ≈ #161A21 |
| Texte principal | ≈ #111827 | ≈ #F3F4F6 |
| Texte secondaire | ≈ #6B7280 | ≈ #9CA3AF |
| Bordure | ≈ #E5E7EB | ≈ #262B35 |
| Succès (créneau libre) | vert ≈ #16A34A | adapté |

**Couleurs par type d'élément** (pastille teintée + icône) :

| Type | Teinte |
| --- | --- |
| Cours | Indigo / lavande |
| Devoirs | Orange / pêche |
| Examens | Rouge / rose |
| Événements | Cyan |
| Clubs | Violet |
| Révisions | Vert menthe |

Règle : la couleur n'est jamais le seul porteur d'information (toujours une icône ou un libellé).

**Couleurs de modalité et d'état ★** (les modalités sont reprises du fichier de l'ESP ; les autres valeurs sont des propositions à confirmer) :

| Élément | Clair | Sombre |
| --- | --- | --- |
| Modalité En ligne | fond ≈ #DCEFFC, texte ≈ #0B67A7 | fond bleu profond translucide, texte clair |
| Modalité Présentiel | fond ≈ #F5E7D0, texte ≈ #8D662F | fond ambre translucide, texte clair |
| Présent | vert ≈ #16A34A | adapté |
| Absent | rouge ≈ #DC2626 | adapté |
| En retard | ambre ≈ #D97706 | adapté |
| Excusé | gris-bleu ≈ #64748B | adapté |
| À pointer | contour indigo | adapté |
| Provisoire | bordure pointillée, mention « à confirmer » | identique |
| Annulée / Non tenue | texte barré, gris | identique |

Chaque état porte aussi une icône et un libellé. En mode sombre, les valeurs sont recalculées pour garder un contraste d'au moins 4,5:1.

### 5.5 Typographie

- Famille : sans-serif géométrique de type **Inter**, avec repli système.
- Échelle (mobile → bureau) : titre de page 28 → 32 px (gras) ; titre de carte 18 px (semi-gras) ; corps 16 px ; secondaire 14 px ; légende 12 px.
- Taille minimale de saisie 16 px (empêche le zoom automatique sur iOS).

### 5.6 Espacement, formes, ombres

- Grille de 4 px ; espacements usuels 8 / 12 / 16 / 24 / 32.
- Rayons : cartes 16 px, boutons et champs 12 px, pastilles entièrement arrondies.
- Cartes : fond surface, bordure fine, ombre très légère (aucune en mode sombre, bordure à la place).
- Icônes : style filaire de type **Lucide**, 20–24 px, trait 1,75 px.

### 5.7 Composants

| Composant | Spécification |
| --- | --- |
| Bouton principal | Fond accent, texte blanc, hauteur 44 px (48 px mobile), rayon 12 px |
| Bouton secondaire | Fond surface, bordure, icône + libellé |
| Champ | Libellé au-dessus, hauteur 48 px, message d'aide ou d'erreur sous le champ |
| Carte | Titre + icône, lien d'action à droite (ex. « Calendrier », « Tous les devoirs »), contenu |
| Carte entité (matière, club) | Barre de couleur en haut, titre, métadonnées, actions modifier/supprimer |
| Pastille de filtre | Icône + libellé, état actif/inactif, défilement horizontal sur mobile |
| Onglets | Soulignés, défilement horizontal sur mobile |
| Sélecteur | Liste native sur mobile |
| Feuille inférieure (bottom sheet) | Formulaires de création/édition sur mobile ; fermeture par geste ou bouton |
| Dialogue | Bureau uniquement, ou confirmations de suppression |
| Toast | Confirmation brève avec action « Annuler » |
| Squelette de chargement | Remplace les spinners pour les cartes et listes |
| État vide | Icône, phrase courte et utile, action suggérée |

**Composants du pilotage des cours ★**

| Composant | Spécification |
| --- | --- |
| Carte séance | Barre latérale de modalité, horaire, matière (2 lignes), intervenant, pastille En ligne / Présentiel, lieu ou bouton « Rejoindre », état de présence ; états provisoire, annulée et en cours |
| Sélecteur de semaine | Flèches et pastilles de semaine ; point d'état (vide, provisoire, validée) ; balayage sur mobile |
| Sélecteur de vue | Contrôle segmenté Liste · Créneaux · Heures · Mois |
| Boutons de pointage | Quatre boutons de 48 px (Présent, Absent, Retard, Excusé) et « Non tenu » en action secondaire ; confirmation par toast avec « Annuler » |
| Bannière d'import | « Importer l'emploi du temps de la semaine du 2 nov. » avec bouton principal |
| Écran de revue d'import | Cartes éditables avec pastilles d'avertissement ; bouton « Valider » collé en bas |
| Axe compressé | Heures vides masquées, marqueur « ⋯ », bouton « Journée complète » |

### 5.8 Règles mobile first

- **Zones tactiles** ≥ 44 × 44 px, espacement ≥ 8 px entre cibles.
- **Zones sûres** : `viewport-fit=cover`, marges `env(safe-area-inset-*)` en haut et en bas (déjà prévu dans la balise viewport actuelle).
- **Formulaires** en feuille inférieure plein largeur, clavier adapté (`type=email`, `inputmode=numeric`, sélecteurs natifs de date et d'heure), bouton d'envoi collé en bas, `autocomplete` renseigné.
- **Calendrier** : Agenda par défaut ; défilement horizontal des filtres ; pas de grille Semaine en dessous de 768 px.
- **Tableaux** : jamais de tableau large sur mobile, remplacés par des listes de cartes.
- **Gestes** : glisser pour marquer un devoir rendu, tirer pour rafraîchir ; chaque geste a un équivalent bouton.
- **Pouce d'abord** : actions principales dans la moitié basse de l'écran.
- **Texte tronqué** (ex. « Cybercriminalité, cybe… ») : tronquer sur 2 lignes maximum, nom complet dans le détail.
- **PWA** : manifeste, icônes, mode plein écran, écran de lancement aux couleurs du thème, installable sur l'écran d'accueil.
- **Hors ligne** : consultation de l'emploi du temps et des devoirs sans réseau ; synchronisation au retour de la connexion.
- **Performance** : LCP < 2,5 s sur 4G, JS initial < 200 Ko, images en chargement différé, adaptées aux connexions faibles (contexte Dakar).

### 5.9 Accessibilité

- Contraste WCAG AA (4,5:1 pour le texte).
- Navigation clavier complète, focus visible.
- Libellés et rôles ARIA, annonces pour les mises à jour dynamiques.
- Respect de `prefers-reduced-motion` et du thème système.
- Textes agrandissables jusqu'à 200 % sans casse.

### 5.10 Ton éditorial

Tutoiement, phrases courtes, positives, jamais culpabilisantes. Exemples : « Une journée libre : avance sur tes révisions… ou repose-toi, ça compte aussi. » Les erreurs expliquent quoi faire (« Le mot de passe doit contenir au moins 8 caractères »).

## 6. Modèle de données (proposition)

| Entité | Champs principaux |
| --- | --- |
| Utilisateur | id, nom d'affichage, e-mail, préférences (thème, plages de disponibilité, notifications, consentement IA) |
| Semestre ★ | id, nom, niveau et filière, date de début, date de fin, actif, profil horaire, lieu par défaut par modalité, périodes sans cours |
| Matière ★ | id, semestre, intitulé, code, enseignant(s), coefficient, couleur, alias, seuil d'absences, moyenne et taux de présence (calculés) |
| Semaine ★ | id, semestre, date du lundi, statut (vide, provisoire, validée), source, import |
| Séance ★ | id, semaine, matière (peut être vide), intitulé reçu, date, début, fin, modalité, salle, lien, intervenant, statut (prévue, provisoire, déplacée, annulée, non tenue, rattrapage), note, origine, référence de source |
| Historique de séance ★ | id, séance, champ modifié, valeur avant, valeur après, date |
| Présence ★ | id, séance (unique), statut, minutes de retard, mode suivi, note, pointée le, canal (application, e-mail) |
| Import ★ | id, fichier, empreinte, format, semaines concernées, avertissements, date, annulé |
| Semaine type ★ | id, semestre, jour, début, fin, matière, modalité, lieu (modèle de préremplissage) |
| Indisponibilité récurrente ★ | id, jour, début, fin, libellé |
| Devoir | id, matière, titre, échéance, statut, priorité, notes |
| Examen | id, matière, date, heure, durée, salle, type |
| Évaluation (note) | id, matière, intitulé, note, barème, coefficient, date |
| Événement | id, titre, début, fin, journée entière, lieu, couleur, récurrence, rappel |
| Club | id, nom, rôle de l'utilisateur, couleur |
| Réunion de club | id, club, titre, date, lieu, récurrence |
| Tâche de club | id, club, titre, échéance, statut |
| Compte rendu | id, club, réunion, date, contenu |
| Contact de club | id, club, nom, rôle, téléphone, e-mail |
| Session de révision | id, matière, examen (optionnel), début, durée, objectif, statut |
| Entrée de journal | id, date, contenu, humeur (optionnelle), tags |
| Notification ★ | id, type, objet lié (séance, devoir, examen), envoi prévu, envoyé le, statut |
| Invitation ★ | id, code, e-mail (facultatif), expire le, utilisée par, révoquée |

Toutes les tables portent `user_id`, `created_at` et `updated_at`. Le calendrier est une vue unifiée sur les séances, devoirs, examens, événements, réunions de club et sessions de révision. Les dates sont stockées en UTC et affichées en Africa/Dakar (identique à UTC, sans heure d'été).

## 7. Exigences non fonctionnelles

**Sécurité**

- Mots de passe hachés (bcrypt/argon2), sessions sécurisées, HTTPS partout.
- Isolation stricte des données par utilisateur (règles de sécurité au niveau base de données, type RLS).
- Protection CSRF/XSS, validation côté serveur, limitation de débit sur connexion, réinitialisation et import.
- Journal chiffré au repos ; sauvegardes automatiques.
- Fichiers importés ★ : type et taille contrôlés, lecture côté serveur, macros et formules jamais exécutées, stockage privé.
- Identifiants Gmail et clés d'API uniquement dans les variables d'environnement du serveur ★.
- Liens de pointage dans les e-mails signés et à durée de vie limitée ★.

**Confidentialité**

- Conformité à la loi sénégalaise sur la protection des données personnelles (loi 2008-12) : page de politique de confidentialité et CGU liées à l'inscription, droit d'accès, d'export et de suppression.

**Fiabilité et performance**

- Disponibilité visée 99,5 %.
- Pages principales < 2,5 s sur 4G ; actions utilisateur confirmées en < 300 ms (mises à jour optimistes).
- Import Excel ou CSV traité en moins de 5 s ; photo ou PDF en moins de 20 s ★.
- L'emploi du temps de la semaine en cours reste consultable sans réseau ★.

**Compatibilité**

- Chrome, Safari, Firefox, Edge récents ; iOS 15+, Android 9+.
- Écrans de 320 px à 1920 px.

**Internationalisation**

- Français en V1 ; textes externalisés pour une version anglaise ultérieure.
- Dates et heures au format local, fuseau Africa/Dakar par défaut.

## 8. Architecture technique (hypothèses)

À confirmer avec l'équipe :

- Front : Next.js (App Router) + React + TypeScript, Tailwind CSS, bibliothèque de composants accessibles (type shadcn/ui), icônes Lucide.
- Back : Supabase (PostgreSQL, authentification, RLS) ou équivalent.
- Hébergement : Vercel ; PWA via manifeste et service worker.
- **Import** ★ : lecture Excel et CSV côté serveur (SheetJS ou ExcelJS, sans exécuter de macros) ; PDF, photo et texte par un modèle de vision (API Anthropic, clé côté serveur) ; fichiers dans un espace de stockage privé ; écran de revue systématique avant validation.
- **E-mails** ★ : Nodemailer avec SMTP Gmail (mot de passe d'application) ou API Gmail ; modèles en français, HTML simple.
- **Planificateur** ★ : tâche récurrente toutes les 5 minutes pour les rappels et les pointages (Supabase pg\_cron ou Upstash QStash ; la fréquence des tâches planifiées gratuites de Vercel est limitée, à vérifier selon le forfait).
- Qualité : tests de bout en bout (Playwright), audit Lighthouse mobile en intégration continue, jeu d'essai d'import construit avec le vrai fichier de l'ESP ★.

## 9. Plan de livraison

| Lot | Contenu |
| --- | --- |
| **MVP** | Authentification et e-mail de réinitialisation, thème clair et sombre, PWA, Aujourd'hui, Études (semestres, matières, emploi du temps hebdomadaire variable, devoirs, examens), import Excel et CSV (grille de l'ESP et tableau « Saisie »), pointage de présence, Calendrier (Liste, Créneaux, Heures, Mois), notifications par e-mail (rappel de cours, pointage, semaine manquante) |
| **V1.1** | Notes et moyennes, import PDF, photo, texte et ICS par IA, export .ics, relevé de présence, Clubs complets, Révisions |
| **V1.2** | Journal, notifications push, résumé hebdomadaire |
| **V2** | Mode hors ligne complet, connexion Google, verrouillage du Journal par code, version anglaise, ouverture à d'autres utilisateurs |

## 10. Analyse de l'emploi du temps fourni (semaine du 26 au 31 oct. 2026)

Le fichier « Planning\_Hebdomadaire\_ESP\_UCAD\_M2-SSI\_S3 » (M2 SSI, semestre 3, département Génie Informatique) compte 14 séances de 2 h, soit 28 h cette semaine : cours à distance du lundi au vendredi et présentiel le mercredi et le samedi.

| Jour | Horaires | Matière | Intervenant | Modalité et lieu |
| --- | --- | --- | --- | --- |
| Lun. 26 oct. | 17h00 – 19h00 | À renseigner (EC 01) | À renseigner | En ligne · lien Meet |
| Lun. 26 oct. | 19h00 – 21h00 | Cybercriminalité, cyberéthique et cyberdroit | M. C. A. Fall | En ligne · lien Meet |
| Mar. 27 oct. | 17h00 – 21h00 (2 séances) | Gouvernance et politique de sécurité | M. Lam | En ligne · lien Meet |
| Mer. 28 oct. | 17h00 – 21h00 (2 séances) | Sécurité de l'électronique et des architectures matérielles | M. Dione | Présentiel · salle 102 |
| Jeu. 29 oct. | 17h00 – 19h00 | Préparation à la certification professionnelle | M. Diop | En ligne · lien Meet |
| Jeu. 29 oct. | 19h00 – 21h00 | Cybercriminalité, cyberéthique et cyberdroit | M. C. A. Fall | En ligne · lien Meet |
| Ven. 30 oct. | 17h00 – 21h00 (2 séances) | Gestion des risques (PCA, PRA) | M. Gueye | En ligne · lien Meet |
| Sam. 31 oct. | 8h00 – 12h00 et 13h00 – 17h00 (4 séances, pause 12h00 – 13h00) | Robustesse et sécurité de l'intelligence artificielle et du big data | M. Faye | Présentiel · salle 102 |

**Points relevés** (la conception de l'import en tient compte) :

- Lundi 17h00 – 19h00 : matière et intervenant sont « à renseigner » ; la séance est importée en *À compléter*.
- L'onglet « Saisie des cours » contient encore des valeurs provisoires (EC 01 à EC 14, « Non confirmé », « Lien à préciser ») alors que la feuille hebdomadaire affiche les vrais intitulés saisis à la main : seuls les horaires et le lundi sont reliés par formules. L'import lit donc les **valeurs affichées** de la feuille hebdomadaire.
- Le fichier se déclare « non validé » : les séances importées restent *Provisoires* tant que tu ne valides pas.
- Samedi : fin à 17h00 dans le dernier créneau (15h00 – 17h00) et dans le bloc « Organisation des enseignements », mais 16h30 dans la règle écrite. Fin à 17h00 confirmée : les créneaux saisis priment et la mention 16h30 est ignorée, avec un avertissement.
- Le samedi, quatre séances de suite portent le même intitulé et le même intervenant : elles sont importées telles quelles, avec regroupement possible à l'affichage.
- Le même lien de visioconférence sert tous les jours en ligne et la même salle (102) tous les jours en présentiel : ils sont enregistrés une fois comme lieux par défaut du semestre.
- « Cybercriminalité, cyberéthique et cyberdroit » (lundi et jeudi, M. C. A. Fall) correspond à la matière déjà créée (MASTER-SSI-5321) : rapprochement automatique.
- Le semestre est configuré à partir du 28 oct. 2026 alors que la semaine commence le lundi 26 oct. : l'import propose d'avancer la date de début.
- Le nom de l'onglet (« EdT\_du\_26\_au\_31\_oct\_2026 ») donne la semaine : détection automatique.
- Le fichier a l'extension .xlsm mais ne contient aucune macro ; l'import accepte ce format et ignore tout code.

## 11. Décisions validées

| Sujet | Décision |
| --- | --- |
| Nom | Elizo Focus |
| Révisions | Planification seulement, pas de fiches mémoire |
| Journal | Verrouillage par code après la V1 |
| Carrière | Module retiré |
| Clubs | Personnels, sans invitation de membres |
| Inscription | Sur invitation uniquement |
| Notifications | Par e-mail dès la V1, expéditeur = un compte Gmail du propriétaire |
| Thème sombre | Prioritaire dès le MVP |
| Fichier de l'ESP | Arrive a priori chaque semaine dans le même modèle : format prioritaire de l'import |
| Absences | Pas de règle officielle : seuil d'absences facultatif, fixé par matière |
| Fin des cours du samedi | 17h00 |

Aucun point ouvert : le cahier des charges est prêt pour les maquettes et le démarrage du MVP.
