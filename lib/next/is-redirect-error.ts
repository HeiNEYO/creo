/** Détecte l’erreur interne levée par `redirect()` (Next.js App Router). */
export function isRedirectError(error: unknown): boolean {
  if (typeof error !== "object" || error === null) return false;
  const d =
    "digest" in error ? (error as { digest: unknown }).digest : undefined;
  return typeof d === "string" && d.startsWith("NEXT_REDIRECT");
}
