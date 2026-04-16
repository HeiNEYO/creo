import { defaultElementStyle } from "@/lib/pages/editor/defaults";
import type { ElementStyle } from "@/lib/pages/editor/page-document.types";

/** Fusionne un payload JSON (ex. `data.elementStyle`) dans un style d’élément. */
export function mergeElementStyleFromPayload(base: ElementStyle, raw: unknown): ElementStyle {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const p = raw as Partial<ElementStyle>;
  const border = p.border && typeof p.border === "object" ? { ...base.border, ...p.border } : base.border;
  const boxShadow =
    p.boxShadow && typeof p.boxShadow === "object" ? { ...base.boxShadow, ...p.boxShadow } : base.boxShadow;
  const transform =
    p.transform && typeof p.transform === "object" ? { ...base.transform, ...p.transform } : base.transform;
  const filter = p.filter && typeof p.filter === "object" ? { ...base.filter, ...p.filter } : base.filter;
  const transition =
    p.transition && typeof p.transition === "object" ? { ...base.transition, ...p.transition } : base.transition;
  return {
    ...base,
    ...p,
    border,
    boxShadow,
    transform,
    filter,
    transition,
  };
}

function normalizeFontStyle(v: unknown): ElementStyle["fontStyle"] {
  return v === "italic" ? "italic" : "normal";
}

const TEXT_DECO_SET = new Set<ElementStyle["textDecoration"]>([
  "none",
  "underline",
  "line-through",
  "underline line-through",
]);

function normalizeTextDecoration(v: unknown): ElementStyle["textDecoration"] {
  if (typeof v !== "string") return "none";
  const t = v.trim();
  if (t === "line-through underline") return "underline line-through";
  if (TEXT_DECO_SET.has(t as ElementStyle["textDecoration"])) return t as ElementStyle["textDecoration"];
  return "none";
}

/** Reconstitue un `ElementStyle` exploitable à partir d’un JSON partiel (rendu public). */
export function coerceElementStyle(raw: unknown): ElementStyle {
  const base = defaultElementStyle();
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return base;
  const merged = mergeElementStyleFromPayload(base, raw);
  return {
    ...merged,
    fontStyle: normalizeFontStyle(merged.fontStyle),
    textDecoration: normalizeTextDecoration(merged.textDecoration),
  };
}

/** Retire `elementStyle` d’un objet data legacy avant de le mettre dans `content`. */
export function stripElementStyleKey(data: Record<string, unknown>): void {
  delete data.elementStyle;
}
