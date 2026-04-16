import type { SupabaseClient } from "@supabase/supabase-js";

export type UnifiedChartRow = { d: string; v: number; prevV: number };

export type CockpitUnifiedTabMetrics = {
  monthTotal: number;
  prevMonthTotal: number;
  pctMoM: number | null;
  series: UnifiedChartRow[];
};

export type CockpitUnifiedMetrics = {
  currency: string;
  hasMixedOrderCurrency: boolean;
  contacts: CockpitUnifiedTabMetrics;
  pageViews: CockpitUnifiedTabMetrics;
  sales: CockpitUnifiedTabMetrics;
};

function utcStartOfMonth(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
}

function utcAddMonths(d: Date, delta: number): Date {
  const y = d.getUTCFullYear();
  const m = d.getUTCMonth() + delta;
  return new Date(Date.UTC(y, m, 1));
}

function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function dayKeyUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const mo = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

function addDaysUtc(d: Date, delta: number): Date {
  return new Date(d.getTime() + delta * 86400000);
}

function shortDayFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function pctMoM(cur: number, prev: number): number | null {
  if (prev <= 0) {
    if (cur <= 0) return 0;
    return null;
  }
  return ((cur - prev) / prev) * 100;
}

function dominantCurrency(rows: { currency: string | null }[]): string {
  const counts = new Map<string, number>();
  for (const r of rows) {
    const c = String(r.currency || "eur").toLowerCase();
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  let best = "eur";
  let max = 0;
  for (const [c, n] of Array.from(counts.entries())) {
    if (n > max) {
      max = n;
      best = c;
    }
  }
  return best;
}

/** 7 jours glissants (aujourd’hui inclus) vs les 7 jours précédents, alignés jour à jour. */
function buildCompare7(
  todayUtc: Date,
  valueByDay: Map<string, number>,
): UnifiedChartRow[] {
  const series: UnifiedChartRow[] = [];
  for (let offset = 6; offset >= 0; offset--) {
    const day = addDaysUtc(todayUtc, -offset);
    const key = dayKeyUtc(day);
    const dayPrev = addDaysUtc(todayUtc, -offset - 7);
    const keyPrev = dayKeyUtc(dayPrev);
    series.push({
      d: shortDayFr(day),
      v: valueByDay.get(key) ?? 0,
      prevV: valueByDay.get(keyPrev) ?? 0,
    });
  }
  return series;
}

/**
 * Métriques cockpit unifiées : contacts, pages vues, nombre de ventes — séries 7 j. + semaine précédente.
 */
export async function getCockpitUnifiedMetrics(
  supabase: SupabaseClient,
  workspaceId: string,
): Promise<CockpitUnifiedMetrics | null> {
  const now = new Date();
  const todayUtc = utcMidnight(now);
  const startThisMonth = utcStartOfMonth(now);
  const startNextMonth = utcAddMonths(startThisMonth, 1);
  const startPrevMonth = utcAddMonths(startThisMonth, -1);

  const from15d = new Date(now.getTime() - 15 * 86400000).toISOString();

  const [
    contactsThisRes,
    contactsPrevRes,
    contactsRaw,
    pvThisRes,
    pvPrevRes,
    pvRaw,
    ordersThisRes,
    ordersPrevRes,
    ordersRaw,
    ordersCurrencyProbe,
  ] = await Promise.all([
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("created_at", startThisMonth.toISOString())
      .lt("created_at", startNextMonth.toISOString()),
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .gte("created_at", startPrevMonth.toISOString())
      .lt("created_at", startThisMonth.toISOString()),
    supabase
      .from("contacts")
      .select("created_at")
      .eq("workspace_id", workspaceId)
      .gte("created_at", from15d),
    supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("event_type", "view")
      .gte("created_at", startThisMonth.toISOString())
      .lt("created_at", startNextMonth.toISOString()),
    supabase
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("event_type", "view")
      .gte("created_at", startPrevMonth.toISOString())
      .lt("created_at", startThisMonth.toISOString()),
    supabase
      .from("analytics_events")
      .select("created_at")
      .eq("workspace_id", workspaceId)
      .eq("event_type", "view")
      .gte("created_at", from15d),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "paid")
      .gte("created_at", startThisMonth.toISOString())
      .lt("created_at", startNextMonth.toISOString()),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("status", "paid")
      .gte("created_at", startPrevMonth.toISOString())
      .lt("created_at", startThisMonth.toISOString()),
    supabase
      .from("orders")
      .select("created_at")
      .eq("workspace_id", workspaceId)
      .eq("status", "paid")
      .gte("created_at", from15d),
    supabase
      .from("orders")
      .select("currency")
      .eq("workspace_id", workspaceId)
      .eq("status", "paid")
      .gte("created_at", from15d)
      .limit(500),
  ]);

  const contactByDay = new Map<string, number>();
  for (const row of contactsRaw.data ?? []) {
    const key = (row.created_at as string).slice(0, 10);
    contactByDay.set(key, (contactByDay.get(key) ?? 0) + 1);
  }

  const viewsByDay = new Map<string, number>();
  for (const row of pvRaw.data ?? []) {
    const key = (row.created_at as string).slice(0, 10);
    viewsByDay.set(key, (viewsByDay.get(key) ?? 0) + 1);
  }

  const ordersByDay = new Map<string, number>();
  for (const row of ordersRaw.data ?? []) {
    const key = (row.created_at as string).slice(0, 10);
    ordersByDay.set(key, (ordersByDay.get(key) ?? 0) + 1);
  }

  const contactsSeries = buildCompare7(todayUtc, contactByDay);
  const pageViewsSeries = buildCompare7(todayUtc, viewsByDay);
  const salesSeries = buildCompare7(todayUtc, ordersByDay);

  const orderRows = (ordersCurrencyProbe.data ?? []) as { currency: string | null }[];
  const dom = dominantCurrency(orderRows);
  const hasMixedOrderCurrency = orderRows.some(
    (r) => String(r.currency || "eur").toLowerCase() !== dom,
  );

  const contacts: CockpitUnifiedTabMetrics = {
    monthTotal: contactsThisRes.count ?? 0,
    prevMonthTotal: contactsPrevRes.count ?? 0,
    pctMoM: pctMoM(contactsThisRes.count ?? 0, contactsPrevRes.count ?? 0),
    series: contactsSeries,
  };

  const pageViews: CockpitUnifiedTabMetrics = {
    monthTotal: pvThisRes.count ?? 0,
    prevMonthTotal: pvPrevRes.count ?? 0,
    pctMoM: pctMoM(pvThisRes.count ?? 0, pvPrevRes.count ?? 0),
    series: pageViewsSeries,
  };

  const sales: CockpitUnifiedTabMetrics = {
    monthTotal: ordersThisRes.count ?? 0,
    prevMonthTotal: ordersPrevRes.count ?? 0,
    pctMoM: pctMoM(ordersThisRes.count ?? 0, ordersPrevRes.count ?? 0),
    series: salesSeries,
  };

  return {
    currency: dom,
    hasMixedOrderCurrency,
    contacts,
    pageViews,
    sales,
  };
}

export type CockpitHeroMetrics = CockpitUnifiedMetrics;
