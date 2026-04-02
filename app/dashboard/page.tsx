import { redirect } from "next/navigation";

import { CockpitView } from "@/components/dashboard/cockpit-view";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: members } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1);

  const workspaceId = members?.[0]?.workspace_id;

  const { data: workspace } = workspaceId
    ? await supabase
        .from("workspaces")
        .select("name, slug, plan")
        .eq("id", workspaceId)
        .maybeSingle()
    : { data: null };

  return <CockpitView workspace={workspace} />;
}
