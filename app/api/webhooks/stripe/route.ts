import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type Stripe from "stripe";

import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/server";

export const dynamic = "force-dynamic";

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
    const workspaceId =
      session.metadata?.workspace_id ?? session.client_reference_id ?? undefined;
    if (workspaceId) {
      await admin
        .from("workspaces")
        .update({
          plan: "creator",
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
  }

  return NextResponse.json({ received: true });
}
