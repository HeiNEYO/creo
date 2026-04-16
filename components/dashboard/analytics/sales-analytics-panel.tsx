"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { CockpitOrderRow } from "@/lib/analytics/get-recent-orders";
import type {
  CockpitPeriodKey,
  CockpitSalesPayload,
} from "@/lib/analytics/get-cockpit-sales";
import { MetricCard } from "@/components/dashboard/metric-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const PERIOD_TABS: { key: CockpitPeriodKey; label: string }[] = [
  { key: "7d", label: "7 j." },
  { key: "30d", label: "30 j." },
  { key: "90d", label: "90 j." },
  { key: "12m", label: "12 m." },
];

function fmtCount(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function fmtMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: amount >= 100 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function deltaPct(cur: number, prev: number): number | null {
  if (prev <= 0) return null;
  return ((cur - prev) / prev) * 100;
}

function orderProductLabel(productType: string): string {
  if (productType === "page") return "Page / checkout";
  if (productType === "course") return "Formation";
  if (productType === "membership") return "Abonnement";
  return productType;
}

function fmtOrderMoney(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

function fmtOrderWhen(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l’instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 48) return `il y a ${hours} h`;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function periodSalesLabel(key: CockpitPeriodKey): string {
  switch (key) {
    case "7d":
      return "7 derniers jours";
    case "30d":
      return "30 derniers jours";
    case "90d":
      return "90 derniers jours";
    case "12m":
      return "12 derniers mois";
    default:
      return "";
  }
}

export function SalesAnalyticsPanel({
  sales,
  recentOrders,
  stripeChargesEnabled,
  layout = "analytics",
}: {
  sales: CockpitSalesPayload | null;
  recentOrders: CockpitOrderRow[] | null;
  stripeChargesEnabled: boolean;
  /** Accueil : bloc unique, sans bandeau Stripe (déjà au-dessus) ni commandes récentes */
  layout?: "analytics" | "home";
}) {
  const [period, setPeriod] = useState<CockpitPeriodKey>("30d");

  /** Thème forcé clair globalement — graphique en palette admin clair. */
  const chartAppearance = "light";

  const snap = sales?.byPeriod[period];
  const currency = sales?.currency ?? "eur";

  const chartRows = useMemo(() => {
    if (!snap?.series?.length) return [];
    return snap.series.map((row, i) => ({
      d: row.d,
      v: row.v,
      prevV: snap.seriesPrev[i]?.v ?? 0,
    }));
  }, [snap]);

  const aovCur =
    snap && snap.orders > 0 ? snap.revenue / snap.orders : null;
  const aovPrev =
    snap && snap.ordersPrev > 0 ? snap.revenuePrev / snap.ordersPrev : null;
  const aovDelta =
    aovCur !== null && aovPrev !== null && aovPrev > 0
      ? ((aovCur - aovPrev) / aovPrev) * 100
      : null;

  const showOrders =
    layout === "analytics" && recentOrders && recentOrders.length > 0;
  const showStripeCallout =
    layout === "analytics" && !stripeChargesEnabled;

  const panelTitle = layout === "home" ? "Revenu" : "Ventes";

  return (
    <div className="space-y-6">
      {showStripeCallout ? (
        <div className="rounded-[var(--creo-dashboard-card-radius)] border border-[#e3e5e8] bg-[#fafbfb] px-4 py-3 text-[13px] text-[#202223] dark:border-[var(--creo-dashboard-border)] dark:bg-white/[0.04] dark:text-white">
          <span className="text-[#616161] dark:text-creo-gray-500">
            Encaissement Stripe inactif pour ce workspace. Les ventes
            n’apparaîtront qu’après activation.{" "}
          </span>
          <Link
            href="/dashboard/settings?section=payment-gateways"
            className="font-medium text-[#2563eb] underline-offset-2 hover:underline dark:text-blue-400"
          >
            Passerelles de paiement
          </Link>
        </div>
      ) : null}

      {/* Titre + périodes : hors carte (les KPI ont déjà leurs propres encadrés) */}
      <div className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold text-[#202223] dark:text-white">
            {panelTitle}
          </h2>
          {layout === "home" ? (
            <p className="mt-1 text-[12px] text-[#616161] dark:text-creo-gray-500">
              Même source et mêmes périodes que dans Analytics.
            </p>
          ) : null}
        </div>
        <div className="flex flex-shrink-0 flex-wrap gap-1">
          {PERIOD_TABS.map(({ key, label }) => (
            <Button
              key={key}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setPeriod(key)}
              className={cn(
                "h-8 rounded-md border px-2.5 text-[14px] font-medium",
                period === key
                  ? "border-[#e3e5e8] bg-[var(--creo-dashboard-canvas)] text-[#202223] dark:border-[var(--creo-dashboard-border)] dark:bg-white/[0.08] dark:text-white"
                  : "border-transparent text-[#616161] hover:bg-black/[0.04] dark:text-creo-gray-500 dark:hover:bg-white/[0.06]",
              )}
            >
              {label}
            </Button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {snap ? (
          <>
            <MetricCard
              label={`CA (${periodSalesLabel(period)})`}
              value={fmtMoney(snap.revenue, currency)}
              deltaPct={deltaPct(snap.revenue, snap.revenuePrev)}
            />
            <MetricCard
              label="Commandes payées"
              value={fmtCount(snap.orders)}
              deltaPct={deltaPct(snap.orders, snap.ordersPrev)}
            />
            <MetricCard
              label="Panier moyen"
              value={aovCur !== null ? fmtMoney(aovCur, currency) : "—"}
              deltaPct={
                typeof aovDelta === "number" && Number.isFinite(aovDelta)
                  ? aovDelta
                  : null
              }
            />
          </>
        ) : (
          <>
            <MetricCard label="CA" value="—" />
            <MetricCard label="Commandes payées" value="—" />
            <MetricCard label="Panier moyen" value="—" />
          </>
        )}
      </div>

      {sales?.hasMixedCurrency ? (
        <p className="text-[12px] text-[#8c9196] dark:text-creo-gray-500">
          Devises multiples : les montants utilisent la devise la plus fréquente (
          {currency.toUpperCase()}).
        </p>
      ) : null}

      {/* Graphique d’évolution : seul bloc encadré type « dashboard statistique » */}
      <Card className="border-[#e3e5e8] shadow-none dark:border-[var(--creo-dashboard-border)]">
        <CardHeader className="pb-2 pt-5">
          <CardTitle className="text-[13px] font-medium text-[#616161] dark:text-creo-gray-500">
            {layout === "home"
              ? "Évolution du CA"
              : "Évolution du chiffre d’affaires"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 pb-5 pt-0">
          <RevenueChart
            appearance={chartAppearance}
            series={chartRows}
            dataLabel="Période en cours"
            comparisonLabel="Période préc."
          />
          {chartRows.length > 0 ? (
            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] text-[#616161] dark:text-creo-gray-500">
              <span className="flex items-center gap-2">
                <span className="inline-block h-px w-6 bg-[#2563eb]" aria-hidden />
                Période en cours
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-6 border-t border-dashed border-[#9ca3af]"
                  aria-hidden
                />
                Période précédente
              </span>
            </div>
          ) : null}
        </CardContent>
      </Card>

      {showOrders ? (
        <Card className="border-[#e3e5e8] shadow-none dark:border-[var(--creo-dashboard-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-semibold text-[#202223] dark:text-white">
              Dernières commandes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-[#e3e5e8] dark:divide-[var(--creo-dashboard-border)]">
              {recentOrders!.map((o) => (
                <li
                  key={o.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3 text-[13px]"
                >
                  <span className="font-medium text-[#202223] dark:text-white">
                    {orderProductLabel(o.product_type)}
                  </span>
                  <span className="text-right">
                    <span className="font-semibold text-[#202223] dark:text-white">
                      {fmtOrderMoney(Number(o.amount), o.currency)}
                    </span>
                    <span className="ml-2 text-[12px] text-[#8c9196] dark:text-[#737373]">
                      {fmtOrderWhen(o.created_at)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
