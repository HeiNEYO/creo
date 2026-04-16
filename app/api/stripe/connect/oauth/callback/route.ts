import { NextResponse } from "next/server";

import { stripeOrUnknownMessage } from "@/lib/stripe/error-message";
import { verifyConnectOAuthState } from "@/lib/stripe/connect-oauth-state";
import { getStripe } from "@/lib/stripe/server";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

function redirectAfterOAuth(
  appUrl: string,
  oauthReturnPath: string,
  query: Record<string, string | undefined>
): NextResponse {
  const u = new URL(oauthReturnPath, appUrl);
  if (oauthReturnPath === "/dashboard/settings") {
    u.searchParams.set("section", "payment-gateways");
  }
  Object.entries(query).forEach(([k, v]) => {
    if (v !== undefined) {
      u.searchParams.set(k, v);
    }
  });
  return NextResponse.redirect(u);
}

export async function GET(req: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "") ?? "";
  if (!appUrl) {
    return NextResponse.json({ error: "NEXT_PUBLIC_APP_URL manquant." }, { status: 503 });
  }

  const url = new URL(req.url);
  const err = url.searchParams.get("error");
  const errDesc = url.searchParams.get("error_description");
  if (err) {
    const msg = [err, errDesc].filter(Boolean).join(" — ");
    const fallbackPath = "/dashboard/integrations";
    return redirectAfterOAuth(appUrl, fallbackPath, {
      stripe_connect_oauth: "error",
      stripe_connect_oauth_msg: msg.slice(0, 500),
    });
  }

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code) {
    return redirectAfterOAuth(appUrl, "/dashboard/integrations", { stripe_connect_oauth: "error" });
  }

  const verified = verifyConnectOAuthState(state);
  if (!verified) {
    return redirectAfterOAuth(appUrl, "/dashboard/integrations", {
      stripe_connect_oauth: "error",
      stripe_connect_oauth_msg: "Lien expiré ou invalide. Réessaie depuis Intégrations.",
    });
  }

  const { oauthReturnPath } = verified;

  const supabase = createRouteHandlerClient();
  const user = await readAuthUser(supabase);
  if (!user?.id || user.id !== verified.userId) {
    return NextResponse.redirect(new URL("/login", appUrl));
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId || workspaceId !== verified.workspaceId) {
    return redirectAfterOAuth(appUrl, oauthReturnPath, {
      stripe_connect_oauth: "error",
      stripe_connect_oauth_msg: "Workspace incohérent. Réessaie.",
    });
  }

  const stripe = getStripe();
  if (!stripe) {
    return redirectAfterOAuth(appUrl, oauthReturnPath, {
      stripe_connect_oauth: "error",
      stripe_connect_oauth_msg: "Stripe non configuré côté serveur.",
    });
  }

  try {
    const token = await stripe.oauth.token({
      grant_type: "authorization_code",
      code,
    });
    const accountId = token.stripe_user_id;
    if (!accountId) {
      return redirectAfterOAuth(appUrl, oauthReturnPath, {
        stripe_connect_oauth: "error",
        stripe_connect_oauth_msg: "Stripe n’a pas renvoyé l’identifiant du compte.",
      });
    }

    const { error: upErr } = await supabase
      .from("workspaces")
      .update({
        stripe_connect_account_id: accountId,
        stripe_connect_charges_enabled: false,
      })
      .eq("id", workspaceId);

    if (upErr) {
      return redirectAfterOAuth(appUrl, oauthReturnPath, {
        stripe_connect_oauth: "error",
        stripe_connect_oauth_msg: upErr.message,
      });
    }

    return redirectAfterOAuth(appUrl, oauthReturnPath, { stripe_connect_oauth: "success" });
  } catch (e: unknown) {
    return redirectAfterOAuth(appUrl, oauthReturnPath, {
      stripe_connect_oauth: "error",
      stripe_connect_oauth_msg: stripeOrUnknownMessage(e),
    });
  }
}
