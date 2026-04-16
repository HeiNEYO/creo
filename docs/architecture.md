# Architecture CRÉO

Document de référence pour naviguer le code, ajouter des fonctionnalités et anticiper la montée en charge (centaines d’utilisateurs actifs).

## Vue d’ensemble

| Zone | Rôle |
|------|------|
| `app/` | Routes Next.js (App Router). Pages **fines** : composition de composants + appels serveur légers. |
| `app/api/` | Route Handlers HTTP (JSON, webhooks, intégrations). **Sans état** entre requêtes. |
| `components/` | Interface React par **domaine produit** (`auth`, `builder`, `dashboard`, `public`, `marketing`, `ui`). |
| `lib/` | Logique métier, accès données, clients tiers, utilitaires. **Pas de JSX** sauf exception rare. |
| `middleware.ts` | Auth / redirections en bordure de requête. |
| `supabase/migrations/` | Schéma et politiques SQL (source de vérité côté données). |

**Éditeur de page** : le layout `app/builder/layout.tsx` ajoute la classe `creo-builder-theme` pour rétablir le **bleu marque** en mode sombre (le `.dark` global neutralise `--creo-blue` pour le reste du dashboard). Voir `styles/design-system.css`.

## Front-end (`app/` + `components/`)

- **`app/layout.tsx`, `app/page.tsx`** : coquille marketing / auth globale.
- **`app/dashboard/**`** : espace connecté ; layout partagé (`dashboard/layout.tsx`).
- **`app/builder/[pageId]`** : éditeur de page ; charge `BuilderShell` + provider éditeur.
- **`app/p/[workspaceSlug]/[pageSlug]`** : rendu **public** des pages (lecture seule, SEO).
- **`components/ui/`** : primitives réutilisables (shadcn-like). Ne pas y mettre de logique métier.
- **`components/builder/page-editor/`** : canvas, panneaux, inspecteur. Gros fichiers = candidats à découpage futur (`panels/`, `hooks/`) sans changer les imports `@/components/builder/...` racines si possible.
- **`components/public/`** : blocs et rendu côté visiteur (cohérent avec `lib/public-pages`).

**Convention** : une nouvelle page dashboard = `app/dashboard/.../page.tsx` + composant principal dans `components/dashboard/...`.

## Back-end (`lib/` + `app/api/`)

- **`lib/supabase/`** : clients cookie (server), service role, middleware, lecture session.
- **`lib/auth/`** : validation Zod, actions liées à l’auth.
- **`lib/workspaces/`** : workspace, invitations, contexte multi-tenant.
- **`lib/pages/`** : CRUD pages, types blocs **legacy** ; **`lib/pages/editor/`** : document JSON v2, store Zustand, DnD, styles.
- **`lib/stripe/`** : serveur Stripe, messages d’erreur, enregistrement commandes.
- **`lib/public-pages/`** : fetch page publique, thème, checkout public.
- **`lib/analytics/`**, **`lib/contacts/`**, **`lib/courses/`**, etc. : domaines métiers isolés.

**Nouvelle route API** : `app/api/<domaine>/<action>/route.ts` ; logique dans `lib/<domaine>/` (ou `lib/http/` pour helpers génériques).

**Constantes de limites** (pagination, plafonds requêtes) : `lib/config/limits.ts` — à réutiliser plutôt que des nombres magiques dans les routes et pages serveur.

**Réponses HTTP JSON** (route handlers) : `lib/http/response.ts` (`jsonData`, `jsonError`).

## Données et montée en charge

- **Supabase** : une fois RLS correctes, la montée en charge lecture/écriture passe surtout par le **plan**, les **index** (voir migrations), et le volume de requêtes par utilisateur.
- **API routes Vercel** : exécution serverless ; garder les handlers **courts**, éviter le gros travail synchrone (préférer files d’attente / jobs si un jour nécessaire).
- **Pages publiques** : `fetch` avec tags/revalidate côté Next selon besoin futur ; aujourd’hui dynamique selon routes.
- **Webhooks Stripe** : idempotence et erreurs explicites pour éviter doubles traitements.

## Imports

- Alias **`@/*`** → racine du repo (`tsconfig.json`).
- Préférer `@/lib/...` et `@/components/...` aux chemins relatifs longs (`../../../lib/...`).

## Évolutions possibles (sans obligation immédiate)

- Découper `editor-right-panel.tsx` en sous-modules par type de panneau.
- Barils (`index.ts`) **par petit dossier** seulement si pas de cycles d’imports.
- Dossier `features/<nom>/` si un domaine grossit beaucoup (colocaliser UI + hooks + types).

## Phases produit (hors builder) — état

| Thème | Contenu |
|-------|---------|
| **Limites & perf** | `lib/config/limits.ts` : recherche pages, notifications header, cockpit (activité + commandes), admin intake. Ajuster les constantes sous charge. |
| **API** | `lib/http/response.ts` pour uniformiser les JSON ; étendre aux autres `app/api/**/route.ts` au fil des besoins. |
| **Dashboard** | Cockpit, analytics, settings : logique dans `lib/<domaine>/` ; UI dans `components/dashboard/`. **Email & CRM** (`/dashboard/email-crm/*`) : `lib/email-crm/`, `lib/crm/`, `lib/contacts/`, éditeur email (`components/email-editor/`), opt-in public `app/api/public/contacts/optin`. |
| **Public** | Pages `app/p/...`, `lib/public-pages/`, rendu blocs `components/public/`. |

## Design & expérience

- **Axes d’amélioration** (cohérence visuelle, UX, accessibilité, onboarding, design ops) : voir [`docs/design-improvement-axes.md`](./design-improvement-axes.md).

---

*Dernière mise à jour : section Marketing (hub + sous-pages) et helpers HTTP (hors builder).*
