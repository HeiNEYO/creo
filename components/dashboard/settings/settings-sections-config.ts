/**
 * Sections Paramètres (URL : /dashboard/settings?section=…)
 * Partagé entre le rail latéral et d’éventuels liens profonds.
 */

import type { SettingsSectionId } from "./settings-sections-types";

export type { SettingsSectionId } from "./settings-sections-types";

/** Titre + description du haut de page (remplace l’ancien texte générique « Paramètres »). */
export const SETTINGS_SECTION_META: Record<
  SettingsSectionId,
  { title: string; description: string }
> = {
  general: {
    title: "Workspace",
    description:
      "Nom du workspace et slug utilisé dans les chemins publics (/p/…).",
  },
  "site-brand": {
    title: "Site",
    description: "Favicon et titre affichés sur les pages publiques.",
  },
  "domain-dns": {
    title: "Domaine",
    description: "URLs actuelles et objectif de domaine personnalisé (DNS).",
  },
  "payment-gateways": {
    title: "Paiements",
    description: "Stripe Connect et PayPal pour encaisser tes ventes.",
  },
  "subscription-creo": {
    title: "Vue d’ensemble",
    description:
      "Comparer les offres, voir ton plan actuel et gérer la facturation plateforme.",
  },
  appearance: {
    title: "Apparence",
    description: "Thème clair ou sombre pour l’application.",
  },
  account: {
    title: "Mon compte",
    description: "Photo, nom affiché, e-mail et mot de passe.",
  },
  team: {
    title: "Équipe",
    description: "Invitations en attente et liste des membres.",
  },
  danger: {
    title: "Zone de danger",
    description: "Supprimer définitivement ce workspace.",
  },
};

export function resolveSettingsSectionId(raw: string | undefined): SettingsSectionId {
  if (raw === "payments-sales") return "payment-gateways";
  const allowed = new Set<string>([
    "general",
    "site-brand",
    "domain-dns",
    "payment-gateways",
    "subscription-creo",
    "appearance",
    "account",
    "team",
    "danger",
  ]);
  if (raw && allowed.has(raw)) return raw as SettingsSectionId;
  return "general";
}

export const settingsSectionGroups = [
  {
    title: "Workspace & site",
    items: [
      { id: "general", label: "Général" },
      { id: "site-brand", label: "Site & marque" },
      { id: "domain-dns", label: "Domaine & DNS" },
    ],
  },
  {
    title: "Vente & abonnement",
    items: [
      { id: "payment-gateways", label: "Passerelles de paiement" },
      { id: "subscription-creo", label: "Abonnement CRÉO" },
    ],
  },
  {
    title: "Compte",
    items: [
      { id: "appearance", label: "Apparence" },
      { id: "account", label: "Mon compte" },
      { id: "team", label: "Équipe" },
    ],
  },
  {
    title: "Sécurité",
    items: [{ id: "danger", label: "Zone de danger" }],
  },
] as const;
