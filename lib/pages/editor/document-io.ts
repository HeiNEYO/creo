import { flattenDocumentToLegacyBlocks } from "@/lib/pages/editor/flatten-to-legacy-blocks";
import {
  createEmptyDocument,
  createEmptySection,
  defaultAnimation,
  defaultElementStyle,
} from "@/lib/pages/editor/defaults";
import { mergeElementStyleFromPayload, stripElementStyleKey } from "@/lib/pages/editor/merge-element-style";
import type { PageDocument, EditorElement, ElementType } from "@/lib/pages/editor/page-document.types";
import type { PageBlock } from "@/lib/pages/page-block-types";
import { blocksFromContent } from "@/lib/pages/page-blocks";

const EDITOR_VERSION = 2;

export type StoredPageContent = {
  editorVersion?: number;
  document?: PageDocument;
  blocks?: unknown[];
  meta?: Record<string, unknown>;
  checkout?: unknown;
  id?: string;
};

function mapLegacyType(t: string): ElementType {
  const m: Record<string, ElementType> = {
    paragraph: "text",
    text: "text",
    heading: "heading",
    h1: "heading",
    h2: "heading",
    quote: "blockquote",
    divider: "divider",
    hero: "contentbox",
    optin_form: "optin",
    features: "contentbox",
    testimonials: "testimonial",
    faq: "faq",
    countdown: "countdown",
    video_embed: "video",
    price_cta: "button",
    order_summary: "ordersummary",
    customer_info: "contentbox",
    payment_stripe: "paymentform",
    legal_checkout: "text",
    confirmation: "heading",
    access_button: "button",
    button: "button",
  };
  return m[t] ?? "text";
}

function legacyBlockToElement(block: PageBlock, idGen: () => string): EditorElement {
  const type = mapLegacyType(block.type);
  const text = typeof block.text === "string" ? block.text : "";
  const data = (
    block.data && typeof block.data === "object" ? { ...(block.data as object) } : {}
  ) as Record<string, unknown>;

  if (type === "heading") {
    const tag =
      typeof data.tag === "string" && /^h[1-6]$/.test(data.tag)
        ? data.tag
        : block.type === "h2"
          ? "h2"
          : block.type === "h1" || block.type === "heading"
            ? "h1"
            : "h2";
    const style = mergeElementStyleFromPayload(
      {
        ...defaultElementStyle(),
        fontSize: tag === "h1" ? 32 : tag === "h2" ? 24 : 20,
        fontWeight: 700,
      },
      data.elementStyle
    );
    stripElementStyleKey(data);
    return {
      id: block.id || idGen(),
      type: "heading",
      content: { text, tag, link: "", ...data },
      style,
      animation: defaultAnimation(),
      interactions: [],
      hiddenOn: [],
      customId: "",
      customClass: "",
      locked: false,
    };
  }

  if (type === "divider") {
    return {
      id: block.id || idGen(),
      type: "divider",
      content: { style: "line" },
      style: defaultElementStyle(),
      animation: defaultAnimation(),
      interactions: [],
      hiddenOn: [],
      customId: "",
      customClass: "",
      locked: false,
    };
  }

  if (type === "button") {
    const d = { ...data } as Record<string, unknown>;
    const label =
      typeof d.label === "string" && d.label.trim()
        ? d.label
        : text.trim()
          ? text
          : "Bouton";
    const style = mergeElementStyleFromPayload(
      {
        ...defaultElementStyle(),
        paddingLeft: 24,
        paddingRight: 24,
        paddingTop: 12,
        paddingBottom: 12,
      },
      d.elementStyle
    );
    stripElementStyleKey(d);
    return {
      id: block.id || idGen(),
      type: "button",
      content: {
        ...d,
        label,
        action: typeof d.action === "string" ? d.action : "url",
        url: typeof d.url === "string" ? d.url : "",
        newTab: d.newTab === true,
      },
      style,
      animation: defaultAnimation(),
      interactions: [],
      hiddenOn: [],
      customId: "",
      customClass: "",
      locked: false,
    };
  }

  const style = mergeElementStyleFromPayload(defaultElementStyle(), data.elementStyle);
  stripElementStyleKey(data);

  return {
    id: block.id || idGen(),
    type,
    content:
      type === "text"
        ? { html: text ? `<p>${text}</p>` : "<p></p>", legacyBlockType: block.type, ...data }
        : { text, legacyBlockType: block.type, ...data },
    style,
    animation: defaultAnimation(),
    interactions: [],
    hiddenOn: [],
    customId: "",
    customClass: "",
    locked: ["payment_stripe", "customer_info", "order_summary"].includes(block.type),
  };
}

export function documentFromPageContent(
  content: unknown,
  opts: { pageId: string; pageTitle: string; pageType: PageDocument["pageType"]; idGen: () => string }
): PageDocument {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return createEmptyDocument(opts.idGen, opts.pageType, opts.pageTitle);
  }

  const c = content as StoredPageContent;

  if (c.editorVersion === EDITOR_VERSION && c.document && typeof c.document === "object") {
    const d = c.document as PageDocument;
    if (Array.isArray(d.sections)) {
      return {
        ...d,
        id: d.id || opts.pageId,
        name: d.name || opts.pageTitle,
        lastSaved: new Date().toISOString(),
      };
    }
  }

  const blocks = blocksFromContent(content);
  if (blocks.length === 0) {
    const doc = createEmptyDocument(opts.idGen, opts.pageType, opts.pageTitle);
    doc.id = opts.pageId;
    return doc;
  }

  const doc = createEmptyDocument(opts.idGen, opts.pageType, opts.pageTitle);
  doc.id = opts.pageId;
  doc.name = opts.pageTitle;
  doc.sections = [createEmptySection(opts.idGen, "Contenu importé (v1)")];
  const section = doc.sections[0];
  if (!section?.rows[0]?.columns[0]) return doc;

  section.rows[0].columns[0].elements = blocks.map((b) => legacyBlockToElement(b, opts.idGen));
  return doc;
}

export function mergeDocumentIntoContent(
  base: Record<string, unknown>,
  document: PageDocument
): Record<string, unknown> {
  const prevMeta =
    base.meta && typeof base.meta === "object" && !Array.isArray(base.meta)
      ? (base.meta as Record<string, unknown>)
      : {};
  return {
    ...base,
    editorVersion: EDITOR_VERSION,
    document: {
      ...document,
      lastSaved: new Date().toISOString(),
    },
    blocks: flattenDocumentToLegacyBlocks(document),
    meta: {
      ...prevMeta,
      seo_title: document.meta.title,
      seo_description: document.meta.description,
    },
  };
}

export { EDITOR_VERSION };
