import type { EmailDocument } from "@/lib/email-editor/types";

/** Rendu HTML compatible clients mail (tables + styles inline basiques). MVP. */
export function serializeEmailDocumentToHtml(doc: EmailDocument): string {
  const g = doc.globals;
  const inner = doc.sections
    .map((sec) => {
      const colHtml = sec.columns
        .map((col) => {
          const blocks = col.blocks
            .map((b) => {
              const pad = "padding:12px 16px;";
              switch (b.type) {
                case "heading":
                  return `<h2 style="margin:0;font-size:22px;line-height:1.25;color:#111827;font-family:${g.fontFamily};">${escapeHtml(String(b.content.text ?? ""))}</h2>`;
                case "text":
                  return `<p style="margin:0;font-size:15px;line-height:1.5;color:#374151;font-family:${g.fontFamily};">${escapeHtml(String(b.content.text ?? ""))}</p>`;
                case "button":
                  return `<a href="${escapeAttr(String(b.content.url ?? "#"))}" style="display:inline-block;padding:12px 20px;background:#6d28d9;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;font-family:${g.fontFamily};">${escapeHtml(String(b.content.label ?? "CTA"))}</a>`;
                case "image": {
                  const src = String(b.content.src ?? "").trim();
                  if (!src) {
                    return `<div style="${pad}color:#9ca3af;font-size:12px;">[Image — colle une URL HTTPS]</div>`;
                  }
                  const alt = escapeAttr(String(b.content.alt ?? ""));
                  const wp = Number(b.content.widthPx);
                  const w =
                    Number.isFinite(wp) && wp > 0
                      ? `max-width:${Math.min(800, wp)}px;`
                      : "max-width:100%;";
                  return `<img src="${escapeAttr(src)}" alt="${alt}" style="display:block;${w}height:auto;border:0;outline:none;text-decoration:none;margin:0 auto;" />`;
                }
                case "divider":
                  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;" />`;
                case "spacer":
                  return `<div style="height:${Number(b.content.height ?? 24)}px;"></div>`;
                case "bullet_list": {
                  const raw = b.content.items;
                  const items = Array.isArray(raw) ? raw : [];
                  const lis = items
                    .map((item) => `<li style="margin:0 0 8px 0;">${escapeHtml(String(item))}</li>`)
                    .join("");
                  return `<ul style="margin:0;padding-left:20px;font-size:15px;line-height:1.5;color:#374151;font-family:${g.fontFamily};">${lis}</ul>`;
                }
                case "social": {
                  const raw = b.content.links;
                  const links = Array.isArray(raw) ? raw : [];
                  const parts = links
                    .map((l: unknown) => {
                      const link = l as { label?: string; url?: string };
                      return `<a href="${escapeAttr(String(link?.url ?? "#"))}" style="color:#6d28d9;margin-right:12px;text-decoration:underline;">${escapeHtml(String(link?.label ?? "Lien"))}</a>`;
                    })
                    .join(" ");
                  return `<p style="margin:0;font-size:14px;line-height:1.5;font-family:${g.fontFamily};">${parts}</p>`;
                }
                case "signature":
                  return `<p style="margin:0;font-size:15px;line-height:1.5;color:#6b7280;font-style:italic;font-family:${g.fontFamily};">${escapeHtml(String(b.content.text ?? ""))}</p>`;
                case "html":
                  return String(b.content.html ?? "");
                default:
                  return `<div style="${pad}color:#9ca3af;font-size:12px;">[${b.type}]</div>`;
              }
            })
            .join("");
          return `<td valign="top" style="width:100%;">${blocks}</td>`;
        })
        .join("");
      return `<tr><td style="background:${g.contentBg};border-radius:12px;"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;">${colHtml}</table></td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:${g.paddingPx}px;background:${g.bodyBg};font-family:${g.fontFamily};"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;"><tr><td align="center"><table role="presentation" width="${g.maxWidthPx}" cellspacing="0" cellpadding="0" style="border-collapse:collapse;max-width:${g.maxWidthPx}px;">${inner}</table></td></tr></table></body></html>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, "&#39;");
}
