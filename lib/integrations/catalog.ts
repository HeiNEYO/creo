/**
 * Catalogue des intégrations affichées dans le dashboard (hub + pages détail).
 */

export const INTEGRATION_IDS = [
  "webhook",
  "meta-pixel",
  "stripe",
  "zapier",
  "google-calendar",
  "calendly",
  "zoom",
  "slack",
  "gtm",
  "iclosed",
] as const;

export type IntegrationCatalogId = (typeof INTEGRATION_IDS)[number];

export type IntegrationCatalogEntry = {
  id: IntegrationCatalogId;
  label: string;
  shortDescription: string;
  /** Texte long sur la page détail. */
  detailDescription: string;
  /** Nécessite un plan plateforme payant (Creator+) quand le garde-fou est actif. */
  requiresPaidPlan: boolean;
  /** Pas encore disponible : page détail informative uniquement. */
  comingSoon: boolean;
  /** Lien documentation / centre d’aide (icône livre). */
  helpHref: string;
};

const HELP_BASE = "/aides";

export const integrationCatalog: IntegrationCatalogEntry[] = [
  {
    id: "webhook",
    label: "Webhook sortant",
    shortDescription:
      "Envoie des événements CRÉO vers ton URL HTTPS pour brancher Zapier, Make ou ton backend.",
    detailDescription:
      "Déclenche des flux externes dès qu’un événement est émis (ex. événement de test). Idéal pour synchroniser ton CRM ou notifier un outil interne.",
    requiresPaidPlan: false,
    comingSoon: false,
    helpHref: HELP_BASE,
  },
  {
    id: "meta-pixel",
    label: "Meta Pixel",
    shortDescription:
      "Mesure les conversions sur tes pages publiques lorsque le visiteur accepte les cookies marketing.",
    detailDescription:
      "Le pixel Meta se charge sur les pages publiques uniquement après consentement cookies. Utile pour le reporting publicitaire tout en respectant le bandeau RGPD.",
    requiresPaidPlan: false,
    comingSoon: false,
    helpHref: HELP_BASE,
  },
  {
    id: "stripe",
    label: "Stripe",
    shortDescription:
      "Encaisse tes ventes sur ton compte Stripe (Connect) depuis tes pages et offres.",
    detailDescription:
      "Connecte Stripe pour synchroniser les paiements et proposer un checkout fiable sur tes pages CRÉO, avec attribution et suivi des revenus.",
    requiresPaidPlan: true,
    comingSoon: false,
    helpHref: HELP_BASE,
  },
  {
    id: "zapier",
    label: "Zapier",
    shortDescription:
      "Automatise des milliers d’apps à partir des événements CRÉO (bientôt).",
    detailDescription:
      "Relie CRÉO à Slack, Google Sheets, Notion et plus sans code.",
    requiresPaidPlan: false,
    comingSoon: true,
    helpHref: HELP_BASE,
  },
  {
    id: "google-calendar",
    label: "Google Agenda",
    shortDescription:
      "Synchronise disponibilités et rendez-vous avec ton calendrier (bientôt).",
    detailDescription:
      "Propose des créneaux et évite les doublons grâce à Google Agenda.",
    requiresPaidPlan: false,
    comingSoon: true,
    helpHref: HELP_BASE,
  },
  {
    id: "calendly",
    label: "Calendly",
    shortDescription:
      "Intègre la prise de rendez-vous Calendly à ton parcours (bientôt).",
    detailDescription:
      "Redirige tes contacts vers un flux Calendly fluide après une page ou un formulaire.",
    requiresPaidPlan: false,
    comingSoon: true,
    helpHref: HELP_BASE,
  },
  {
    id: "zoom",
    label: "Zoom",
    shortDescription:
      "Utilise Zoom comme lieu de réunion pour tes événements (bientôt).",
    detailDescription:
      "Génère des liens de visio Zoom automatiquement après réservation.",
    requiresPaidPlan: false,
    comingSoon: true,
    helpHref: HELP_BASE,
  },
  {
    id: "slack",
    label: "Slack",
    shortDescription:
      "Notifications d’équipe et alertes dans un canal Slack (bientôt).",
    detailDescription:
      "Envoie les événements importants dans le canal de ton choix.",
    requiresPaidPlan: false,
    comingSoon: true,
    helpHref: HELP_BASE,
  },
  {
    id: "gtm",
    label: "Google Tag Manager",
    shortDescription:
      "Déploie GTM sur tes pages publiques avec contrôle du consentement (bientôt).",
    detailDescription:
      "Centralise tags et déclencheurs marketing tout en restant aligné avec le bandeau cookies.",
    requiresPaidPlan: false,
    comingSoon: true,
    helpHref: HELP_BASE,
  },
  {
    id: "iclosed",
    label: "iClosed",
    shortDescription:
      "Synchronise contacts, rendez-vous et pipeline avec ton CRM iClosed (bientôt).",
    detailDescription:
      "Branche CRÉO sur iClosed pour faire remonter leads, réservations et statuts commerciaux sans ressaisie manuelle.",
    requiresPaidPlan: false,
    comingSoon: true,
    helpHref: HELP_BASE,
  },
];

export function getIntegrationCatalogEntry(
  id: string
): IntegrationCatalogEntry | undefined {
  return integrationCatalog.find((e) => e.id === id);
}

export function isIntegrationCatalogId(id: string): id is IntegrationCatalogId {
  return INTEGRATION_IDS.includes(id as IntegrationCatalogId);
}
