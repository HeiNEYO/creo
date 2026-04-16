/**
 * Registre des blocs : palette par type de page + factory par `blockType`.
 * Pour ajouter un bloc : déclarer ici + aperçu public + inspecteur builder.
 */

import type { PageBlock } from "@/lib/pages/page-block-types";

export type PaletteItem = {
  id: string;
  label: string;
  blockType: string;
  group: string;
};

function newId(): string {
  if (typeof globalThis !== "undefined" && globalThis.crypto?.randomUUID) {
    return `blk-${globalThis.crypto.randomUUID()}`;
  }
  return `blk-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Définition minimale pour la palette et les libellés */
const PALETTE: PaletteItem[] = [
  // Texte générique (page libre, compat)
  {
    id: "p-heading",
    group: "Texte",
    label: "Titre H1",
    blockType: "heading",
  },
  { id: "p-h2", group: "Texte", label: "Titre H2", blockType: "h2" },
  { id: "p-paragraph", group: "Texte", label: "Paragraphe", blockType: "paragraph" },
  { id: "p-quote", group: "Texte", label: "Citation", blockType: "quote" },
  { id: "p-divider", group: "Structure", label: "Séparateur", blockType: "divider" },

  // Landing
  { id: "b-hero", group: "Structure", label: "Hero", blockType: "hero" },
  { id: "b-optin", group: "Formulaires", label: "Formulaire opt-in", blockType: "optin_form" },
  { id: "b-features", group: "Contenu", label: "Fonctionnalités", blockType: "features" },
  { id: "b-testimonials", group: "Confiance", label: "Témoignages", blockType: "testimonials" },
  { id: "b-social", group: "Confiance", label: "Preuve sociale", blockType: "social_proof" },
  { id: "b-faq", group: "Contenu", label: "FAQ", blockType: "faq" },
  { id: "b-countdown", group: "Urgence", label: "Compte à rebours", blockType: "countdown" },
  { id: "b-exit", group: "Urgence", label: "Popup sortie", blockType: "exit_popup" },
  { id: "b-footer", group: "Structure", label: "Pied légal", blockType: "footer_legal" },

  // Vente
  { id: "b-video", group: "Médias", label: "Vidéo", blockType: "video_embed" },
  { id: "b-price", group: "Conversion", label: "Prix + CTA", blockType: "price_cta" },
  { id: "b-guarantee", group: "Confiance", label: "Garantie", blockType: "guarantee_section" },
  { id: "b-bonus", group: "Conversion", label: "Bonus", blockType: "bonus_section" },
  { id: "b-sticky", group: "Conversion", label: "Barre CTA sticky", blockType: "sticky_cta_bar" },

  // Checkout
  { id: "c-order", group: "Tunnel", label: "Récapitulatif commande", blockType: "order_summary" },
  { id: "c-customer", group: "Tunnel", label: "Infos client", blockType: "customer_info" },
  { id: "c-pay", group: "Tunnel", label: "Paiement", blockType: "payment_stripe" },
  { id: "c-bump", group: "Tunnel", label: "Order bump", blockType: "order_bump" },
  { id: "c-trust", group: "Confiance", label: "Badges confiance", blockType: "trust_badges" },
  { id: "c-mini", group: "Confiance", label: "Témoignages mini", blockType: "testimonial_mini" },
  { id: "c-guarantee", group: "Confiance", label: "Garantie", blockType: "guarantee_checkout" },
  { id: "c-legal", group: "Légal", label: "Mentions légales", blockType: "legal_checkout" },
];

const LEGACY_TYPES = new Set([
  "heading",
  "h2",
  "paragraph",
  "quote",
  "divider",
  "text",
]);

const LANDING_TYPES = new Set([
  ...Array.from(LEGACY_TYPES),
  "hero",
  "optin_form",
  "features",
  "testimonials",
  "social_proof",
  "faq",
  "countdown",
  "exit_popup",
  "footer_legal",
]);

const SALES_TYPES = new Set([
  ...Array.from(LANDING_TYPES),
  "video_embed",
  "price_cta",
  "guarantee_section",
  "bonus_section",
  "sticky_cta_bar",
]);

const CHECKOUT_TYPES = new Set([
  "order_summary",
  "customer_info",
  "payment_stripe",
  "order_bump",
  "guarantee_checkout",
  "trust_badges",
  "testimonial_mini",
  "legal_checkout",
]);

const THANKYOU_TYPES = new Set([
  ...Array.from(LEGACY_TYPES),
  "confirmation",
  "access_button",
  "video_embed",
  "share_social",
]);

const UPSELL_TYPES = new Set([
  ...Array.from(LEGACY_TYPES),
  "video_embed",
  "price_readonly",
  "yes_no_actions",
  "countdown",
  "testimonials",
]);

const WEBINAR_TYPES = new Set([
  ...Array.from(LEGACY_TYPES),
  "webinar_hero",
  "registration_form",
  "presenter_bio",
  "learn_bullets",
  "countdown",
]);

const BLOG_TYPES = new Set([
  ...Array.from(LEGACY_TYPES),
  "rich_article",
  "cta_banner",
  "toc_auto",
  "author_bio",
]);

const MEMBERSHIP_TYPES = new Set([
  ...Array.from(LEGACY_TYPES),
  "course_outline",
  "lesson_video",
  "downloads",
  "quiz_block",
  "progress_block",
]);

function allowedTypesForPage(pageType: string): Set<string> | null {
  switch (pageType) {
    case "landing":
    case "optin":
      return LANDING_TYPES;
    case "sales":
      return SALES_TYPES;
    case "checkout":
      return CHECKOUT_TYPES;
    case "thankyou":
      return THANKYOU_TYPES;
    case "upsell":
      return UPSELL_TYPES;
    case "webinar":
      return WEBINAR_TYPES;
    case "blog":
      return BLOG_TYPES;
    case "membership":
      return MEMBERSHIP_TYPES;
    case "custom":
      return LEGACY_TYPES;
    default:
      return LANDING_TYPES;
  }
}

export function getPaletteForPageType(pageType: string): PaletteItem[] {
  const allowed = allowedTypesForPage(pageType);
  if (!allowed) return PALETTE.filter((p) => LEGACY_TYPES.has(p.blockType));
  return PALETTE.filter((p) => allowed.has(p.blockType));
}

export function labelForBlockType(blockType: string): string {
  const hit = PALETTE.find((p) => p.blockType === blockType);
  return hit?.label ?? blockType;
}

/** Blocs non supprimables / non réordonnables sur une page checkout */
export const CHECKOUT_LOCKED_TYPES = new Set([
  "order_summary",
  "customer_info",
  "payment_stripe",
  "legal_checkout",
]);

export function isCheckoutLockedType(blockType: string): boolean {
  return CHECKOUT_LOCKED_TYPES.has(blockType);
}

function defaultDataFor(blockType: string): Record<string, unknown> | undefined {
  switch (blockType) {
    case "hero":
      return {
        headline: "Ta promesse principale",
        subheadline: "Une phrase qui clarifie la valeur pour ton visiteur.",
        background: "color",
        backgroundColor: "#f4f4f5",
      };
    case "optin_form":
      return {
        buttonLabel: "Recevoir",
        firstNameEnabled: true,
        phoneEnabled: false,
        gdpr: "optional",
      };
    case "features":
      return {
        columns: 3,
        items: [
          { title: "Bénéfice 1", text: "Description courte." },
          { title: "Bénéfice 2", text: "Description courte." },
          { title: "Bénéfice 3", text: "Description courte." },
        ],
      };
    case "testimonials":
      return {
        items: [
          { quote: "« Résultat concret en quelques semaines. »", author: "Prénom N." },
        ],
      };
    case "social_proof":
      return { mode: "logos", label: "Ils nous font confiance" };
    case "faq":
      return {
        items: [
          { q: "Question fréquente ?", a: "Réponse claire." },
        ],
      };
    case "countdown":
      return { mode: "fixed", endAt: "" };
    case "exit_popup":
      return { enabled: false, headline: "Attends — dernière chance" };
    case "footer_legal":
      return {
        links: [
          { label: "Mentions légales", href: "#" },
          { label: "Confidentialité", href: "#" },
        ],
      };
    case "video_embed":
      return { url: "", provider: "youtube" };
    case "price_cta":
      return { checkoutPageSlug: "", label: "Acheter maintenant", readOnlyPrice: true };
    case "guarantee_section":
      return { title: "Garantie satisfait ou remboursé", text: "Décris ta garantie." };
    case "bonus_section":
      return {
        title: "Bonus inclus",
        items: [{ title: "Bonus 1", text: "Détail" }],
      };
    case "sticky_cta_bar":
      return { label: "Je passe à l’action", visible: true };
    case "order_summary":
      return { readOnly: true };
    case "customer_info":
      return { locked: true };
    case "payment_stripe":
      return { locked: true };
    case "order_bump":
      return { enabled: false, headline: "Ajoute ceci à ta commande" };
    case "guarantee_checkout":
      return { text: "Paiement sécurisé." };
    case "trust_badges":
      return { showSsl: true, showCards: true };
    case "testimonial_mini":
      return { items: [{ quote: "« Excellent. »", author: "Client" }] };
    case "legal_checkout":
      return { termsUrl: "", refundUrl: "", required: true };
    case "confirmation":
      return { headline: "Merci !", text: "Ta demande est bien enregistrée." };
    case "access_button":
      return { label: "Accéder", href: "#" };
    case "share_social":
      return { networks: ["facebook", "linkedin"] };
    case "price_readonly":
      return { readOnly: true };
    case "yes_no_actions":
      return { yesLabel: "Oui, j’ajoute à ma commande", noLabel: "Non merci" };
    case "webinar_hero":
      return { title: "Webinaire gratuit", datetime: "" };
    case "registration_form":
      return { buttonLabel: "M’inscrire" };
    case "presenter_bio":
      return { name: "Présentateur", bio: "Quelques mots." };
    case "learn_bullets":
      return { items: ["Point 1", "Point 2", "Point 3"] };
    case "rich_article":
      return { html: "<p>Contenu…</p>" };
    case "cta_banner":
      return { text: "Passer à l’action", href: "#" };
    case "toc_auto":
      return { enabled: true };
    case "author_bio":
      return { name: "Auteur", role: "" };
    case "course_outline":
      return { modules: [{ title: "Module 1", lessons: ["Leçon 1"] }] };
    case "lesson_video":
      return { url: "" };
    case "downloads":
      return { files: [{ label: "PDF", url: "#" }] };
    case "quiz_block":
      return { title: "Quiz" };
    case "progress_block":
      return { percent: 0 };
    default:
      return undefined;
  }
}

function defaultTextFor(blockType: string): string {
  if (blockType === "divider") return "";
  if (blockType === "hero") return "";
  if (blockType === "optin_form") return "Inscris-toi pour recevoir la ressource.";
  if (blockType === "paragraph") return "Ton texte ici…";
  if (blockType === "heading") return "Titre principal";
  if (blockType === "h2") return "Sous-titre";
  if (blockType === "quote") return "Une citation marquante.";
  if (LEGACY_TYPES.has(blockType)) return "Texte";
  return "";
}

/** Crée un bloc avec données par défaut selon le registre */
export function createPageBlockFromRegistry(blockType: string): PageBlock {
  const data = defaultDataFor(blockType);
  const text = defaultTextFor(blockType);
  return {
    id: newId(),
    type: blockType,
    ...(text !== "" ? { text } : {}),
    ...(data ? { data } : {}),
  };
}

/** Contenu initial pour une nouvelle page landing */
export function defaultLandingBlocks(): PageBlock[] {
  return [
    createPageBlockFromRegistry("hero"),
    createPageBlockFromRegistry("optin_form"),
    createPageBlockFromRegistry("features"),
  ];
}

/** Gabarit checkout (ordre figé côté produit) */
export function defaultCheckoutBlocks(): PageBlock[] {
  return [
    createPageBlockFromRegistry("order_summary"),
    createPageBlockFromRegistry("customer_info"),
    createPageBlockFromRegistry("payment_stripe"),
    createPageBlockFromRegistry("legal_checkout"),
  ];
}

export function defaultSalesBlocks(): PageBlock[] {
  return [...defaultLandingBlocks(), createPageBlockFromRegistry("price_cta")];
}

export function defaultThankYouBlocks(): PageBlock[] {
  return [
    createPageBlockFromRegistry("confirmation"),
    createPageBlockFromRegistry("access_button"),
  ];
}

export function defaultUpsellBlocks(): PageBlock[] {
  return [
    createPageBlockFromRegistry("heading"),
    createPageBlockFromRegistry("paragraph"),
    createPageBlockFromRegistry("price_readonly"),
    createPageBlockFromRegistry("yes_no_actions"),
  ];
}

export function defaultWebinarBlocks(): PageBlock[] {
  return [
    createPageBlockFromRegistry("webinar_hero"),
    createPageBlockFromRegistry("registration_form"),
    createPageBlockFromRegistry("learn_bullets"),
  ];
}

export function defaultBlogBlocks(): PageBlock[] {
  return [createPageBlockFromRegistry("rich_article")];
}

export function defaultMembershipBlocks(): PageBlock[] {
  return [
    createPageBlockFromRegistry("course_outline"),
    createPageBlockFromRegistry("lesson_video"),
  ];
}

/** Vérifie si le type de page autorise plusieurs opt-in */
export function maxOptinFormsForPageType(pageType: string): number {
  if (pageType === "landing" || pageType === "optin") return 1;
  return 99;
}

export function countBlocksOfType(blocks: PageBlock[], blockType: string): number {
  return blocks.filter((b) => b.type === blockType).length;
}
