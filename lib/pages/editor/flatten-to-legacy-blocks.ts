import type { EditorElement, PageDocument } from "@/lib/pages/editor/page-document.types";
import type { PageBlock } from "@/lib/pages/page-block-types";

function omitButtonContentKeys(c: Record<string, unknown>): Record<string, unknown> {
  const rest = { ...c };
  delete rest.label;
  delete rest.action;
  delete rest.url;
  delete rest.newTab;
  return rest;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function attachElementStyle(el: EditorElement, data: Record<string, unknown>): Record<string, unknown> {
  return { ...data, elementStyle: el.style };
}

export function elementToPageBlock(el: EditorElement): PageBlock {
  const c = el.content as Record<string, unknown>;
  if (el.type === "heading") {
    return {
      id: el.id,
      type: "heading",
      text: typeof c.text === "string" ? c.text : "",
      data: attachElementStyle(el, { tag: c.tag }),
    };
  }
  if (el.type === "text" || el.type === "richtext") {
    const html = typeof c.html === "string" ? c.html : "";
    return {
      id: el.id,
      type: "paragraph",
      text: html.replace(/<[^>]+>/g, "").trim() || " ",
      data: attachElementStyle(el, { html }),
    };
  }
  if (el.type === "list") {
    const raw = Array.isArray(c.items) ? c.items : [];
    const items = raw.map((x) => (typeof x === "string" ? x : String(x))).filter((t) => t.trim().length > 0);
    const lis = (items.length ? items : ["Élément"]).map((t) => `<li>${escapeHtml(t)}</li>`).join("");
    const html = `<ul class="list-disc pl-6">${lis}</ul>`;
    return {
      id: el.id,
      type: "paragraph",
      text: " ",
      data: attachElementStyle(el, { html }),
    };
  }
  if (el.type === "link") {
    const label = typeof c.label === "string" ? c.label : "Lien";
    const url = typeof c.url === "string" && c.url.trim() ? c.url : "#";
    const newTab = c.newTab === true;
    const html = `<p><a href="${escapeAttr(url)}"${newTab ? ' target="_blank" rel="noopener noreferrer"' : ""}>${escapeHtml(label)}</a></p>`;
    return {
      id: el.id,
      type: "paragraph",
      text: " ",
      data: attachElementStyle(el, { html }),
    };
  }
  if (el.type === "contentbox") {
    return {
      id: el.id,
      type: "hero",
      text: "",
      data: attachElementStyle(el, {
        headline: typeof c.headline === "string" ? c.headline : "",
        subheadline: typeof c.body === "string" ? c.body : "",
        backgroundColor: typeof c.backgroundColor === "string" ? c.backgroundColor : "#fafafa",
      }),
    };
  }
  if (el.type === "image") {
    return {
      id: el.id,
      type: "image",
      text: "",
      data: attachElementStyle(el, {
        src: typeof c.src === "string" ? c.src : "",
        alt: typeof c.alt === "string" ? c.alt : "",
        objectFit: typeof c.objectFit === "string" ? c.objectFit : "cover",
      }),
    };
  }
  if (el.type === "video") {
    return {
      id: el.id,
      type: "video_embed",
      text: "",
      data: attachElementStyle(el, {
        url: typeof c.url === "string" ? c.url : "",
        provider: typeof c.provider === "string" ? c.provider : "youtube",
      }),
    };
  }
  if (el.type === "button") {
    const label = typeof c.label === "string" ? c.label : "Bouton";
    const rest = omitButtonContentKeys(c);
    return {
      id: el.id,
      type: "button",
      text: label,
      data: attachElementStyle(el, {
        url: typeof c.url === "string" ? c.url : "",
        action: typeof c.action === "string" ? c.action : "url",
        newTab: c.newTab === true,
        ...rest,
      }),
    };
  }
  if (el.type === "countdown") {
    return {
      id: el.id,
      type: "countdown",
      text: "",
      data: attachElementStyle(el, {
        endAt: typeof c.endAt === "string" ? c.endAt : "",
        mode: typeof c.mode === "string" ? c.mode : "fixed",
      }),
    };
  }
  if (el.type === "optin") {
    return {
      id: el.id,
      type: "optin_form",
      text: typeof c.intro === "string" ? c.intro : "",
      data: attachElementStyle(el, {
        buttonLabel: typeof c.buttonLabel === "string" ? c.buttonLabel : "S'inscrire",
        gdpr: typeof c.gdpr === "string" ? c.gdpr : "optional",
      }),
    };
  }
  if (el.type === "faq") {
    return {
      id: el.id,
      type: "faq",
      text: "",
      data: attachElementStyle(el, { items: Array.isArray(c.items) ? c.items : [] }),
    };
  }
  if (el.type === "divider") {
    return {
      id: el.id,
      type: "divider",
      text: "",
      data: attachElementStyle(el, { style: c.style }),
    };
  }
  return {
    id: el.id,
    type:
      el.type === "ordersummary"
        ? "order_summary"
        : el.type === "paymentform"
          ? "payment_stripe"
          : el.type,
    text: typeof c.text === "string" ? c.text : "",
    data: attachElementStyle(el, { ...c }),
  };
}

/** Compat : alimente `content.blocks` pour le rendu public tant que le moteur JSON complet n’est pas branché. */
export function flattenDocumentToLegacyBlocks(doc: PageDocument): PageBlock[] {
  const out: PageBlock[] = [];
  for (const sec of doc.sections) {
    for (const row of sec.rows) {
      for (const col of row.columns) {
        for (const el of col.elements) {
          out.push(elementToPageBlock(el));
        }
      }
    }
  }
  return out;
}
