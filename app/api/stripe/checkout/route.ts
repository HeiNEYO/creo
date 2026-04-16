import { NextResponse } from "next/server";

import {
  getPlatformSubscriptionPriceId,
  type PlatformSubscriptionInterval,
  type PlatformSubscriptionPlanKey,
  PLATFORM_SUBSCRIPTION_EUR_MONTHLY,
} from "@/lib/stripe/platform-subscription-prices";
import { stripeOrUnknownMessage } from "@/lib/stripe/error-message";
import { getStripe } from "@/lib/stripe/server";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

function parseBody(body: unknown): {
  plan: PlatformSubscriptionPlanKey;
  interval: PlatformSubscriptionInterval;
} | null {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const o = body as Record<string, unknown>;
  const plan = o.plan;
  const interval = o.interval;
  if (
    plan !== "creator" &&
    plan !== "pro" &&
    plan !== "agency"
  ) {
    return null;
  }
  if (interval !== "month" && interval !== "year") {
    return null;
  }
  return { plan, interval };
}

export async function POST(req: Request) {
  try {
    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");

    let plan: PlatformSubscriptionPlanKey = "creator";
    let interval: PlatformSubscriptionInterval = "month";
    try {
      const json = await req.json();
      const parsed = parseBody(json);
      if (parsed) {
        plan = parsed.plan;
        interval = parsed.interval;
      }
    } catch {
      /* corps vide ou non-JSON → défaut creator + month */
    }

    const priceId = getPlatformSubscriptionPriceId(plan, interval);

    if (!stripe || !priceId || !appUrl) {
      const missing: string[] = [];
      if (!stripe) missing.push("STRIPE_SECRET_KEY");
      if (!priceId) {
        missing.push(
          `prix Stripe pour ${plan} (${interval === "month" ? "mensuel" : "annuel"})`
        );
      }
      if (!appUrl) missing.push("NEXT_PUBLIC_APP_URL");
      return NextResponse.json(
        {
          error: `Côté serveur, il manque : ${missing.join(", ")}. Vérifie les variables STRIPE_PRICE_* sur Vercel (Production), puis redéploie.`,
        },
        { status: 503 }
      );
    }

    if (priceId.startsWith("prod_")) {
      return NextResponse.json(
        {
          error:
            "Le prix doit être un ID de tarif (price_…), pas un ID produit (prod_…). Stripe → Produits → Tarifs → ⋯ sur le prix → « Copier l’ID du prix ».",
        },
        { status: 400 }
      );
    }

    const supabase = createRouteHandlerClient();
    const user = await readAuthUser(supabase);
    if (!user?.email) {
      return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
    }

    const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
    if (!workspaceId) {
      return NextResponse.json({ error: "Aucun workspace." }, { status: 400 });
    }

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${appUrl}/dashboard/settings?section=subscription-creo&stripe=success`,
        cancel_url: `${appUrl}/dashboard/settings?section=subscription-creo&stripe=cancel`,
        customer_email: user.email,
        client_reference_id: workspaceId,
        metadata: {
          workspace_id: workspaceId,
          creo_plan: plan,
          creo_interval: interval,
        },
        subscription_data: {
          metadata: {
            workspace_id: workspaceId,
            creo_plan: plan,
            creo_interval: interval,
          },
        },
      });

      if (!session.url) {
        return NextResponse.json({ error: "Session Stripe sans URL." }, { status: 500 });
      }

      return NextResponse.json({
        url: session.url,
        plan,
        interval,
        eurMonthly: PLATFORM_SUBSCRIPTION_EUR_MONTHLY[plan],
      });
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
