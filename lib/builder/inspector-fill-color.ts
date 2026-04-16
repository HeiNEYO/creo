/** Utilitaires couleur pour le sélecteur « Remplissage » (inspecteur builder). */

export type FillKind = "solid" | "linear" | "radial" | "conic" | "image";

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const t = hex.trim().replace(/^#/, "");
  if (!/^[0-9A-Fa-f]{6}$/.test(t)) return null;
  return {
    r: parseInt(t.slice(0, 2), 16),
    g: parseInt(t.slice(2, 4), 16),
    b: parseInt(t.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

/** rgba(1,2,3,0.5) ou rgb(1,2,3) */
export function parseRgba(str: string): { r: number; g: number; b: number; a: number } | null {
  const m = str
    .trim()
    .match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/i);
  if (!m) return null;
  return {
    r: clamp(Number(m[1]), 0, 255),
    g: clamp(Number(m[2]), 0, 255),
    b: clamp(Number(m[3]), 0, 255),
    a: m[4] !== undefined ? clamp(Number(m[4]), 0, 1) : 1,
  };
}

export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return { h: h * 360, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let rp = 0,
    gp = 0,
    bp = 0;
  if (h < 60) [rp, gp, bp] = [c, x, 0];
  else if (h < 120) [rp, gp, bp] = [x, c, 0];
  else if (h < 180) [rp, gp, bp] = [0, c, x];
  else if (h < 240) [rp, gp, bp] = [0, x, c];
  else if (h < 300) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return {
    r: Math.round((rp + m) * 255),
    g: Math.round((gp + m) * 255),
    b: Math.round((bp + m) * 255),
  };
}

export function parseSolidToHsvAlpha(
  raw: string,
  fallbackHex: string
): { h: number; s: number; v: number; a: number } {
  const t = raw.trim().toLowerCase();
  if (!t || t === "transparent") {
    const rgb = hexToRgb(fallbackHex) ?? { r: 0, g: 0, b: 0 };
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    return { ...hsv, a: 0 };
  }
  const rgba = parseRgba(t);
  if (rgba) {
    const hsv = rgbToHsv(rgba.r, rgba.g, rgba.b);
    return { ...hsv, a: rgba.a };
  }
  const hex = /^#[0-9A-Fa-f]{6}$/.test(raw.trim()) ? raw.trim() : fallbackHex;
  const rgb = hexToRgb(hex) ?? { r: 0, g: 0, b: 0 };
  const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  return { ...hsv, a: 1 };
}

export function solidToCss(h: number, s: number, v: number, a: number): string {
  const { r, g, b } = hsvToRgb(h, s, v);
  if (a >= 0.999) return rgbToHex(r, g, b);
  return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3).replace(/\.?0+$/, "") || "0"})`;
}

export function detectFillKind(v: string): FillKind {
  const t = v.trim().toLowerCase();
  if (!t || t === "transparent") return "solid";
  if (t.startsWith("linear-gradient")) return "linear";
  if (t.startsWith("radial-gradient")) return "radial";
  if (t.startsWith("conic-gradient")) return "conic";
  if (t.startsWith("url(")) return "image";
  return "solid";
}

const LINEAR_ANGLE = /linear-gradient\(\s*(-?[\d.]+)deg/i;

export function parseLinearGradient(
  v: string
): { angle: number; c1: string; c2: string } | null {
  const m = v.match(LINEAR_ANGLE);
  if (!m) return null;
  const angle = Number(m[1]) || 90;
  const inner = v.replace(/^linear-gradient\s*\(/i, "").replace(/\)\s*$/, "");
  const parts = inner.split(",").map((s) => s.trim());
  if (parts.length < 3) return null;
  const stops = parts.slice(1);
  const c1 = stops[0]?.replace(/\s+\d+%$/, "").trim() ?? "#000000";
  const c2 = stops[stops.length - 1]?.replace(/\s+\d+%$/, "").trim() ?? "#ffffff";
  return { angle, c1, c2 };
}

export function buildLinearGradient(angle: number, c1: string, c2: string): string {
  return `linear-gradient(${angle}deg, ${c1} 0%, ${c2} 100%)`;
}

export function buildRadialGradient(c1: string, c2: string): string {
  return `radial-gradient(circle at 50% 50%, ${c1} 0%, ${c2} 100%)`;
}

export function buildConicGradient(c1: string, c2: string): string {
  return `conic-gradient(from 0deg, ${c1}, ${c2})`;
}

/** Aperçu CSS pour le carré (dégradé, url, transparent). */
export function previewBackgroundCss(value: string, fallbackHex: string): string {
  const t = value.trim();
  if (!t || t === "transparent") {
    return "linear-gradient(45deg, #e4e4e7 25%, transparent 25%, transparent 75%, #e4e4e7 75%), linear-gradient(45deg, #e4e4e7 25%, transparent 25%, transparent 75%, #e4e4e7 75%)";
  }
  if (t.startsWith("linear-gradient") || t.startsWith("radial-gradient") || t.startsWith("conic-gradient")) {
    return t;
  }
  if (t.startsWith("url(")) return t;
  const rgba = parseRgba(t);
  if (rgba) return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`;
  const hex = hexToRgb(t) ? t : fallbackHex;
  return hex;
}

export function hexDisplay(value: string, fallbackHex: string): string {
  const t = value.trim();
  if (!t || t === "transparent") return "—";
  if (t.startsWith("linear-gradient") || t.startsWith("radial-gradient") || t.startsWith("conic-gradient")) {
    return "dégradé";
  }
  if (t.startsWith("url(")) return "image";
  const rgba = parseRgba(t);
  if (rgba) {
    const hex = rgbToHex(rgba.r, rgba.g, rgba.b);
    return rgba.a < 1 ? hex.slice(1).toUpperCase() + ` · ${Math.round(rgba.a * 100)}%` : hex.slice(1).toUpperCase();
  }
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t.slice(1).toUpperCase();
  const fb = fallbackHex.replace(/^#/, "").toUpperCase();
  return t.length > 14 ? `${t.slice(0, 14)}…` : t || fb;
}
