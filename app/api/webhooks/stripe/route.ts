import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { platformSubscriptionPriceIdToPlan } from "@/lib/stripe/platform-subscription-prices";
import { recordPageCheckoutFromSession } from "@/lib/stripe/record-page-checkout-order";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

type AdminClient = NonNullable<ReturnType<typeof createServiceRoleClient>>;

async function workspaceIdFromSubscription(
  admin: AdminClient,
  sub: Stripe.Subscription
): Promise<string | null> {
  const fromMeta = sub.metadata?.workspace_id?.trim();
  if (fromMeta) return fromMeta;
  const customerId =
    typeof sub.customer === "string" ? sub.customer : sub.customer?.id ?? null;
  if (!customerId) return null;
  const { data } = await admin
    .from("workspaces")
    .select("id")
    .eq("stripe_customer_id", customerId)
    .maybeSingle();
  return data?.id ?? null;
}

function planFromStripeSubscription(sub: Stripe.Subscription): "creator" | "pro" | "agency" {
  const map = platformSubscriptionPriceIdToPlan();
  const priceId = sub.items.data[0]?.price?.id;
  if (priceId && map[priceId]) {
    return map[priceId];
  }
  const meta = sub.metadata?.creo_plan?.trim();
  if (meta === "creator" || meta === "pro" || meta === "agency") {
    return meta;
  }
  return "creator";
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  const admin = createServiceRoleClient();

  if (!stripe || !secret || !admin) {
    return new NextResponse("Configuration webhook manquante.", { status: 500 });
  }

  const body = await req.text();
  const sig = headers().get("stripe-signature");
  if (!sig) {
    return new NextResponse("Signature absente.", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch {
    return new NextResponse("Signature invalide.", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const isSubscription =
      session.mode === "subscription" ||
      (!!session.subscription && session.mode !== "payment");
    const workspaceId =
      session.metadata?.workspace_id ?? session.client_reference_id ?? undefined;
    if (isSubscription && workspaceId && !session.metadata?.page_id) {
      const rawPlan = session.metadata?.creo_plan?.trim();
      const plan =
        rawPlan === "creator" || rawPlan === "pro" || rawPlan === "agency"
          ? rawPlan
          : "creator";
      await admin
        .from("workspaces")
        .update({
          plan,
          stripe_customer_id:
            typeof session.customer === "string"
              ? session.customer
              : session.customer?.id ?? null,
          stripe_subscription_id:
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id ?? null,
        })
        .eq("id", workspaceId);
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "") ?? "";
    await recordPageCheckoutFromSession(admin, session, appUrl);
  }

  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const sub = event.data.object as Stripe.Subscription;
    const workspaceId = await workspaceIdFromSubscription(admin, sub);
    if (workspaceId) {
      if (event.type === "customer.subscription.deleted") {
        await admin
          .from("workspaces")
          .update({ plan: "starter", stripe_subscription_id: null })
          .eq("id", workspaceId);
      } else {
        const paidLike =
          sub.status === "active" ||
          sub.status === "trialing" ||
          sub.status === "past_due";
        const plan = paidLike ? planFromStripeSubscription(sub) : "starter";
        await admin
          .from("workspaces")
          .update({
            plan,
            stripe_subscription_id: paidLike ? sub.id : null,
          })
          .eq("id", workspaceId);
      }
    }
  }

  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    if (account.id) {
      await admin
        .from("workspaces")
        .update({
          stripe_connect_charges_enabled: account.charges_enabled === true,
        })
        .eq("stripe_connect_account_id", account.id);
    }
  }

  return NextResponse.json({ received: true });
}
