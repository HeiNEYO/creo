/**
 * URLs de retour après onboarding Stripe Connect (Express) ou messages OAuth.
 * `payment-gateways` = onglet Paramètres → Passerelles de paiement (style Systeme.io).
 */
export type StripeConnectReturnContext = "integrations" | "payment-gateways";

export function stripeConnectReturnUrls(appUrl: string, ctx: StripeConnectReturnContext) {
  const base = appUrl.replace(/\/$/, "");
  if (ctx === "payment-gateways") {
    const u = `${base}/dashboard/settings?section=payment-gateways`;
    return {
      refresh_url: `${u}&stripe_connect=refresh`,
      return_url: `${u}&stripe_connect=return`,
    };
  }
  return {
    refresh_url: `${base}/dashboard/integrations?stripe_connect=refresh`,
    return_url: `${base}/dashboard/integrations?stripe_connect=return`,
  };
}
