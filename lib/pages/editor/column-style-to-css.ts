import type { ColumnStyle } from "@/lib/pages/editor/page-document.types";
import type { CSSProperties } from "react";

/** Styles de colonne pour l’aperçu éditeur (flex column). */
export function columnStyleToPreviewCss(st: ColumnStyle): CSSProperties {
  const [pt, pr, pb, pl] = st.padding;
  const br = st.border;
  const justifyContent =
    st.verticalAlign === "bottom" ? "flex-end" : st.verticalAlign === "center" ? "center" : "flex-start";

  return {
    paddingTop: pt,
    paddingRight: pr,
    paddingBottom: pb,
    paddingLeft: pl,
    backgroundColor: st.backgroundColor && st.backgroundColor !== "transparent" ? st.backgroundColor : undefined,
    backgroundImage: st.backgroundImage?.trim() ? `url(${st.backgroundImage})` : undefined,
    backgroundSize: st.backgroundImage?.trim() ? "cover" : undefined,
    backgroundPosition: st.backgroundImage?.trim() ? "center" : undefined,
    borderRadius: st.borderRadius > 0 ? st.borderRadius : undefined,
    minHeight: st.minHeight > 0 ? st.minHeight : undefined,
    border:
      br.width > 0 && br.style !== "none" ? `${br.width}px ${br.style} ${br.color}` : undefined,
    justifyContent,
  };
}
