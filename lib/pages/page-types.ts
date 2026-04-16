/**
 * Types de page CRÉO (colonne `pages.type`) — l’éditeur est piloté par le type.
 */

export type DbPageType =
  | "landing"
  | "sales"
  | "optin"
  | "thankyou"
  | "checkout"
  | "custom"
  | "upsell"
  | "webinar"
  | "blog"
  | "membership";

export type PageTypeUiEntry = {
  /** Clé passée à createPageServer */
  createKey: string;
  dbType: DbPageType;
  label: string;
  description: string;
};

/** Écran « nouvelle page » — ordre = parcours utilisateur fréquent */
export const PAGE_TYPE_CHOICES: PageTypeUiEntry[] = [
  {
    createKey: "landing",
    dbType: "landing",
    label: "Landing (opt-in)",
    description: "Capturer des emails, lead magnet, sans distraction.",
  },
  {
    createKey: "sales",
    dbType: "sales",
    label: "Page de vente",
    description: "Long-form pour vendre une offre, lien vers checkout.",
  },
  {
    createKey: "checkout",
    dbType: "checkout",
    description: "Paiement Stripe / PayPal, tunnel de confiance minimal.",
    label: "Checkout",
  },
  {
    createKey: "upsell",
    dbType: "upsell",
    label: "Upsell / Downsell",
    description: "Offre one-click après achat (oui / non).",
  },
  {
    createKey: "thankyou",
    dbType: "thankyou",
    label: "Page merci",
    description: "Confirmation, accès, prochaine étape.",
  },
  {
    createKey: "webinar",
    dbType: "webinar",
    label: "Webinaire",
    description: "Inscription live ou evergreen, rappels email.",
  },
  {
    createKey: "blog",
    dbType: "blog",
    label: "Article de blog",
    description: "SEO, contenu riche, table des matières.",
  },
  {
    createKey: "membership",
    dbType: "membership",
    label: "Accès cours / membre",
    description: "Leçons, progression, contenu réservé.",
  },
  {
    createKey: "custom",
    dbType: "custom",
    label: "Page libre",
    description: "Blocs texte simples — brouillon ou usage avancé.",
  },
];

export const PAGE_TYPE_LABELS: Record<string, string> = {
  landing: "Landing",
  sales: "Vente",
  optin: "Opt-in",
  thankyou: "Merci",
  checkout: "Checkout",
  custom: "Libre",
  upsell: "Upsell",
  webinar: "Webinaire",
  blog: "Blog",
  membership: "Cours / membre",
};

export function isDbPageType(v: string): v is DbPageType {
  return (
    v === "landing" ||
    v === "sales" ||
    v === "optin" ||
    v === "thankyou" ||
    v === "checkout" ||
    v === "custom" ||
    v === "upsell" ||
    v === "webinar" ||
    v === "blog" ||
    v === "membership"
  );
}
