export type CheckoutContentConfig = {
  price_cents: number;
  currency: string;
  product_name: string;
  button_label: string;
};

const DEFAULT: Omit<CheckoutContentConfig, "price_cents" | "product_name"> = {
  currency: "eur",
  button_label: "Payer",
};

export function parseCheckoutContent(
  content: unknown
): CheckoutContentConfig | null {
  if (!content || typeof content !== "object" || Array.isArray(content)) {
    return null;
  }
  const raw = (content as { checkout?: unknown }).checkout;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return null;
  }
  const c = raw as Record<string, unknown>;
  const priceCents = Number(c.price_cents);
  if (!Number.isFinite(priceCents) || priceCents < 50) {
    return null;
  }
  const currency =
    typeof c.currency === "string" && c.currency.trim() !== ""
      ? c.currency.trim().toLowerCase()
      : DEFAULT.currency;
  const productName =
    typeof c.product_name === "string" && c.product_name.trim() !== ""
      ? c.product_name.trim()
      : "Produit";
  const buttonLabel =
    typeof c.button_label === "string" && c.button_label.trim() !== ""
      ? c.button_label.trim()
      : DEFAULT.button_label;

  return {
    price_cents: Math.round(priceCents),
    currency,
    product_name: productName,
    button_label: buttonLabel,
  };
}
