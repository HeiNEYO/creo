-- Ventes via pages checkout publiques (Stripe Connect) : type de produit « page » + idempotence webhook.

ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_product_type_check;

ALTER TABLE public.orders ADD CONSTRAINT orders_product_type_check CHECK (
  product_type IN ('course', 'membership', 'page')
);

CREATE UNIQUE INDEX IF NOT EXISTS orders_stripe_payment_intent_id_unique
  ON public.orders (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;
