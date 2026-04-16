import { NextResponse } from "next/server";

import { parseCheckoutContent } from "@/lib/public-pages/checkout-config";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getStripe } from "@/lib/stripe/server";
import {
  isPaidPlatformPlan,
  PLATFORM_UPGRADE_PAGE_CHECKOUT_MESSAGE,
} from "@/lib/workspaces/platform-plan";

type Body = {
  workspaceSlug?: string;
  pageSlug?: string;
};

export async function POST(req: Request) {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "");

  if (!stripe || !appUrl) {
    return NextResponse.json(
      { error: "Stripe ou NEXT_PUBLIC_APP_URL manquant." },
      { status: 503 }
    );
  }

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Corps JSON invalide." }, { status: 400 });
  }

  const workspaceSlug = typeof body.workspaceSlug === "string" ? body.workspaceSlug.trim() : "";
  const pageSlug = typeof body.pageSlug === "string" ? body.pageSlug.trim() : "";
  if (!workspaceSlug || !pageSlug) {
    return NextResponse.json({ error: "workspaceSlug et pageSlug requis." }, { status: 400 });
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return NextResponse.json({ error: "Service role Supabase non configuré." }, { status: 503 });
  }

  const { data: ws, error: wErr } = await admin
    .from("workspaces")
    .select("id, slug, stripe_connect_account_id, stripe_connect_charges_enabled, plan")
    .eq("slug", workspaceSlug)
    .maybeSingle();

  if (wErr || !ws || ws.slug !== workspaceSlug) {
    return NextResponse.json({ error: "Boutique introuvable." }, { status: 404 });
  }

  if (!isPaidPlatformPlan(ws.plan as string | undefined)) {
    return NextResponse.json({ error: PLATFORM_UPGRADE_PAGE_CHECKOUT_MESSAGE }, { status: 403 });
  }

  if (!ws.stripe_connect_account_id || !ws.stripe_connect_charges_enabled) {
    return NextResponse.json(
      { error: "Le vendeur n’a pas encore activé les paiements Stripe." },
      { status: 409 }
    );
  }

  const { data: page, error: pErr } = await admin
    .from("pages")
    .select("id, workspace_id, type, content, published")
    .eq("workspace_id", ws.id)
    .eq("slug", pageSlug)
    .maybeSingle();

  if (pErr || !page || !page.published || page.type !== "checkout") {
    return NextResponse.json({ error: "Page de paiement introuvable ou non publiée." }, { status: 404 });
  }

  const checkout = parseCheckoutContent(page.content);
  if (!checkout) {
    return NextResponse.json(
      { error: "Montant ou devise de la page invalide (min. 0,50 €)." },
      { status: 422 }
    );
  }

  const feePercentRaw = process.env.STRIPE_APPLICATION_FEE_PERCENT?.trim();
  const feePercent = feePercentRaw ? Number(feePercentRaw) : 0;
  const applicationFeeAmount =
    Number.isFinite(feePercent) && feePercent > 0
      ? Math.round((checkout.price_cents * feePercent) / 100)
      : undefined;

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: checkout.currency,
            product_data: { name: checkout.product_name },
            unit_amount: checkout.price_cents,
          },
          quantity: 1,
        },
      ],
      success_url: `${appUrl}/p/${workspaceSlug}/${pageSlug}?paid=1`,
      cancel_url: `${appUrl}/p/${workspaceSlug}/${pageSlug}?paid=0`,
      payment_intent_data: {
        ...(applicationFeeAmount && applicationFeeAmount > 0
          ? { application_fee_amount: applicationFeeAmount }
          : {}),
        transfer_data: { destination: ws.stripe_connect_account_id },
        metadata: {
          workspace_id: ws.id,
          page_id: page.id,
        },
      },
      metadata: {
        workspace_id: ws.id,
        page_id: page.id,
      },
    }
  );

  if (!session.url) {
    return NextResponse.json({ error: "Session Checkout sans URL." }, { status: 500 });
  }

  return NextResponse.json({ url: session.url });
}
