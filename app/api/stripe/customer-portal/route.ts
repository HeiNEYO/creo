import { NextResponse } from "next/server";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { stripeOrUnknownMessage } from "@/lib/stripe/error-message";
import { getStripe } from "@/lib/stripe/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

/**
 * Portail Stripe Billing : factures, carte bancaire, résiliation d’abonnement plateforme.
 */
export async function POST() {
  try {
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");
    if (!stripe || !appUrl) {
      return NextResponse.json(
        { error: "Stripe ou NEXT_PUBLIC_APP_URL non configuré." },
        { status: 503 }
      );
    }

    const supabase = createRouteHandlerClient();
    const user = await readAuthUser(supabase);
    if (!user) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
    if (!workspaceId) {
      return NextResponse.json({ error: "Aucun workspace." }, { status: 400 });
    }

    const { data: ws, error } = await supabase
      .from("workspaces")
      .select("stripe_customer_id")
      .eq("id", workspaceId)
      .maybeSingle();

    if (error || !ws?.stripe_customer_id?.trim()) {
      return NextResponse.json(
        {
          error:
            "Aucun client Stripe lié à ce workspace. Souscris depuis Paramètres → Abonnement CRÉO (checkout) pour lier un abonnement plateforme.",
        },
        { status: 400 }
      );
    }

    try {
      const session = await stripe.billingPortal.sessions.create({
        customer: ws.stripe_customer_id.trim(),
        return_url: `${appUrl}/dashboard/settings?section=subscription-creo`,
      });
      if (!session.url) {
        return NextResponse.json({ error: "Portail Stripe sans URL." }, { status: 500 });
      }
      return NextResponse.json({ url: session.url });
    } catch (err: unknown) {
      return NextResponse.json(
        { error: `Stripe : ${stripeOrUnknownMessage(err)}` },
        { status: 502 }
      );
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur serveur.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
