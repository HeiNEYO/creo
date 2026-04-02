import { redirect } from "next/navigation";

import { AnalyticsView } from "@/components/dashboard/analytics/analytics-view";
import {
  getDashboardStats,
  type DashboardStats,
} from "@/lib/analytics/get-dashboard-stats";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

function emptyStats(): DashboardStats {
  return {
    revenueTotal: 0,
    ordersCount: 0,
    avgBasket: 0,
    contactsCount: 0,
    pagesCount: 0,
    publishedPagesCount: 0,
    pageViewsTotal: 0,
    viewsSeries: [],
    topPages: [],
    eventCounts: { view: 0, click: 0, conversion: 0 },
  };
}

export default async function AnalyticsPage() {
  const { supabase, user, workspaceId } = await getWorkspaceContext();
  if (!user) {
    redirect("/login");
  }

  const stats = workspaceId
    ? await getDashboardStats(supabase, workspaceId)
    : emptyStats();

  return <AnalyticsView stats={stats} />;
}
