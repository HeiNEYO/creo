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

  if (workspaceId) {
    const { data } = await supabase
      .from("workspaces")
      .select("settings")
      .eq("id", workspaceId)
      .single();
    const s = data?.settings as WorkspaceIntegrationSettings | null | undefined;
    webhook = s?.webhook_url ?? "";
    pixel = s?.meta_pixel_id ?? "";
  }

  return (
    <Suspense
      fallback={
        <Card className="p-8 text-center text-creo-sm text-creo-gray-500">
          Chargement…
        </Card>
      }
    >
      <IntegrationsView initialWebhookUrl={webhook} initialMetaPixelId={pixel} />
    </Suspense>
  );
}
