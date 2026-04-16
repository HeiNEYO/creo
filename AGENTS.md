# Instructions pour les agents (Cursor / IA)

## Avant de modifier le projet

1. Lire **`docs/architecture.md`** pour savoir où placer nouveau code (front vs `lib/`, conventions des dossiers).
2. **Déploiement automatique** : après toute modif qui touche l’app Next.js, **lancer le déploiement prod en fin de tâche** (sans attendre que l’utilisateur le redemande). **Windows** : **`deploy.bat`** à la racine. **Autres** : `npm run build` puis **`npm run deploy:vercel`**. Design / UI : **toujours** déployer une fois le build OK. Pour un déploiement à chaque **push** sans agent : lier le repo dans le dashboard Vercel **ou** configurer les secrets `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` sur GitHub pour le workflow `.github/workflows/vercel-production.yml` (éviter les deux en même temps sur le même repo).

## Règles rapides

- **Routes** : uniquement sous `app/` (structure imposée par Next.js).
- **Logique métier & accès BDD** : `lib/<domaine>/`, pas dans les composants sauf appels `use server` / actions déjà pattern du fichier.
- **UI réutilisable** : `components/ui/` ; **UI métier** : `components/{auth|builder|dashboard|public|...}/`.
- **Limites listes / pagination API** : utiliser ou étendre **`lib/config/limits.ts`**.
- **Réponses JSON dans les routes** : préférer **`jsonData` / `jsonError`** depuis **`lib/http/response.ts`**.
- **Éditeur de page** : types et store dans `lib/pages/editor/` ; UI dans `components/builder/page-editor/`.

## Langue

- Messages utilisateur et commentaires orientés produit : **français** quand le reste du fichier est en français.
