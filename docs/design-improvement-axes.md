# Axes d’amélioration design & expérience — CRÉO

Document de référence pour prioriser la cohérence visuelle, l’UX et la perception « premium » du produit. Cadre cible : esthétique **enterprise SaaS** (inspiration Polaris), typo **Inter / Plus Jakarta Sans**, icônes **Lucide ou Phosphor**, tokens dans `styles/design-system.css` et extensions Tailwind (`tailwind.config.ts`).

## Contexte technique (état du repo)

- **Fondations** : espacements `--creo-space-*`, rayons, échelle typo (`text-creo-*`), couleurs sémantiques, ombres cartes dashboard, thème public via variables (`app/globals.css`, `.creo-public-page`).
- **Structure UI** : primitives `components/ui/` ; vues par domaine `components/{dashboard,builder,public,...}/`.
- **Périmètre produit** : dashboard (cockpit, analytics, réglages), builder, pages publiques, email CRM, cours, commandes, intégrations, auth, etc.

---

## Axe 1 — Gouvernance du design system (tokens + composants)

**Objectif** : une seule « langue » visuelle sur tous les écrans.

**Constat** : les tokens existent, mais le catalogue de primitives UI est encore limité ; beaucoup de patterns vivent dans les vues métier.

**Pistes**

- Étendre les primitives récurrentes (select, dialog, table, toast, tabs, skeleton, etc.) dans `components/ui/` en réutilisant les tokens.
- Définir 4–5 **layouts de page** types (liste + détail, formulaire long, hub) et s’y référer pour les nouvelles routes.
- Réduire les couleurs et espacements « magiques » hors variables / `text-creo-*` / `p-creo-*`.

**Gain** : moins d’écart entre Email CRM, Cours et Réglages ; itérations plus rapides.

---

## Axe 2 — Cohérence inter-domaines (navigation mentale)

**Objectif** : les mêmes repères partout (titres, fil d’Ariane, zone d’actions principales).

**Pistes**

- Modèle de **page hub** réutilisable où c’est pertinent (titres, grille de cartes, CTA).
- Patterns unifiés pour **filtres, recherche, pagination** entre les listes métier.
- Hiérarchie titres stable : H1 = page, H2 = sections, sous-texte en `text-muted-foreground` / équivalent token.

**Gain** : sensation d’un produit unique, pas d’empilement de modules.

---

## Axe 3 — Densité d’information vs respiration

**Objectif** : arbitrer tableaux denses (contacts, commandes) et vues aérées (cockpit).

**Pistes**

- Deux **niveaux de densité** (compact / confort) documentés et réutilisables.
- Rythme vertical sur multiples de 4/8 px ; regroupements visuels (cartes, séparateurs légers, sous-titres).

**Gain** : lisibilité des gros volumes sans aspect « brut de tableur ».

---

## Axe 4 — États vides, chargement et erreurs

**Objectif** : instaurer confiance aux moments sensibles (pas de données, latence, échec).

**Pistes**

- Bibliothèque d’**empty states** : message clair + une action principale.
- **Skeletons** alignés sur la grille réelle des listes / cartes.
- Erreurs **actionnables** (réessayer, lien support ou doc).

**Gain** : moins d’abandon pour les nouveaux utilisateurs et après incident.

---

## Axe 5 — Accessibilité visuelle et clavier

**Objectif** : contrastes, focus, cibles tactiles, formulaires conformes à l’usage B2B.

**Pistes**

- Vérifier combinaisons **marque / fond** (WCAG).
- Anneau de **focus** visible et cohérent sur contrôles custom.
- Zones tactiles ≥ 44 px sur actions critiques en mobile.

**Gain** : conformité, confiance, moins de friction pour une partie des utilisateurs.

---

## Axe 6 — Responsive et tâches « deep work »

**Objectif** : mobile crédible sans promesse irréaliste sur l’éditeur complet.

**Pistes**

- Mobile : privilégier **consultation** et actions simples ; simplifier ou reporter l’édition lourde si nécessaire.
- Tester flux **commandes / contacts / réglages** à ~375 px de largeur.

**Gain** : usage hors bureau réaliste.

---

## Axe 7 — Continuité marque : pages publiques ↔ back-office

**Objectif** : le visiteur reconnaît la même identité que dans le dashboard.

**Pistes**

- Rapprocher la **hiérarchie typo** des pages publiques (variables `--creo-page-*`) du dashboard.
- Harmoniser **boutons publics** (`.creo-public-btn`) avec la logique de variantes du système.

**Gain** : image « produit abouti » pour les clients des utilisateurs CRÉO.

---

## Axe 8 — Motion et micro-interactions

**Objectif** : feedback utile sans distraction.

**Pistes**

- Durées courtes (150–250 ms), courbe d’easing cohérente.
- Feedback sur hover, succès, suppression ; respect de `prefers-reduced-motion`.

**Gain** : interface vivante sans fatigue cognitive.

---

## Axe 9 — Parcours d’activation (onboarding → première valeur)

**Objectif** : réduire le temps jusqu’au premier résultat concret.

**Pistes**

- Cartographier **compte → workspace → première page / premier email / premier paiement**.
- CTA contextuels dans le **cockpit** alignés sur ces étapes.

**Gain** : conversion et rétention, au-delà du seul polish visuel.

---

## Axe 10 — Design ops léger

**Objectif** : éviter la divergence du système à chaque feature.

**Pistes**

- Checklist avant merge : tokens, états hover/disabled/focus, pas de régression d’accessibilité évidente.
- Références visuelles ou Storybook si l’équipe grandit ; revue ciblée sur **nouveaux patterns**.

**Gain** : vélocité durable, moins de cas particuliers permanents.

---

## Matrice de priorisation (rappel)

| Si la priorité est… | Combiner en premier |
|---------------------|---------------------|
| Cohérence visuelle immédiate | **1**, **2**, **7** |
| Confiance et professionnalisme | **4**, **5**, **8** |
| Croissance / activation | **9**, **2**, **4** |
| Mobile réaliste | **6**, **5** |
| Équipe qui scale | **1**, **10** |

---

## Fichiers utiles dans le repo

| Fichier / dossier | Rôle |
|-------------------|------|
| `styles/design-system.css` | Tokens CSS (couleurs, espacements, rayons, ombres) |
| `app/globals.css` | Thème global, utilitaires, cartes dashboard, boutons publics |
| `tailwind.config.ts` | `fontSize` / `spacing` / `colors` CRÉO |
| `components/ui/` | Primitives réutilisables |
| `components/dashboard/`, `components/builder/`, `components/public/` | UI par domaine |

---

## Déploiement après changements design

Une fois une évolution visuelle mergée ou prête en prod, déployer pour que Vercel reflète le rendu réel (CSS, composants, build Next).

- **Windows** : à la racine du repo, exécuter **`deploy.bat`** (build local puis `vercel --prod`).
- **Sinon** : `npm run build` puis `npm run deploy:vercel`.

Voir aussi la règle workspace **déploiement** (`.cursor/rules/deploy-vercel.mdc`) et `AGENTS.md`.

---

*Document ajouté pour piloter les évolutions design & UX ; à mettre à jour quand un axe est traité ou repriorisé.*
