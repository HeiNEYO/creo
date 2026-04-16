/** Slug URL stable par workspace (suffixe court pour éviter les collisions). */
export function makeUniqueCourseSlug(title: string): string {
  const base = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

  const safe = base.length > 0 ? base : "formation";
  const suffix =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 8)
      : `${Date.now().toString(36)}`;

  return `${safe}-${suffix}`;
}
