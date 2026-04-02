import type { SupabaseClient } from "@supabase/supabase-js";

export type DashboardStats = {
  revenueTotal: number;
  ordersCount: number;
  avgBasket: number;
  contactsCount: number;
  pagesCount: number;
  publishedPagesCount: number;
  pageViewsTotal: number;
  viewsSeries: { d: string; v: number }[];
  topPages: { id: string; title: string; views: number }[];
  eventCounts: { view: number; click: number; conversion: number };
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function frDayLabel(d: Date): string {
  return new Intl.DateTimeFormat("fr-FR", { weekday: "short" }).format(d);
}

export async function getDashboardStats(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<DashboardStats> {
  const now = new Date();
  const from = new Date(now);
  from.setDate(from.getDate() - 6);
  const fromIso = startOfDay(from).toISOString();

  const [
    ordersRes,
    contactsRes,
    pagesRes,
    eventsRes,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("amount, status")
      .eq("workspace_id", workspaceId),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase
      .from("pages")
      .select("id, title, views, published")
      .eq("workspace_id", workspaceId),
    supabase
      .from("analytics_events")
      .select("event_type, created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", fromIso),
  ]);

  const orders = ordersRes.data ?? [];
  const paid = orders.filter((o) => o.status === "paid");
  const revenueTotal = paid.reduce((s, o) => s + Number(o.amount ?? 0), 0);
  const ordersCount = paid.length;
  const avgBasket = ordersCount > 0 ? revenueTotal / ordersCount : 0;

  const pages = pagesRes.data ?? [];
  const pageViewsTotal = pages.reduce((s, p) => s + Number(p.views ?? 0), 0);
  const publishedPagesCount = pages.filter((p) => p.published).length;

  const events = eventsRes.data ?? [];
  const buckets = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfDay(now));
    day.setDate(day.getDate() - (6 - i));
    buckets.set(day.toISOString().slice(0, 10), 0);
  }
  for (const e of events) {
    if (e.event_type !== "view") continue;
    const key = (e.created_at as string).slice(0, 10);
    if (buckets.has(key)) {
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    }
  }
  const viewsSeries: { d: string; v: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfDay(now));
    day.setDate(day.getDate() - (6 - i));
    const key = day.toISOString().slice(0, 10);
    viewsSeries.push({ d: frDayLabel(day), v: buckets.get(key) ?? 0 });
  }

  const topPages = [...pages]
    .sort((a, b) => Number(b.views ?? 0) - Number(a.views ?? 0))
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title || "Sans titre",
      views: Number(p.views ?? 0),
    }));

  const eventCounts = {
    view: events.filter((e) => e.event_type === "view").length,
    click: events.filter((e) => e.event_type === "click").length,
    conversion: events.filter((e) => e.event_type === "conversion").length,
  };

  return {
    revenueTotal,
    ordersCount,
    avgBasket,
    contactsCount: contactsRes.count ?? 0,
    pagesCount: pages.length,
    publishedPagesCount,
    pageViewsTotal,
    viewsSeries,
    topPages,
    eventCounts,
  };
}
