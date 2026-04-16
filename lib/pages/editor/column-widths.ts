import type { Row } from "@/lib/pages/editor/page-document.types";

/**
 * Recalcule les largeurs % desktop pour que la colonne `focusIndex` vaille `percent`,
 * le reste étant réparti à parts égales (somme = 100).
 */
export function redistributeColumnWidths(row: Row, focusIndex: number, percent: number): number[] {
  const n = row.columns.length;
  const p = Math.min(92, Math.max(8, Math.round(percent)));
  if (n === 1) return [100];
  const remaining = 100 - p;
  const base = Math.floor(remaining / (n - 1));
  const extra = remaining - base * (n - 1);
  const out: number[] = [];
  let extrasUsed = 0;
  for (let i = 0; i < n; i++) {
    if (i === focusIndex) {
      out.push(p);
    } else {
      const bump = extrasUsed < extra ? 1 : 0;
      extrasUsed += bump;
      out.push(base + bump);
    }
  }
  return out;
}
