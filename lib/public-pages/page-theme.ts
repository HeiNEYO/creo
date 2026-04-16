import { defaultGlobalStyles, defaultPageMeta } from "@/lib/pages/editor/defaults";
import type { GlobalStyles, PageDocument, PageMeta } from "@/lib/pages/editor/page-document.types";

export type ResolvedPageTheme = {
  meta: PageMeta;
  globalStyles: GlobalStyles;
};

/** Lit meta + globalStyles depuis `content.document` (éditeur v2), sinon défauts (page blanche). */
export function pageThemeFromContent(content: unknown): ResolvedPageTheme {
  const baseMeta = defaultPageMeta();
  const baseGs = defaultGlobalStyles();
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return { meta: baseMeta, globalStyles: baseGs };
  }
  const doc = (content as { document?: PageDocument }).document;
  if (!doc || typeof doc !== "object") {
    return { meta: baseMeta, globalStyles: baseGs };
  }
  const meta = doc.meta && typeof doc.meta === "object" ? { ...baseMeta, ...doc.meta } : baseMeta;
  const globalStyles =
    doc.globalStyles && typeof doc.globalStyles === "object"
      ? { ...baseGs, ...doc.globalStyles }
      : baseGs;
  return { meta, globalStyles };
}

export function pageFontStack(name: string): string {
  const n = (name || "").trim();
  if (!n) return "system-ui, sans-serif";
  if (n.includes(",")) return n;
  if (n === "system-ui") return "system-ui, sans-serif";
  return `${JSON.stringify(n)}, system-ui, sans-serif`;
}

/** Valeurs stockées dans `globalStyles.fontHeading` / `fontBody` (noms courts). */
export const PAGE_FONT_PRESETS: { value: string; label: string }[] = [
  { value: "Inter", label: "Inter" },
  { value: "system-ui", label: "Système" },
  { value: "Georgia", label: "Georgia" },
  { value: "Merriweather", label: "Merriweather" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
];
