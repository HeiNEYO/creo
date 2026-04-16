import { redirect } from "next/navigation";
import { Suspense } from "react";

import { IntegrationsView } from "@/components/dashboard/integrations/integrations-view";
import { Card } from "@/components/ui/card";
import type { WorkspaceIntegrationSettings } from "@/lib/integrations/actions";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
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

  return (
    <Suspense
      fallback={
        <Card className="p-8 text-center text-creo-sm text-creo-gray-500">
          Chargement…
        </Card>
      }
    >
      <IntegrationsView
        initialWebhookUrl={webhook}
        initialMetaPixelId={pixel}
        initialStripeConnectAccountId={stripeConnectAccountId}
        initialStripeConnectChargesEnabled={stripeConnectChargesEnabled}
        platformPlan={platformPlan}
      />
    </Suspense>
  );
}
