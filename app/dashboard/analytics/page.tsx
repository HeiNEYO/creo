import { redirect } from "next/navigation";

import { AnalyticsView } from "@/components/dashboard/analytics/analytics-view";
import {
  emptyCockpitSalesPayload,
  getCockpitSalesAnalytics,
} from "@/lib/analytics/get-cockpit-sales";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/lib/analytics/get-dashboard-stats";
import { getCockpitRecentOrders } from "@/lib/analytics/get-recent-orders";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

function emptyStats(): DashboardStats {
  return {
    revenueTotal: 0,
    ordersCount: 0,
    avgBasket: 0,
    contactsCount: 0,
    contactsSubscribed: 0,
    contactsCreated7d: 0,
    contactsCreated30d: 0,
    contactsSeries: [],
    pagesCount: 0,
    publishedPagesCount: 0,
    pageViewsTotal: 0,
    viewsSeries: [],
    topPages: [],
    eventCounts: { view: 0, click: 0, conversion: 0 },
    coursesTotal: 0,
    coursesPublished: 0,
    enrollmentsTotal: 0,
    topCoursesByEnrollments: [],
  };
}

export default async function AnalyticsPage() {
  const { supabase, user, workspaceId } = await getWorkspaceContext();
  if (!user) {
    redirect("/login");
  }

  const { data: workspaceRow } = workspaceId
    ? await supabase
        .from("workspaces")
        .select("stripe_connect_charges_enabled")
        .eq("id", workspaceId)
        .maybeSingle()
    : { data: null };

  const stripeChargesEnabled =
    workspaceRow?.stripe_connect_charges_enabled === true;

  const stats = workspaceId
    ? await getDashboardStats(supabase, workspaceId)
    : emptyStats();

  let sales = workspaceId
    ? await getCockpitSalesAnalytics(supabase, workspaceId)
    : null;
  if (workspaceId && sales === null) {
    sales = emptyCockpitSalesPayload();
  }

  const recentOrders = workspaceId
    ? await getCockpitRecentOrders(supabase, workspaceId)
    : null;

  return (
    <AnalyticsView
      stats={stats}
      sales={sales}
      recentOrders={recentOrders}
      stripeChargesEnabled={stripeChargesEnabled}
    />
  );
}
