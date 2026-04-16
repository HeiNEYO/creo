/** Document email (éditeur visuel) — sections → colonnes → blocs. */
export type EmailBlockType =
  | "heading"
  | "text"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "bullet_list"
  | "html"
  | "social"
  | "signature";

export type EmailBlock = {
  id: string;
  type: EmailBlockType;
  content: Record<string, unknown>;
  style?: Record<string, unknown>;
  hiddenOnMobile?: boolean;
};

export type EmailColumn = {
  id: string;
  blocks: EmailBlock[];
};

export type EmailSection = {
  id: string;
  columns: EmailColumn[];
  style?: Record<string, unknown>;
};

export type EmailGlobals = {
  maxWidthPx: number;
  bodyBg: string;
  contentBg: string;
  fontFamily: string;
  paddingPx: number;
};

export type EmailDocument = {
  version: 2;
  globals: EmailGlobals;
  sections: EmailSection[];
};

export function defaultEmailGlobals(): EmailGlobals {
  return {
  maxWidthPx: 600,
  bodyBg: "#f4f4f5",
  contentBg: "#ffffff",
  fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
  paddingPx: 24,
  };
}
