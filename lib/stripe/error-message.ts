/** Message lisible pour une erreur Stripe ou inconnue (routes API). */
export function stripeOrUnknownMessage(err: unknown): string {
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string" && m.trim()) {
      return m.trim();
    }
  }
  if (err instanceof Error && err.message) {
    return err.message;
  }
  return "Erreur inconnue";
}

/**
 * Le compte Stripe de la plateforme (STRIPE_SECRET_KEY) n’a pas activé Connect
 * (erreur typique au premier `accounts.create`).
 */
export function isStripeConnectDisabledOnPlatformAccount(err: unknown): boolean {
  const m = stripeOrUnknownMessage(err).toLowerCase();
  return (
    m.includes("signed up for connect") ||
    m.includes("only create new accounts if you've signed up for connect")
  );
}

/**
 * Message utilisateur + ce que l’admin de la plateforme doit faire (dashboard Stripe du compte des clés API).
 */
export function stripeConnectPlatformNotReadyMessage(): string {
  return (
    "Stripe Connect n’est pas encore activé sur le compte Stripe de l’application (celui lié à STRIPE_SECRET_KEY sur le serveur). " +
    "Ouvre https://dashboard.stripe.com/connect , clique sur « Commencer » / « Get started » pour activer Connect en mode test ou live selon ta clé, complète la fiche « plateforme », puis réessaie « Lier mon compte Stripe ». " +
    "Sans cette étape côté propriétaire du compte Stripe, aucun utilisateur ne peut lier son compte vendeur."
  );
}
