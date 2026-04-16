import type { SupabaseClient } from "@supabase/supabase-js";

export type CockpitPeriodKey = "7d" | "30d" | "90d" | "12m";

export type CockpitPeriodSales = {
  revenue: number;
  revenuePrev: number;
  orders: number;
  ordersPrev: number;
  series: { d: string; v: number }[];
  seriesPrev: { v: number }[];
};

export type CockpitSalesPayload = {
  currency: string;
  hasMixedCurrency: boolean;
  byPeriod: Record<CockpitPeriodKey, CockpitPeriodSales>;
};

type PaidOrderRow = {
  amount: string | number;
  currency: string;
  created_at: string;
};

function utcMidnight(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function dayKeyUtc(d: Date): string {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDaysUtc(d: Date, delta: number): Date {
  return new Date(d.getTime() + delta * 86400000);
}

function shortDayLabelFr(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

function shortMonthLabelFr(year: number, monthIndex: number): string {
  const dt = new Date(Date.UTC(year, monthIndex, 1));
  return dt.toLocaleDateString("fr-FR", { month: "short", year: "2-digit", timeZone: "UTC" });
}

function addMonthsUtc(year: number, month: number, delta: number): { y: number; m: number } {
  let m = month + delta;
  let y = year;
  while (m < 0) {
    m += 12;
    y -= 1;
  }
  while (m > 11) {
    m -= 12;
    y += 1;
  }
  return { y, m };
}

function sumMonth(
  year: number,
  month: number,
  amountByDay: Map<string, number>,
  countByDay: Map<string, number>,
): { rev: number; ord: number } {
  const dim = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  let rev = 0;
  let ord = 0;
  for (let day = 1; day <= dim; day++) {
    const key = dayKeyUtc(new Date(Date.UTC(year, month, day)));
    rev += amountByDay.get(key) ?? 0;
    ord += countByDay.get(key) ?? 0;
  }
  return { rev, ord };
}

function dominantCurrency(rows: PaidOrderRow[]): string {
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

function parseAmount(v: string | number): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function buildDailyPeriod(
  todayUtc: Date,
  lengthDays: number,
  amountByDay: Map<string, number>,
  countByDay: Map<string, number>,
): CockpitPeriodSales {
  const series: { d: string; v: number }[] = [];
  const seriesPrev: { v: number }[] = [];

  for (let offset = lengthDays - 1; offset >= 0; offset--) {
    const day = addDaysUtc(todayUtc, -offset);
    const key = dayKeyUtc(day);
    series.push({ d: shortDayLabelFr(day), v: amountByDay.get(key) ?? 0 });

    const dayPrev = addDaysUtc(todayUtc, -offset - lengthDays);
    const keyPrev = dayKeyUtc(dayPrev);
    seriesPrev.push({ v: amountByDay.get(keyPrev) ?? 0 });
  }

  const revenue = series.reduce((s, x) => s + x.v, 0);
  const revenuePrev = seriesPrev.reduce((s, x) => s + x.v, 0);

  let orders = 0;
  let ordersPrev = 0;
  for (let offset = lengthDays - 1; offset >= 0; offset--) {
    const day = addDaysUtc(todayUtc, -offset);
    orders += countByDay.get(dayKeyUtc(day)) ?? 0;
    const dayPrev = addDaysUtc(todayUtc, -offset - lengthDays);
    ordersPrev += countByDay.get(dayKeyUtc(dayPrev)) ?? 0;
  }

  return { revenue, revenuePrev, orders, ordersPrev, series, seriesPrev };
}

function buildMonthlyYearPeriod(
  todayUtc: Date,
  numMonths: number,
  amountByDay: Map<string, number>,
  countByDay: Map<string, number>,
): CockpitPeriodSales {
  const series: { d: string; v: number }[] = [];
  const seriesPrev: { v: number }[] = [];
  const endY = todayUtc.getUTCFullYear();
  const endM = todayUtc.getUTCMonth();

  let orders = 0;
  let ordersPrev = 0;

  for (let k = 0; k < numMonths; k++) {
    const { y, m } = addMonthsUtc(endY, endM, -(numMonths - 1 - k));
    const cur = sumMonth(y, m, amountByDay, countByDay);
    series.push({ d: shortMonthLabelFr(y, m), v: cur.rev });
    orders += cur.ord;

    const prev = addMonthsUtc(y, m, -numMonths);
    const p = sumMonth(prev.y, prev.m, amountByDay, countByDay);
    seriesPrev.push({ v: p.rev });
    ordersPrev += p.ord;
  }

  const revenue = series.reduce((s, x) => s + x.v, 0);
  const revenuePrev = seriesPrev.reduce((s, x) => s + x.v, 0);

  return { revenue, revenuePrev, orders, ordersPrev, series, seriesPrev };
}

export function emptyCockpitSalesPayload(): CockpitSalesPayload {
  const todayUtc = utcMidnight(new Date());
  const amount = new Map<string, number>();
  const count = new Map<string, number>();
  return {
    currency: "eur",
    hasMixedCurrency: false,
    byPeriod: {
      "7d": buildDailyPeriod(todayUtc, 7, amount, count),
      "30d": buildDailyPeriod(todayUtc, 30, amount, count),
      "90d": buildDailyPeriod(todayUtc, 90, amount, count),
      "12m": buildMonthlyYearPeriod(todayUtc, 12, amount, count),
    },
  };
}

/**
 * Agrège les commandes `paid` (enregistrées via Stripe / webhooks) pour le cockpit.
 */
export async function getCockpitSalesAnalytics(
  supabase: SupabaseClient,
  workspaceId: string,
): Promise<CockpitSalesPayload | null> {
  const cutoff = new Date(Date.now() - 800 * 86400000).toISOString();

  const { data, error } = await supabase
    .from("orders")
    .select("amount, currency, created_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "paid")
    .gte("created_at", cutoff);

  if (error || !Array.isArray(data)) {
    return null;
  }

  const rows = data as PaidOrderRow[];
  const todayUtc = utcMidnight(new Date());

  if (rows.length === 0) {
    return emptyCockpitSalesPayload();
  }

  const dom = dominantCurrency(rows);
  const hasMixed = rows.some(
    (r) => String(r.currency || "eur").toLowerCase() !== dom,
  );

  const amountByDay = new Map<string, number>();
  const countByDay = new Map<string, number>();

  for (const r of rows) {
    if (String(r.currency || "eur").toLowerCase() !== dom) continue;
    const key = dayKeyUtc(new Date(r.created_at));
    const amt = parseAmount(r.amount);
    amountByDay.set(key, (amountByDay.get(key) ?? 0) + amt);
    countByDay.set(key, (countByDay.get(key) ?? 0) + 1);
  }

  const byPeriod: Record<CockpitPeriodKey, CockpitPeriodSales> = {
    "7d": buildDailyPeriod(todayUtc, 7, amountByDay, countByDay),
    "30d": buildDailyPeriod(todayUtc, 30, amountByDay, countByDay),
    "90d": buildDailyPeriod(todayUtc, 90, amountByDay, countByDay),
    "12m": buildMonthlyYearPeriod(todayUtc, 12, amountByDay, countByDay),
  };

  return {
    currency: dom,
    hasMixedCurrency: hasMixed,
    byPeriod,
  };
}
