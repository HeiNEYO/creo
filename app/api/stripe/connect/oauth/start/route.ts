import { NextResponse } from "next/server";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { signConnectOAuthState } from "@/lib/stripe/connect-oauth-state";
import { fetchWorkspacePlan } from "@/lib/workspaces/fetch-workspace-plan";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";
import {
  isPaidPlatformPlan,
  PLATFORM_UPGRADE_CONNECT_MESSAGE,
} from "@/lib/workspaces/platform-plan";

export const dynamic = "force-dynamic";

/**
 * Redirige vers Stripe Connect OAuth pour lier un compte Stripe **Standard** existant
 * (alternative à l’onboarding Express).
 *
 * Query optionnelle : `?return=settings` → retour après OAuth sur Paramètres → Passerelles de paiement.
 */
export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");
  const clientId = process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID?.trim();

  if (!appUrl) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_APP_URL manquant." },
      { status: 503 }
    );
  }

  if (!clientId) {
    return NextResponse.json(
      {
        error:
          "OAuth Connect non configuré : ajoute NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID (Dashboard Stripe → Connect → Paramètres de l’intégration, identifiant ca_…).",
      },
      { status: 503 }
    );
  }

  const supabase = createRouteHandlerClient();
  const user = await readAuthUser(supabase);
  if (!user?.id) {
    return NextResponse.redirect(new URL("/login", appUrl));
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return NextResponse.json({ error: "Aucun workspace." }, { status: 400 });
  }

  const plan = await fetchWorkspacePlan(supabase, workspaceId);
  if (!isPaidPlatformPlan(plan)) {
    return NextResponse.json({ error: PLATFORM_UPGRADE_CONNECT_MESSAGE }, { status: 403 });
  }

  const returnParam = new URL(req.url).searchParams.get("return");
  const oauthReturnPath =
    returnParam === "settings" ? "/dashboard/settings" : "/dashboard/integrations";

  let state: string;
  try {
    state = signConnectOAuthState({ workspaceId, userId: user.id, oauthReturnPath });
  } catch {
    return NextResponse.json(
      { error: "Configuration serveur : STRIPE_SECRET_KEY manquant pour signer l’état OAuth." },
      { status: 503 }
    );
  }

  const callbackUrl = `${appUrl}/api/stripe/connect/oauth/callback`;
  const authorizeUrl = new URL("https://connect.stripe.com/oauth/authorize");
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("scope", "read_write");
  authorizeUrl.searchParams.set("redirect_uri", callbackUrl);
  authorizeUrl.searchParams.set("state", state);

  return NextResponse.redirect(authorizeUrl.toString());
}
