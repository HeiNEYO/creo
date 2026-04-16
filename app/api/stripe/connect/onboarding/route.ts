import { NextResponse } from "next/server";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import {
  isStripeConnectDisabledOnPlatformAccount,
  stripeConnectPlatformNotReadyMessage,
  stripeOrUnknownMessage,
} from "@/lib/stripe/error-message";
import { stripeConnectReturnUrls } from "@/lib/stripe/connect-return-urls";
import { getStripe } from "@/lib/stripe/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";
import {
  isPaidPlatformPlan,
  PLATFORM_UPGRADE_CONNECT_MESSAGE,
} from "@/lib/workspaces/platform-plan";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    let returnCtx: "integrations" | "payment-gateways" = "integrations";
    try {
      const raw = await req.json();
      if (
        raw &&
        typeof raw === "object" &&
        (raw as { returnTo?: string }).returnTo === "payment-gateways"
      ) {
        returnCtx = "payment-gateways";
      }
    } catch {
      /* corps absent ou JSON invalide : défaut integrations */
    }

    const stripe = getStripe();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");

    if (!stripe || !appUrl) {
      const missing: string[] = [];
      if (!stripe) missing.push("STRIPE_SECRET_KEY");
      if (!appUrl) missing.push("NEXT_PUBLIC_APP_URL");
      return NextResponse.json(
        {
          error: `Côté serveur, il manque : ${missing.join(", ")}. Vercel → variables pour Production → Redeploy. Si tu viens d’ajouter les clés, sans redéploiement l’ancienne build ne les voit pas.`,
        },
        { status: 503 }
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

    const { data: ws, error: wsErr } = await supabase
      .from("workspaces")
      .select("id, stripe_connect_account_id, plan")
      .eq("id", workspaceId)
      .single();

    if (wsErr || !ws) {
      return NextResponse.json({ error: "Workspace introuvable." }, { status: 400 });
    }

    if (!isPaidPlatformPlan(ws.plan as string | undefined)) {
      return NextResponse.json({ error: PLATFORM_UPGRADE_CONNECT_MESSAGE }, { status: 403 });
    }

    let accountId = ws.stripe_connect_account_id as string | null;

    try {
      if (!accountId) {
        const account = await stripe.accounts.create({
          type: "express",
          country: "FR",
          email: user.email,
          capabilities: {
            card_payments: { requested: true },
            transfers: { requested: true },
          },
          metadata: { workspace_id: workspaceId },
        });
        accountId = account.id;
        const { error: upErr } = await supabase
          .from("workspaces")
          .update({
            stripe_connect_account_id: accountId,
            stripe_connect_charges_enabled: false,
          })
          .eq("id", workspaceId);
        if (upErr) {
          return NextResponse.json(
            {
              error: `Base de données : ${upErr.message}. As-tu appliqué la migration Supabase (colonnes stripe_connect_*) ?`,
            },
            { status: 500 }
          );
        }
      }

      const { refresh_url, return_url } = stripeConnectReturnUrls(appUrl, returnCtx);
      const link = await stripe.accountLinks.create({
        account: accountId,
        refresh_url,
        return_url,
        type: "account_onboarding",
      });

      if (!link.url) {
        return NextResponse.json({ error: "Lien d’onboarding Stripe absent." }, { status: 500 });
      }

      return NextResponse.json({ url: link.url });
    } catch (err: unknown) {
      const error = isStripeConnectDisabledOnPlatformAccount(err)
        ? stripeConnectPlatformNotReadyMessage()
        : `Stripe : ${stripeOrUnknownMessage(err)}`;
      return NextResponse.json({ error }, { status: 502 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur serveur.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
