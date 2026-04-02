import { redirect } from "next/navigation";

import { EmailsView } from "@/components/dashboard/emails/emails-view";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function EmailsPage() {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  let campaigns: Parameters<typeof EmailsView>[0]["campaigns"] = [];
  let sequences: Parameters<typeof EmailsView>[0]["sequences"] = [];

  if (workspaceId) {
    const [campRes, seqRes] = await Promise.all([
      supabase
        .from("email_campaigns")
        .select("id, name, status, subject")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
      supabase
        .from("email_sequences")
        .select("id, name, active")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false }),
    ]);

    campaigns = (campRes.data ?? []) as typeof campaigns;
    sequences = (seqRes.data ?? []) as typeof sequences;
  }

  return <EmailsView campaigns={campaigns} sequences={sequences} />;
}
