"use client";

import { useState } from "react";

import type { CockpitUnifiedMetrics } from "@/lib/analytics/get-cockpit-hero-metrics";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TabId = "contacts" | "pageViews" | "sales";

const TABS: {
  id: TabId;
  title: string;
  shortTitle: string;
}[] = [
  { id: "contacts", title: "Contacts acquis", shortTitle: "Contacts" },
  { id: "pageViews", title: "Pages vues", shortTitle: "Vues" },
  { id: "sales", title: "Ventes (commandes)", shortTitle: "Ventes" },
];

function fmtInt(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function TrendInline({ pct }: { pct: number | null }) {
  if (pct === null) {
    return (
      <span className="mt-1 block text-[14px] font-medium text-[#8c9196] dark:text-creo-gray-500">
        —
      </span>
    );
  }
  const up = pct >= 0;
  return (
    <span
      className={cn(
        "mt-1 inline-flex items-center gap-0.5 text-[15px] font-semibold tabular-nums",
        up
          ? "text-[color:var(--creo-dashboard-trend-positive)]"
          : "text-[color:var(--creo-dashboard-trend-negative)]",
      )}
    >
      <span aria-hidden>{up ? "↗" : "↘"}</span>
      {Math.abs(pct).toFixed(1)} %
      <span className="ml-0.5 text-[13px] font-normal text-[#8c9196] dark:text-creo-gray-500">
        vs mois dernier
      </span>
    </span>
  );
}

export function CockpitUnifiedChart({
  metrics,
}: {
  metrics: CockpitUnifiedMetrics | null;
}) {
  const [tab, setTab] = useState<TabId>("contacts");

  if (!metrics) {
    return null;
  }

  const active =
    tab === "contacts"
      ? metrics.contacts
      : tab === "pageViews"
        ? metrics.pageViews
        : metrics.sales;

  const chartData = active.series;

  return (
    <Card className="overflow-hidden border-[#e3e5e8] shadow-none dark:border-[var(--creo-dashboard-border)]">
      <CardContent className="p-0">
        <div className="grid grid-cols-1 gap-2 border-b border-[#e3e5e8] p-4 sm:grid-cols-3 sm:gap-3 dark:border-[var(--creo-dashboard-border)]">
          {TABS.map(({ id, title, shortTitle }) => {
            const data =
              id === "contacts"
                ? metrics.contacts
                : id === "pageViews"
                  ? metrics.pageViews
                  : metrics.sales;
            const selected = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={cn(
                  "flex flex-col rounded-xl border px-4 py-3 text-left transition-colors",
                  selected
                    ? "border-[#e3e5e8] bg-[var(--creo-dashboard-canvas)] dark:border-[var(--creo-dashboard-border)] dark:bg-white/[0.06]"
                    : "border-transparent bg-transparent hover:bg-black/[0.03] dark:hover:bg-white/[0.04]",
                )}
              >
                <span className="text-[14px] font-medium text-[#616161] dark:text-creo-gray-500 sm:text-[15px]">
                  <span className="sm:hidden">{shortTitle}</span>
                  <span className="hidden sm:inline">{title}</span>
                </span>
                <span className="mt-1.5 text-[24px] font-semibold leading-none tracking-tight text-[#202223] dark:text-white sm:text-[26px]">
                  {fmtInt(data.monthTotal)}
                </span>
                <TrendInline pct={data.pctMoM} />
              </button>
            );
          })}
        </div>

        <div className="pt-5 sm:pt-6">
          <p className="mb-3 px-4 text-[12px] font-medium text-[#616161] dark:text-creo-gray-500 sm:px-6">
            {tab === "contacts"
              ? "Nouveaux contacts — 7 derniers jours"
              : tab === "pageViews"
                ? "Événements « vue » — 7 derniers jours"
                : "Commandes payées — 7 derniers jours"}
          </p>
          <RevenueChart
            appearance="light"
            series={chartData}
            dataLabel="Période en cours"
            comparisonLabel="7 j. précédents"
            valueSuffix=""
            valueIsInteger
            emptyLabel="Aucune donnée sur la période."
            smoothCurve
            fullWidth
          />
          {chartData.length > 0 ? (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-6 px-4 pb-4 text-[11px] text-[#616161] dark:text-creo-gray-500 sm:px-6 sm:pb-6">
              <span className="flex items-center gap-2">
                <span className="inline-block h-px w-6 bg-[#2563eb]" aria-hidden />
                Période en cours
              </span>
              <span className="flex items-center gap-2">
                <span
                  className="inline-block w-6 border-t border-dashed border-[#9ca3af]"
                  aria-hidden
                />
                Fenêtre précédente (alignée jour à jour)
              </span>
            </div>
          ) : null}
          {tab === "sales" && metrics.hasMixedOrderCurrency ? (
            <p className="mt-3 px-4 text-[11px] text-[#8c9196] dark:text-creo-gray-500 sm:px-6">
              Les commandes en devises différentes sont toutes comptées ; le détail CA par devise est
              dans Analytics.
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
