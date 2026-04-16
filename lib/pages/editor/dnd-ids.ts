import type { ElementType } from "@/lib/pages/editor/page-document.types";

export const CREO_CANVAS_EMPTY_ID = "canvas-empty" as const;

/** Zone en bas du canvas : ajoute une section vide à la fin. */
export const CREO_CANVAS_INSERT_SECTION_ID = "canvas-insert-section" as const;

/** Bloc palette « Section » (structure), pas un ElementType. */
export const CREO_PALETTE_SECTION_ID = "palette:__section__" as const;

export function isSectionPaletteDrag(id: string): boolean {
  return id === CREO_PALETTE_SECTION_ID;
}

export function creoPaletteDragId(type: ElementType): string {
  return `palette:${type}`;
}

export function parsePaletteDragId(id: string): ElementType | null {
  if (!id.startsWith("palette:")) return null;
  const rest = id.slice("palette:".length);
  if (rest === "__section__") return null;
  return rest as ElementType;
}

export function creoColumnDropId(columnId: string): string {
  return `column:${columnId}`;
}

export function parseColumnDropId(id: string): string | null {
  if (!id.startsWith("column:")) return null;
  return id.slice("column:".length);
}
