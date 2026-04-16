/** Paramètre d’URL : l’aperçu dashboard ne doit pas incrémenter les vues publiques. */
export const PAGE_PREVIEW_QUERY = "creo_preview=1" as const;

/**
 * Chemin relatif de la page publique (sans tracking vues si `withPreviewQuery`).
 */
export function buildPublicPagePath(
  workspaceSlug: string | null | undefined,
  pageSlug: string | null | undefined,
  options?: { preview?: boolean }
): string | null {
  const ws = workspaceSlug?.trim();
  const ps = pageSlug?.trim();
  if (!ws || !ps) return null;
  const path = `/p/${encodeURIComponent(ws)}/${encodeURIComponent(ps)}`;
  if (options?.preview) return `${path}?${PAGE_PREVIEW_QUERY}`;
  return path;
}

export function toAbsoluteAppUrl(path: string, appUrl: string | undefined): string {
  const base = appUrl?.replace(/\/$/, "").trim();
  if (base) return `${base}${path.startsWith("/") ? path : `/${path}`}`;
  return path;
}
