/**
 * Montant « unité majeure » (ex. euros) depuis amount_total Stripe Checkout.
 * Voir https://docs.stripe.com/currencies#zero-decimal
 */
const ZERO_DECIMAL = new Set([
  "bif",
  "clp",
  "djf",
  "gnf",
  "jpy",
  "kmf",
  "krw",
  "mga",
  "pyg",
  "rwf",
  "ugx",
  "vnd",
  "vuv",
  "xaf",
  "xof",
  "xpf",
]);

export function checkoutAmountTotalToMajorUnits(
  amountTotal: number | null,
  currency: string | null | undefined
): number | null {
  if (amountTotal == null || !Number.isFinite(amountTotal)) return null;
  const c = (currency ?? "eur").toLowerCase();
  return ZERO_DECIMAL.has(c) ? amountTotal : amountTotal / 100;
}
