import type { SupabaseClient } from "@supabase/supabase-js";

export type DashboardStats = {
  revenueTotal: number;
  ordersCount: number;
  avgBasket: number;
  contactsCount: number;
  contactsSubscribed: number;
  contactsCreated7d: number;
  contactsCreated30d: number;
  contactsSeries: { d: string; v: number }[];
  pagesCount: number;
  publishedPagesCount: number;
  pageViewsTotal: number;
  viewsSeries: { d: string; v: number }[];
  topPages: { id: string; title: string; views: number }[];
  eventCounts: { view: number; click: number; conversion: number };
  coursesTotal: number;
  coursesPublished: number;
  enrollmentsTotal: number;
  topCoursesByEnrollments: { id: string; title: string; enrollments: number }[];
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

  const from30 = new Date(now);
  from30.setDate(from30.getDate() - 29);
  const from30Iso = startOfDay(from30).toISOString();

  const [
    ordersRes,
    contactsRes,
    contactsSubscribedRes,
    contacts7dRes,
    contacts30dRes,
    contactsSeriesRes,
    pagesRes,
    eventsRes,
    coursesRes,
    enrollRes,
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
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .eq("subscribed", true),
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .gte("created_at", fromIso),
      supabase
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .gte("created_at", from30Iso),
      supabase
        .from("contacts")
        .select("created_at")
        .eq("workspace_id", workspaceId)
        .gte("created_at", fromIso),
      supabase
        .from("pages")
        .select("id, title, views, published")
        .eq("workspace_id", workspaceId),
      supabase
        .from("analytics_events")
        .select("event_type, created_at")
        .eq("workspace_id", workspaceId)
        .gte("created_at", fromIso),
      supabase
        .from("courses")
        .select("id, title, status")
        .eq("workspace_id", workspaceId),
      supabase
        .from("enrollments")
        .select("course_id")
        .eq("workspace_id", workspaceId),
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
  const contactBuckets = new Map<string, number>();
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfDay(now));
    day.setDate(day.getDate() - (6 - i));
    const key = day.toISOString().slice(0, 10);
    viewsSeries.push({ d: frDayLabel(day), v: buckets.get(key) ?? 0 });
    contactBuckets.set(key, 0);
  }
  for (const row of contactsSeriesRes.data ?? []) {
    const key = (row.created_at as string).slice(0, 10);
    if (contactBuckets.has(key)) {
      contactBuckets.set(key, (contactBuckets.get(key) ?? 0) + 1);
    }
  }
  const contactsSeries: { d: string; v: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfDay(now));
    day.setDate(day.getDate() - (6 - i));
    const key = day.toISOString().slice(0, 10);
    contactsSeries.push({ d: frDayLabel(day), v: contactBuckets.get(key) ?? 0 });
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

  const courses = coursesRes.data ?? [];
  const coursesTotal = courses.length;
  const coursesPublished = courses.filter((c) => c.status === "published").length;

  const enrollByCourse = new Map<string, number>();
  for (const row of enrollRes.data ?? []) {
    const cid = row.course_id as string;
    if (!cid) continue;
    enrollByCourse.set(cid, (enrollByCourse.get(cid) ?? 0) + 1);
  }
  const enrollmentsTotal = enrollRes.data?.length ?? 0;

  const titleByCourseId = new Map(
    courses.map((c) => [c.id, (c.title || "Sans titre").trim() || "Sans titre"])
  );
  const topCoursesByEnrollments = Array.from(enrollByCourse.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, enrollments]) => ({
      id,
      title: titleByCourseId.get(id) ?? "Formation",
      enrollments,
    }));

  return {
    revenueTotal,
    ordersCount,
    avgBasket,
    contactsCount: contactsRes.count ?? 0,
    contactsSubscribed: contactsSubscribedRes.count ?? 0,
    contactsCreated7d: contacts7dRes.count ?? 0,
    contactsCreated30d: contacts30dRes.count ?? 0,
    contactsSeries,
    pagesCount: pages.length,
    publishedPagesCount,
    pageViewsTotal,
    viewsSeries,
    topPages,
    eventCounts,
    coursesTotal,
    coursesPublished,
    enrollmentsTotal,
    topCoursesByEnrollments,
  };
}
