import { defaultEmailGlobals } from "@/lib/email-editor/types";

/** Enveloppe le HTML de composition (fragment) dans le gabarit e-mail classique CRÉO. */
export function wrapRichEmailHtml(bodyHtml: string): string {
  const g = defaultEmailGlobals();
  const inner = `<tr><td style="background:${g.contentBg};border-radius:12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;"><tr><td valign="top" style="width:100%;padding:12px 16px;font-size:15px;line-height:1.5;color:#374151;font-family:${g.fontFamily};"><div data-creo-rich-body="1" style="word-wrap:break-word;">${bodyHtml}</div></td></tr></table></td></tr>`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:${g.paddingPx}px;background:${g.bodyBg};font-family:${g.fontFamily};"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;"><tr><td align="center"><table role="presentation" width="${g.maxWidthPx}" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:${g.maxWidthPx}px;">${inner}</table></td></tr></table></body></html>`;
}

/** Récupère le fragment éditable depuis un HTML complet sauvegardé (côté client uniquement). */
export function extractRichBodyFromSavedHtml(fullHtml: string): string | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(fullHtml, "text/html");
    const el = doc.querySelector("[data-creo-rich-body]");
    return el ? el.innerHTML : null;
  } catch {
    return null;
  }
}
