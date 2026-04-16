import { emailCrmRoutes } from "@/lib/email-crm/routes";

export type EmailCrmSubnavItem = {
  href: string;
  label: string;
  /** Séparateur vertical avant cet onglet (regroupement type Systeme.io : audience / email / pilotage). */
  sectionStart?: boolean;
};

/** Ordre et libellés alignés sur un parcours type « marketing par email » (audience → envois → analyse). */
export const emailCrmSubnavItems: EmailCrmSubnavItem[] = [
  { href: emailCrmRoutes.home, label: "Vue d'ensemble" },
  { href: emailCrmRoutes.contacts, label: "Contacts", sectionStart: true },
  { href: emailCrmRoutes.tags, label: "Tags" },
  { href: emailCrmRoutes.segments, label: "Segments" },
  { href: emailCrmRoutes.campaigns, label: "Campagnes", sectionStart: true },
  { href: emailCrmRoutes.sequences, label: "Automatisations" },
  { href: emailCrmRoutes.conception, label: "Modèles d'email" },
  { href: emailCrmRoutes.statistics, label: "Statistiques", sectionStart: true },
  { href: emailCrmRoutes.settings, label: "Paramètres" },
];
