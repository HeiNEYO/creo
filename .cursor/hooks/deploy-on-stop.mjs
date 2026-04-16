/**
 * Hook Cursor (événement `stop`) : déploie en production si le working tree Git
 * n’est pas propre — évite un déploiement quand l’agent n’a fait qu’une réponse sans toucher aux fichiers.
 *
 * Windows : utilise `deploy.bat` s’il existe. Autres OS : `npm run build` puis `npm run deploy:vercel`.
 */
import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { platform } from "node:os";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
process.chdir(root);

let dirty = false;
try {
  const out = execSync("git status --porcelain", { encoding: "utf8" });
  dirty = Boolean(out.trim());
} catch {
  process.exit(0);
}

if (!dirty) {
  process.exit(0);
}

const isWin = platform() === "win32";

if (isWin && existsSync("deploy.bat")) {
  execSync("deploy.bat", { stdio: "inherit", shell: true });
} else {
  execSync("npm run build && npm run deploy:vercel", { stdio: "inherit", shell: true });
}
