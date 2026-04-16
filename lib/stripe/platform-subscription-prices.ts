/**
 * Abonnement plateforme CRÉO (workspace.plan : creator | pro | agency).
 * Montants TTC affichés en € — à refléter dans Stripe (Produits → Prix, EUR).
 */

export const PLATFORM_SUBSCRIPTION_EUR_MONTHLY = {
  creator: 27,
  pro: 57,
  agency: 97,
} as const;

/** Prix annuels fixes (€ TTC) — à refléter dans Stripe pour les tarifs yearly. */
export const PLATFORM_SUBSCRIPTION_EUR_ANNUAL = {
  creator: 260,
  pro: 550,
  agency: 930,
} as const;

export type PlatformSubscriptionPlanKey = keyof typeof PLATFORM_SUBSCRIPTION_EUR_MONTHLY;

export type PlatformSubscriptionInterval = "month" | "year";

/** Prix annuel affiché / facturé (montants fixes). */
export function platformSubscriptionAnnualEurMajor(
  plan: PlatformSubscriptionPlanKey
): number {
  return PLATFORM_SUBSCRIPTION_EUR_ANNUAL[plan];
}

/** Équivalent mensuel dérivé du prix annuel (arrondi au dixième). */
export function platformSubscriptionAnnualToMonthlyEurMajor(
  annualEurMajor: number
): number {
  return Math.round((annualEurMajor / 12) * 10) / 10;
}

const ENV_KEYS: Record<
  PlatformSubscriptionPlanKey,
  Record<PlatformSubscriptionInterval, string>
> = {
  creator: {
    month: "STRIPE_PRICE_CREATOR_MONTHLY",
    year: "STRIPE_PRICE_CREATOR_YEARLY",
  },
  pro: {
    month: "STRIPE_PRICE_PRO_MONTHLY",
    year: "STRIPE_PRICE_PRO_YEARLY",
  },
  agency: {
    month: "STRIPE_PRICE_AGENCY_MONTHLY",
    year: "STRIPE_PRICE_AGENCY_YEARLY",
  },
};

/**
 * Lecture explicite de chaque variable (pas `process.env[clé]`).
 * Sinon Next.js / le bundler peut ne pas injecter les valeurs en prod (Vercel).
 */
function readEnvPriceId(key: string): string | undefined {
  const v = (() => {
    switch (key) {
      case "STRIPE_PRICE_CREATOR_MONTHLY":
        return process.env.STRIPE_PRICE_CREATOR_MONTHLY?.trim();
      case "STRIPE_PRICE_CREATOR_YEARLY":
        return process.env.STRIPE_PRICE_CREATOR_YEARLY?.trim();
      case "STRIPE_PRICE_PRO_MONTHLY":
        return process.env.STRIPE_PRICE_PRO_MONTHLY?.trim();
      case "STRIPE_PRICE_PRO_YEARLY":
        return process.env.STRIPE_PRICE_PRO_YEARLY?.trim();
      case "STRIPE_PRICE_AGENCY_MONTHLY":
        return process.env.STRIPE_PRICE_AGENCY_MONTHLY?.trim();
      case "STRIPE_PRICE_AGENCY_YEARLY":
        return process.env.STRIPE_PRICE_AGENCY_YEARLY?.trim();
      case "STRIPE_PRICE_CREATOR":
        return process.env.STRIPE_PRICE_CREATOR?.trim();
      default:
        return undefined;
    }
  })();
  return v || undefined;
}

/** ID Stripe du prix (price_…) pour ce palier et cette période. */
export function getPlatformSubscriptionPriceId(
  plan: PlatformSubscriptionPlanKey,
  interval: PlatformSubscriptionInterval
): string | undefined {
  const key = ENV_KEYS[plan][interval];
  let id = readEnvPriceId(key);
  if (!id && plan === "creator" && interval === "month") {
    id = readEnvPriceId("STRIPE_PRICE_CREATOR");
  }
  return id;
}

/** Carte price_id → plan (pour webhooks). */
export function platformSubscriptionPriceIdToPlan(): Record<
  string,
  PlatformSubscriptionPlanKey
> {
  const map: Record<string, PlatformSubscriptionPlanKey> = {};
  for (const plan of Object.keys(PLATFORM_SUBSCRIPTION_EUR_MONTHLY) as PlatformSubscriptionPlanKey[]) {
    for (const interval of ["month", "year"] as PlatformSubscriptionInterval[]) {
      const id = getPlatformSubscriptionPriceId(plan, interval);
      if (id) map[id] = plan;
    }
  }
  return map;
}

const ALL_PLATFORM_STRIPE_ENV_KEYS: string[] = (
  Object.values(ENV_KEYS) as { month: string; year: string }[]
).flatMap((k) => [k.month, k.year]);

/** Variables STRIPE_PRICE_* absentes ou vides (diagnostic Vercel / .env). */
export function missingPlatformStripePriceEnvKeys(): string[] {
  const missing: string[] = [];
  for (const key of ALL_PLATFORM_STRIPE_ENV_KEYS) {
    const v = readEnvPriceId(key);
    if (v) continue;
    if (key === "STRIPE_PRICE_CREATOR_MONTHLY" && readEnvPriceId("STRIPE_PRICE_CREATOR")) {
      continue;
    }
    missing.push(key);
  }
  return missing;
}

/** Au moins un checkout plateforme possible (ancien seul prix Creator ou grille complète). */
export function isPlatformSubscriptionStripeConfigured(): boolean {
  return missingPlatformStripePriceEnvKeys().length === 0;
}
