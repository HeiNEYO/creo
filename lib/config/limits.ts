/**
 * Plafonds et limites partagés (API, requêtes Supabase).
 * Centraliser ici évite les nombres magiques et facilite l’ajustement sous charge.
 */

/** Palette ⌘K / recherche rapide de pages dans le dashboard. */
export const DASHBOARD_SEARCH_PAGES_LIMIT = 80;

/** Notifications dans l’en-tête du dashboard (layout). */
export const DASHBOARD_NOTIFICATIONS_LIMIT = 20;

/** Fil d’activité cockpit — contacts récents (requête initiale). */
export const COCKPIT_ACTIVITY_CONTACTS_FETCH = 6;

/** Fil d’activité cockpit — événements « vue » (requête initiale). */
export const COCKPIT_ACTIVITY_VIEWS_FETCH = 12;

/** Fil d’activité cockpit — nombre d’items après fusion tri chronologique. */
export const COCKPIT_ACTIVITY_MERGED_LIMIT = 10;

/** Bloc commandes récentes sur le cockpit. */
export const COCKPIT_RECENT_ORDERS_LIMIT = 6;

/** Admin CRÉO — liste des profils (questionnaires). */
export const ADMIN_INTAKE_PROFILES_LIMIT = 500;

/** Liste CRM — pagination contacts (Email & CRM). */
export const CRM_CONTACTS_PAGE_SIZE = 25;

/** Envoi campagne — nombre max de contacts par exécution (protection Resend / quotas). */
export const EMAIL_BROADCAST_MAX_CONTACTS = 100;

/**
 * Plafond optionnel d’e-mails « broadcast » par workspace et par mois civil (UTC).
 * 0 ou absent = illimité (hors plafond par exécution ci-dessus).
 * Variable : EMAIL_MONTHLY_BROADCAST_CAP
 */
export function getEmailMonthlyBroadcastCap(): number {
  const raw = process.env.EMAIL_MONTHLY_BROADCAST_CAP?.trim();
  if (!raw) {
    return 0;
  }
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    return 0;
  }
  return Math.floor(n);
}
