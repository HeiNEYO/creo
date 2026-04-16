import { redirect } from "next/navigation";

import {
  CampaignsList,
  type CampaignRow,
} from "@/components/dashboard/emails/campaigns-list";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function EmailCrmConceptionPage() {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  let campaigns: CampaignRow[] = [];

  if (workspaceId) {
    const { data } = await supabase
      .from("email_campaigns")
      .select("id, name, status, subject")
      .eq("workspace_id", workspaceId)
      .eq("is_template", true)
      .order("created_at", { ascending: false });

    campaigns = (data ?? []) as CampaignRow[];
  }

  return (
    <CampaignsList
      mode="templates"
      campaigns={campaigns}
      pageTitle="Modèles d'email"
      pageDescription="Bibliothèque réutilisable — pas d’envoi de masse ici. Duplique en « campagne » quand tu veux diffuser."
    />
  );
}
