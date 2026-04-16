/**
 * Styles de bouton (éditeur + rendu public) — presets + champs optionnels.
 */

export type ButtonStylePresetId =
  | "solid"
  | "outline"
  | "ghost"
  | "soft"
  | "contrast"
  | "minimal";

export type ButtonStyleData = {
  preset?: ButtonStylePresetId;
  /** Couleurs */
  bgColor?: string;
  textColor?: string;
  hoverBgColor?: string;
  hoverTextColor?: string;
  /** Hover : zoom (échelle 1 = aucun) */
  hoverScale?: number;
  /** Transition (ms) */
  transitionMs?: number;
  /** Biseau / bordures visibles (px) */
  borderTopWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderRightWidth?: number;
  borderColor?: string;
  borderTopColor?: string;
  borderBottomColor?: string;
  /** Ombre interne type biseau (couleurs) */
  bevelHighlight?: string;
  bevelShadow?: string;
};

const PRESET_DEFAULTS: Record<ButtonStylePresetId, ButtonStyleData> = {
  solid: {
    preset: "solid",
    bgColor: "#18181b",
    textColor: "#ffffff",
    hoverBgColor: "#27272a",
    hoverTextColor: "#ffffff",
    hoverScale: 1.03,
    transitionMs: 200,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    bevelHighlight: "rgba(255,255,255,0.12)",
    bevelShadow: "rgba(0,0,0,0.25)",
  },
  outline: {
    preset: "outline",
    bgColor: "transparent",
    textColor: "#18181b",
    hoverBgColor: "#f4f4f5",
    hoverTextColor: "#18181b",
    hoverScale: 1.02,
    transitionMs: 200,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: "#18181b",
    bevelHighlight: "transparent",
    bevelShadow: "transparent",
  },
  ghost: {
    preset: "ghost",
    bgColor: "transparent",
    textColor: "#3f3f46",
    hoverBgColor: "#f4f4f5",
    hoverTextColor: "#18181b",
    hoverScale: 1.02,
    transitionMs: 180,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    bevelHighlight: "transparent",
    bevelShadow: "transparent",
  },
  soft: {
    preset: "soft",
    bgColor: "#f4f4f5",
    textColor: "#18181b",
    hoverBgColor: "#e4e4e7",
    hoverTextColor: "#18181b",
    hoverScale: 1.03,
    transitionMs: 200,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    bevelHighlight: "rgba(255,255,255,0.5)",
    bevelShadow: "rgba(0,0,0,0.06)",
  },
  contrast: {
    preset: "contrast",
    bgColor: "#fafafa",
    textColor: "#09090b",
    hoverBgColor: "#ffffff",
    hoverTextColor: "#09090b",
    hoverScale: 1.04,
    transitionMs: 220,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#d4d4d8",
    bevelHighlight: "rgba(255,255,255,0.9)",
    bevelShadow: "rgba(0,0,0,0.12)",
  },
  minimal: {
    preset: "minimal",
    bgColor: "transparent",
    textColor: "#52525b",
    hoverBgColor: "transparent",
    hoverTextColor: "#18181b",
    hoverScale: 1,
    transitionMs: 150,
    borderTopWidth: 0,
    borderBottomWidth: 1,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    borderBottomColor: "#d4d4d8",
    bevelHighlight: "transparent",
    bevelShadow: "transparent",
  },
};

export const BUTTON_PRESET_LABELS: Record<ButtonStylePresetId, string> = {
  solid: "Plein",
  outline: "Contour",
  ghost: "Discret",
  soft: "Doux",
  contrast: "Contraste",
  minimal: "Minimal",
};

export function getButtonPresetDefaults(id: ButtonStylePresetId): ButtonStyleData {
  return { ...PRESET_DEFAULTS[id] };
}

/** Fusionne les données stockées avec les défauts du preset indiqué. */
export type ResolvedButtonStyle = {
  preset: ButtonStylePresetId;
  bgColor: string;
  textColor: string;
  hoverBgColor: string;
  hoverTextColor: string;
  hoverScale: number;
  transitionMs: number;
  borderTopWidth: number;
  borderBottomWidth: number;
  borderLeftWidth: number;
  borderRightWidth: number;
  borderColor: string;
  borderTopColor: string;
  borderBottomColor: string;
  bevelHighlight: string;
  bevelShadow: string;
};

export function resolveButtonStyleData(d: Record<string, unknown>): ResolvedButtonStyle {
  const presetId = (typeof d.preset === "string" && d.preset in PRESET_DEFAULTS
    ? d.preset
    : "solid") as ButtonStylePresetId;
  const base = PRESET_DEFAULTS[presetId];
  const num = (v: unknown, fallback: number) => (typeof v === "number" && !Number.isNaN(v) ? v : fallback);
  const str = (v: unknown, fallback: string) => (typeof v === "string" && v.trim() ? v : fallback);

  return {
    preset: presetId,
    bgColor: str(d.bgColor, base.bgColor ?? "#18181b"),
    textColor: str(d.textColor, base.textColor ?? "#ffffff"),
    hoverBgColor: str(d.hoverBgColor, base.hoverBgColor ?? "#27272a"),
    hoverTextColor: str(d.hoverTextColor, base.hoverTextColor ?? "#ffffff"),
    hoverScale: num(d.hoverScale, base.hoverScale ?? 1.03),
    transitionMs: num(d.transitionMs, base.transitionMs ?? 200),
    borderTopWidth: num(d.borderTopWidth, base.borderTopWidth ?? 0),
    borderBottomWidth: num(d.borderBottomWidth, base.borderBottomWidth ?? 0),
    borderLeftWidth: num(d.borderLeftWidth, base.borderLeftWidth ?? 0),
    borderRightWidth: num(d.borderRightWidth, base.borderRightWidth ?? 0),
    borderColor: str(d.borderColor, base.borderColor ?? "#18181b"),
    borderTopColor: str(d.borderTopColor, base.borderTopColor ?? base.borderColor ?? "#18181b"),
    borderBottomColor: str(d.borderBottomColor, base.borderBottomColor ?? base.borderColor ?? "#18181b"),
    bevelHighlight: str(d.bevelHighlight, base.bevelHighlight ?? "rgba(255,255,255,0.12)"),
    bevelShadow: str(d.bevelShadow, base.bevelShadow ?? "rgba(0,0,0,0.25)"),
  };
}

export function mergeButtonPresetIntoContent(
  presetId: ButtonStylePresetId,
  prev: Record<string, unknown>
): Record<string, unknown> {
  const def = getButtonPresetDefaults(presetId);
  return { ...prev, ...def, preset: presetId };
}
