/**
 * Modèle des blocs de page (builder + rendu public).
 * Stocké dans pages.content.blocks (jsonb).
 */

import {
  createPageBlockFromRegistry,
  getPaletteForPageType,
  labelForBlockType as labelForBlockTypeReg,
} from "@/lib/pages/block-registry";
import type { PageBlock } from "@/lib/pages/page-block-types";

export type { PageBlock } from "@/lib/pages/page-block-types";

export type PaletteItem = import("@/lib/pages/block-registry").PaletteItem;

/** Palette « page libre » (texte simple) — compat anciens écrans */
export const BUILDER_PALETTE: PaletteItem[] = getPaletteForPageType("custom");

function newId(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return `blk-${globalThis.crypto.randomUUID()}`;
  }
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createPageBlock(blockType: string, defaultText?: string): PageBlock {
  const b = createPageBlockFromRegistry(blockType);
  if (defaultText !== undefined) {
    return { ...b, text: defaultText };
  }
  return b;
}

function readData(raw: Record<string, unknown>): Record<string, unknown> | undefined {
  const d = raw.data;
  if (d && typeof d === "object" && !Array.isArray(d)) {
    return { ...(d as Record<string, unknown>) };
  }
  return undefined;
}

export function normalizePageBlock(raw: unknown): PageBlock {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return createPageBlockFromRegistry("paragraph");
  }
  const o = raw as Record<string, unknown>;
  const id = typeof o.id === "string" && o.id.trim() ? o.id : newId();
  const type = typeof o.type === "string" && o.type.trim() ? o.type : "paragraph";
  const text = typeof o.text === "string" ? o.text : "";
  const data = readData(o);
  return { id, type, text, ...(data ? { data } : {}) };
}

export function blocksFromContent(content: unknown): PageBlock[] {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return [];
  }
  const blocks = (content as { blocks?: unknown }).blocks;
  if (!Array.isArray(blocks)) return [];
  return blocks.map(normalizePageBlock);
}

export function labelForBlockType(type: string): string {
  return labelForBlockTypeReg(type);
}
