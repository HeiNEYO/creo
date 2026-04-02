import { NextResponse } from "next/server";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export async function POST() {
  const stripe = getStripe();
  const priceId = process.env.STRIPE_PRICE_CREATOR?.trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");

  if (!stripe || !priceId || !appUrl) {
    return NextResponse.json(
      { error: "Stripe ou prix non configuré (STRIPE_SECRET_KEY, STRIPE_PRICE_CREATOR, NEXT_PUBLIC_APP_URL)." },
      { status: 503 }
    );
  }

  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user?.email) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return NextResponse.json({ error: "Aucun workspace." }, { status: 400 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/dashboard/integrations?stripe=success`,
    cancel_url: `${appUrl}/dashboard/integrations?stripe=cancel`,
    customer_email: user.email,
    client_reference_id: workspaceId,
    metadata: { workspace_id: workspaceId },
    subscription_data: {
      metadata: { workspace_id: workspaceId },
    },
  });

  if (!session.url) {
    return NextResponse.json({ error: "Session Stripe sans URL." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
