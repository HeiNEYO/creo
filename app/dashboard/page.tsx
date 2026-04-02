import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { DashboardMainSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

const CockpitView = dynamic(
  () =>
    import("@/components/dashboard/cockpit-view").then((m) => ({
      default: m.CockpitView,
    })),
  {
    loading: () => <DashboardMainSkeleton />,
    ssr: true,
  }
);

export default async function DashboardHomePage() {
  const { supabase, user, workspaceId } = await getWorkspaceContext();

  if (!user) {
    redirect("/login");
  }

  const { data: workspace } = workspaceId
    ? await supabase
        .from("workspaces")
        .select("name, slug, plan")
        .eq("id", workspaceId)
        .maybeSingle()
    : { data: null };

  return <CockpitView workspace={workspace} />;
}
