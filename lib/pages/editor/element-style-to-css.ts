import { coerceElementStyle } from "@/lib/pages/editor/merge-element-style";
import type { ElementStyle } from "@/lib/pages/editor/page-document.types";
import type { CSSProperties } from "react";

/** JSON `data.elementStyle` → styles inline (page publique). */
export function elementStylePayloadToCss(raw: unknown): CSSProperties {
  return elementStyleToPreviewCss(coerceElementStyle(raw));
}

function boxShadowToCss(st: ElementStyle["boxShadow"]): string | undefined {
  if (!st || (st.blur === 0 && st.spread === 0 && st.x === 0 && st.y === 0)) return undefined;
  if (!st.color || st.color === "transparent") return undefined;
  const inset = st.inset ? "inset " : "";
  return `${inset}${st.x}px ${st.y}px ${st.blur}px ${st.spread}px ${st.color}`;
}

function transformToCss(t: ElementStyle["transform"]): string | undefined {
  if (!t) return undefined;
  const parts: string[] = [];
  if (t.rotate) parts.push(`rotate(${t.rotate}deg)`);
  if (t.scaleX !== 1 || t.scaleY !== 1) parts.push(`scale(${t.scaleX}, ${t.scaleY})`);
  if (t.translateX || t.translateY) parts.push(`translate(${t.translateX}px, ${t.translateY}px)`);
  if (t.skewX || t.skewY) parts.push(`skew(${t.skewX}deg, ${t.skewY}deg)`);
  return parts.length ? parts.join(" ") : undefined;
}

function filterToCss(f: ElementStyle["filter"]): string | undefined {
  if (!f) return undefined;
  const p: string[] = [];
  if (f.blur > 0) p.push(`blur(${f.blur}px)`);
  if (f.brightness !== 100) p.push(`brightness(${f.brightness}%)`);
  if (f.contrast !== 100) p.push(`contrast(${f.contrast}%)`);
  if (f.grayscale > 0) p.push(`grayscale(${f.grayscale}%)`);
  if (f.sepia > 0) p.push(`sepia(${f.sepia}%)`);
  if (f.saturate !== 100) p.push(`saturate(${f.saturate}%)`);
  if (f.hueRotate !== 0) p.push(`hue-rotate(${f.hueRotate}deg)`);
  return p.length ? p.join(" ") : undefined;
}

/** Styles inline alignés sur `ElementStyle` (aperçu éditeur + page publique). */
export function elementStyleToPreviewCss(st: ElementStyle): CSSProperties {
  const w =
    st.width === "auto" || st.width === "100%"
      ? st.width
      : typeof st.width === "number"
        ? st.width
        : undefined;

  const height =
    st.height === "auto" ? undefined : typeof st.height === "number" ? `${st.height}px` : undefined;

  const br = st.border;
  const borderCss =
    br && br.width > 0 && br.style !== "none"
      ? `${br.width}px ${br.style} ${br.color}`
      : undefined;

  const bs = boxShadowToCss(st.boxShadow);
  const tf = transformToCss(st.transform);
  const fl = filterToCss(st.filter);

  const style: CSSProperties = {
    marginTop: st.marginTop,
    marginBottom: st.marginBottom,
    marginLeft: st.marginLeft,
    marginRight: st.marginRight,
    paddingTop: st.paddingTop,
    paddingBottom: st.paddingBottom,
    paddingLeft: st.paddingLeft,
    paddingRight: st.paddingRight,
    fontSize: st.fontSize,
    fontFamily: st.fontFamily || undefined,
    fontWeight: st.fontWeight,
    fontStyle: st.fontStyle === "italic" ? "italic" : undefined,
    lineHeight: st.lineHeight,
    letterSpacing: st.letterSpacing !== 0 ? `${st.letterSpacing}px` : undefined,
    color: st.color || undefined,
    textAlign: st.textAlign,
    textDecoration: st.textDecoration !== "none" ? st.textDecoration : undefined,
    textTransform: st.textTransform !== "none" ? st.textTransform : undefined,
    maxWidth: st.maxWidth > 0 ? st.maxWidth : undefined,
    minWidth: st.minWidth > 0 ? st.minWidth : undefined,
    width: w as CSSProperties["width"],
    height,
    opacity: st.opacity < 1 ? st.opacity : undefined,
    alignSelf: st.alignSelf,
    backgroundColor: st.backgroundColor && st.backgroundColor !== "transparent" ? st.backgroundColor : undefined,
    borderRadius: typeof st.borderRadius === "number" ? st.borderRadius : undefined,
    position: st.position !== "relative" ? st.position : undefined,
    zIndex: st.zIndex !== 1 ? st.zIndex : undefined,
    overflow: st.overflow !== "visible" ? st.overflow : undefined,
    cursor: st.cursor !== "default" ? st.cursor : undefined,
    border: borderCss,
    boxShadow: bs,
    transform: tf,
    filter: fl,
  };

  if (st.textShadow && st.textShadow.trim()) {
    style.textShadow = st.textShadow;
  }

  return style;
}
