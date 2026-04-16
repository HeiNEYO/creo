import type Stripe from "stripe";
import type { SupabaseClient } from "@supabase/supabase-js";

import { sendPagePurchaseReceiptEmail } from "@/lib/emails/page-purchase-receipt";
import { checkoutAmountTotalToMajorUnits } from "@/lib/stripe/checkout-amount-major";

/**
 * Paiement one-shot page publique (Connect) : commande + contact + reçu e-mail.
 * Idempotent sur stripe_payment_intent_id.
 */
export async function recordPageCheckoutFromSession(
  admin: SupabaseClient,
  session: Stripe.Checkout.Session,
  appUrl: string
): Promise<void> {
  if (session.mode !== "payment") return;

  const pageId = session.metadata?.page_id?.trim();
  const workspaceId = session.metadata?.workspace_id?.trim();
  if (!pageId || !workspaceId) return;

  const pi =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id ?? null;
  if (!pi) return;

  const { data: existing } = await admin
    .from("orders")
    .select("id")
    .eq("stripe_payment_intent_id", pi)
    .maybeSingle();

  if (existing) return;

  const amountMajor = checkoutAmountTotalToMajorUnits(
    session.amount_total,
    session.currency
  );
  if (amountMajor == null) return;

  const currency = (session.currency ?? "eur").toLowerCase();

  const { data: pageRow } = await admin
    .from("pages")
    .select("title, slug")
    .eq("id", pageId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  const { data: wsRow } = await admin
    .from("workspaces")
    .select("name, slug")
    .eq("id", workspaceId)
    .maybeSingle();

  const productName =
    typeof pageRow?.title === "string" && pageRow.title.trim()
      ? pageRow.title.trim()
      : "Achat";

  const pageSlug = typeof pageRow?.slug === "string" ? pageRow.slug : "page";
  const wsSlug = typeof wsRow?.slug === "string" ? wsRow.slug : "";
  const workspaceName =
    typeof wsRow?.name === "string" && wsRow.name.trim() ? wsRow.name.trim() : "Boutique";

  const base = appUrl.replace(/\/$/, "");
  const publicPageUrl = wsSlug
    ? `${base}/p/${wsSlug}/${pageSlug}`
    : base;

  const emailRaw =
    session.customer_details?.email?.trim() ||
    (typeof session.customer_email === "string" ? session.customer_email.trim() : "") ||
    null;

  let contactId: string | null = null;
  if (emailRaw) {
    const normalized = emailRaw.toLowerCase();
    const { data: found } = await admin
      .from("contacts")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("email", normalized)
      .maybeSingle();

    if (found?.id) {
      contactId = found.id;
    } else {
      const { data: inserted, error: insErr } = await admin
        .from("contacts")
        .insert({
          workspace_id: workspaceId,
          email: normalized,
          source: "stripe_checkout_page",
        })
        .select("id")
        .maybeSingle();

      if (!insErr && inserted?.id) {
        contactId = inserted.id;
      }
    }
  }

  const { error: ordErr } = await admin.from("orders").insert({
    workspace_id: workspaceId,
    contact_id: contactId,
    product_type: "page",
    product_id: pageId,
    amount: amountMajor,
    currency,
    status: "paid",
    stripe_payment_intent_id: pi,
  });

  if (ordErr) {
    if (ordErr.code === "23505") return;
    console.error("recordPageCheckoutFromSession order insert:", ordErr.message);
    return;
  }

  if (emailRaw && process.env.RESEND_API_KEY?.trim() && appUrl) {
    let amountLabel: string;
    try {
      amountLabel = new Intl.NumberFormat("fr-FR", {
        style: "currency",
        currency: currency.toUpperCase(),
      }).format(amountMajor);
    } catch {
      amountLabel = `${amountMajor} ${currency}`;
    }

    void sendPagePurchaseReceiptEmail({
      to: emailRaw,
      productName,
      amountLabel,
      workspaceName,
      publicPageUrl,
    }).catch(() => {});
  }
}
