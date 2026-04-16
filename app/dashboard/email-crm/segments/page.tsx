import { redirect } from "next/navigation";

import { SegmentsCrmView } from "@/components/dashboard/email-crm/segments-crm-view";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function EmailCrmSegmentsPage() {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  let segments: {
    id: string;
    name: string;
    rules: Record<string, unknown>;
    created_at: string;
  }[] = [];

  if (workspaceId) {
    const { data } = await supabase
      .from("crm_segments")
      .select("id, name, rules, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    segments = (data ?? []) as typeof segments;
  }

  return <SegmentsCrmView segments={segments} />;
}
