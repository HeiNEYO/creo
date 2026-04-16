/**
 * Plan d’abonnement à la plateforme CRÉO (workspace.plan).
 * L’encaissement des clients finaux (Stripe Connect) est indépendant.
 */

/**
 * Quand `false`, tous les garde-fous « Starter vs payant » sont désactivés (Connect, checkout page,
 * export CSV, séquences actives, broadcast). Repasse à `true` pour réappliquer les restrictions.
 */
export const PLATFORM_PLAN_ENFORCEMENT_ENABLED = false;

/** Plans considérés comme abonnement plateforme actif (envoi de masse, etc.). */
const PAID_PLATFORM_PLANS = new Set(["creator", "pro", "agency"]);

export function isPaidPlatformPlan(plan: string | null | undefined): boolean {
  if (!PLATFORM_PLAN_ENFORCEMENT_ENABLED) {
    return true;
  }
  const p = (plan ?? "").trim().toLowerCase();
  return PAID_PLATFORM_PLANS.has(p);
}

export const PLATFORM_UPGRADE_BROADCAST_MESSAGE =
  "L’envoi de masse aux abonnés nécessite un abonnement Creator (ou supérieur). Va dans Paramètres → Abonnement CRÉO pour souscrire.";

export const PLATFORM_UPGRADE_CONNECT_MESSAGE =
  "La liaison Stripe Connect (encaisser tes ventes sur les pages) nécessite un abonnement Creator ou supérieur. Souscris depuis Paramètres → Abonnement CRÉO.";

export const PLATFORM_UPGRADE_EXPORT_MESSAGE =
  "L’export CSV des contacts est réservé aux abonnements Creator, Pro ou Agency.";

export const PLATFORM_UPGRADE_PAGE_CHECKOUT_MESSAGE =
  "Paiement indisponible : le vendeur doit avoir un abonnement plateforme actif (Creator ou supérieur) pour vendre via cette page.";

export const PLATFORM_UPGRADE_SEQUENCE_ACTIVE_MESSAGE =
  "L’activation des séquences d’e-mails automatisées nécessite un abonnement Creator ou supérieur.";
