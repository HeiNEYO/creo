# CRÉO

Plateforme SaaS (Next.js 14, App Router, Supabase, déploiement Vercel).  
Tableau de bord, builder de pages, formations, contacts, e-mails et paramètres — base prête pour itérer sur le design et les fonctionnalités.

## Prérequis

- **Node.js** 20+
- Compte **Supabase** (projet avec Auth activée)
- Compte **Vercel** (optionnel en local ; recommandé en production)

## Démarrage local

```bash
cp .env.example .env.local
# Renseigner NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, NEXT_PUBLIC_APP_URL
npm ci
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

## Variables d’environnement

Voir [`.env.example`](./.env.example). Indispensables pour l’auth et les routes protégées :

| Variable | Rôle |
|----------|------|
| `NEXT_PUBLIC_APP_URL` | URL canonique (emails, redirections) |
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anonyme (client) |

Les autres clés (Stripe, Resend, OpenAI, `SUPABASE_SERVICE_ROLE_KEY`) sont optionnelles selon les features activées.

## Base de données Supabase

Les schémas et fonctions évoluent dans `supabase/migrations/`.  
À appliquer sur votre instance (CLI Supabase `db push` / `migration up`, ou exécution SQL dans le dashboard).

Exemple utile pour l’app : RPC `ensure_default_workspace` (workspace par défaut à la connexion dashboard / builder).

## Thème & design system

- Tokens CSS : [`styles/design-system.css`](./styles/design-system.css) (clair / sombre `.dark`, bleu primaire `#0033ff`, fond sombre `#0b0b0b`).
- Police : **Inter** (voir `app/layout.tsx`).

## Déploiement (Vercel)

1. **Recommandé** : importer le dépôt Git dans Vercel, branche de production `main`, puis configurer les mêmes variables que dans `.env.local` (onglet *Environment Variables*).
2. **CLI** : `npx vercel deploy --prod` (depuis la racine du projet, compte déjà lié).
3. **GitHub Actions** (optionnel) : définir la variable de dépôt `VERCEL_CI_ENABLED` à `true` et les secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` — voir [`.github/workflows/vercel-production.yml`](./.github/workflows/vercel-production.yml). Sinon laissez la variable absente ou à `false` pour éviter un workflow rouge si vous utilisez uniquement l’intégration Git Vercel.

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Lance le build local |
| `npm run lint` | ESLint |

## Structure utile

- `app/` — routes App Router (`/`, `/login`, `/dashboard/*`, `/builder/*`, `/learn/*`)
- `components/` — UI partagée, dashboard, auth, marketing
- `lib/supabase/` — clients serveur / middleware / lecture session
- `middleware.ts` — protection des chemins + appel workspace par défaut

## Licence

Projet privé — usage selon les conditions du dépôt propriétaire.
