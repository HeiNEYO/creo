/** Agrège les tags contacts (tableau text[]) en comptages triés. */
export function aggregateTagCounts(
  rows: { tags: string[] | null }[]
): { tag: string; count: number }[] {
  const map = new Map<string, number>();
  for (const r of rows) {
    for (const t of r.tags ?? []) {
      const k = t.trim();
      if (!k) continue;
      map.set(k, (map.get(k) ?? 0) + 1);
    }
  }
  return Array.from(map.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], "fr"))
    .map(([tag, count]) => ({ tag, count }));
}

export function countDistinctTags(rows: { tags: string[] | null }[]): number {
  return aggregateTagCounts(rows).length;
}
