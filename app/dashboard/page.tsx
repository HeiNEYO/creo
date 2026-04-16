import dynamic from "next/dynamic";
import { redirect } from "next/navigation";

import { DashboardMainSkeleton } from "@/components/dashboard/dashboard-page-skeleton";
import { getCockpitUnifiedMetrics } from "@/lib/analytics/get-cockpit-hero-metrics";
import {
  emptyCockpitSalesPayload,
  getCockpitSalesAnalytics,
} from "@/lib/analytics/get-cockpit-sales";
import { getCockpitRecentActivity } from "@/lib/analytics/get-recent-activity";
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
        .select("name, slug, plan, stripe_connect_charges_enabled")
        .eq("id", workspaceId)
        .maybeSingle()
    : { data: null };

  const recentActivity = workspaceId
    ? await getCockpitRecentActivity(supabase, workspaceId)
    : null;

  let sales = workspaceId
    ? await getCockpitSalesAnalytics(supabase, workspaceId)
    : null;
  if (workspaceId && sales === null) {
    sales = emptyCockpitSalesPayload();
  }

  const heroMetrics = workspaceId
    ? await getCockpitUnifiedMetrics(supabase, workspaceId)
    : null;

  const stripeChargesEnabled =
    workspace?.stripe_connect_charges_enabled === true;

  return (
    <CockpitView
      workspace={workspace}
      sales={sales}
      heroMetrics={heroMetrics}
      recentActivity={recentActivity}
      stripeChargesEnabled={stripeChargesEnabled}
    />
  );
}
