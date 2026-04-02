import { redirect } from "next/navigation";

import { CockpitView } from "@/components/dashboard/cockpit-view";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export default async function DashboardHomePage() {
  const supabase = createClient();
  const user = await readAuthUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);

  const { data: workspace } = workspaceId
    ? await supabase
        .from("workspaces")
        .select("name, slug, plan")
        .eq("id", workspaceId)
        .maybeSingle()
    : { data: null };

  return <CockpitView workspace={workspace} />;
}
