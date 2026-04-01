import Stripe from "stripe";

/** Instance Stripe côté serveur uniquement (clé secrète). */
export function getStripe(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY doit être défini.");
  }
  return new Stripe(secretKey);
}
