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

### Déploiement automatique à chaque modification (recommandé)

Dès que tu **commit** et **push** sur la branche de production (souvent `main`), Vercel peut builder et publier **sans commande manuelle**.

1. [Vercel Dashboard](https://vercel.com) → **Add New…** → **Project** → **Import Git Repository** (GitHub / GitLab / Bitbucket).
2. Sélectionne ce dépôt, branche de production **`main`** (ou celle que tu utilises), framework **Next.js** détecté automatiquement.
3. Copie les variables d’environnement (comme en local) dans **Settings → Environment Variables** pour **Production** (et Preview si besoin).
4. Chaque **push** sur `main` déclenche un nouveau déploiement production. Les PR ouvrent en général un **Preview** automatique.

**Important** : ne pas activer en parallèle le workflow GitHub Actions ci‑dessous **et** cette intégration Git native, sinon tu risques **deux déploiements** par push. Choisis l’un ou l’autre.

### Déploiement manuel (CLI)

Si le dépôt n’est pas lié à Vercel : à la racine du projet, compte déjà connecté (`vercel login`).

```bash
npm run deploy:vercel
```

### GitHub Actions (alternative au déploiement Git Vercel)

Si tu préfères que ce soit **GitHub Actions** qui déploie (et que l’intégration Git **native Vercel est désactivée** ou sans doublon) :

1. GitHub → **Settings → Secrets and variables → Actions** : ajoute `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (voir [compte Vercel](https://vercel.com/account/tokens) et l’ID du projet dans les paramètres du projet).
2. **Settings → Variables → Actions** : `VERCEL_CI_ENABLED` = `true`.
3. Chaque **push** sur `main` exécute [`.github/workflows/vercel-production.yml`](./.github/workflows/vercel-production.yml).

Sans `VERCEL_CI_ENABLED=true`, le workflow est **ignoré** (pas d’erreur rouge si tu utilises uniquement l’import Git Vercel).

## Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run start` | Lance le build local |
| `npm run lint` | ESLint |
| `npm run deploy:vercel` | Déploiement production via CLI (`vercel --prod --yes`) |

## Structure utile

- `app/` — routes App Router (`/`, `/login`, `/dashboard/*`, `/builder/*`, `/learn/*`)
- `components/` — UI partagée, dashboard, auth, marketing
- `lib/supabase/` — clients serveur / middleware / lecture session
- `middleware.ts` — protection des chemins + appel workspace par défaut

## Licence

Projet privé — usage selon les conditions du dépôt propriétaire.
