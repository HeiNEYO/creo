import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";

import { IntegrationDetailClient } from "@/components/dashboard/integrations/integration-detail-client";
import { Card } from "@/components/ui/card";
import type { WorkspaceIntegrationSettings } from "@/lib/integrations/actions";
import { getIntegrationCatalogEntry, isIntegrationCatalogId } from "@/lib/integrations/catalog";
import { isPlatformSubscriptionStripeConfigured } from "@/lib/stripe/platform-subscription-prices";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function IntegrationDetailPage({
  params,
}: {
  params: { integrationId: string };
}) {
  const id = params.integrationId;
  if (!isIntegrationCatalogId(id)) {
    notFound();
  }

  const entry = getIntegrationCatalogEntry(id);
  if (!entry) {
    notFound();
  }

  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  let webhook = "";
  let pixel = "";
  let stripeConnectAccountId: string | null = null;
  let stripeConnectChargesEnabled = false;
  let platformPlan = "starter";

  if (workspaceId) {
    const { data } = await supabase
      .from("workspaces")
      .select(
        "settings, stripe_connect_account_id, stripe_connect_charges_enabled, plan"
      )
      .eq("id", workspaceId)
      .single();
    platformPlan = typeof data?.plan === "string" ? data.plan : "starter";
    const s = data?.settings as WorkspaceIntegrationSettings | null | undefined;
    webhook = s?.webhook_url ?? "";
    pixel = s?.meta_pixel_id ?? "";
    stripeConnectAccountId =
      (data?.stripe_connect_account_id as string | null | undefined) ?? null;
    stripeConnectChargesEnabled =
      (data?.stripe_connect_charges_enabled as boolean | undefined) ?? false;
  }

  const stripeSecretConfigured = !!process.env.STRIPE_SECRET_KEY?.trim();
  const appUrlConfigured = !!process.env.NEXT_PUBLIC_APP_URL?.trim();
  const platformStripePricesConfigured = isPlatformSubscriptionStripeConfigured();
  const connectOAuthClientIdConfigured = !!process.env.NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID?.trim();

  return (
    <Suspense
      fallback={
        <Card className="p-8 text-center text-creo-sm text-creo-gray-500">
          Chargement…
        </Card>
      }
    >
      <IntegrationDetailClient
        entry={entry}
        initialWebhookUrl={webhook}
        initialMetaPixelId={pixel}
        initialStripeConnectAccountId={stripeConnectAccountId}
        initialStripeConnectChargesEnabled={stripeConnectChargesEnabled}
        platformPlan={platformPlan}
        connectOAuthClientIdConfigured={connectOAuthClientIdConfigured}
        stripeSecretConfigured={stripeSecretConfigured}
        appUrlConfigured={appUrlConfigured}
        platformStripePricesConfigured={platformStripePricesConfigured}
      />
    </Suspense>
  );
}
