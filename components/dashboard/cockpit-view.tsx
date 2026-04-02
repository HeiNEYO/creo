"use client";

import dynamic from "next/dynamic";
import {
  DollarSign,
  GraduationCap,
  Sparkles,
  TrendingUp,
  UserPlus,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RevenueChart = dynamic(
  () =>
    import("@/components/dashboard/revenue-chart").then((m) => m.RevenueChart),
  { ssr: false, loading: () => <div className="h-[280px] animate-pulse rounded-creo-lg bg-creo-gray-100" /> }
);

const activities = [
  {
    who: "Marie L.",
    action: "a acheté Formation SEO",
    amount: "+297 €",
    when: "il y a 12 min",
  },
  {
    who: "Thomas K.",
    action: "s’est inscrit via Landing Ads",
    when: "il y a 1 h",
  },
  {
    who: "Sophie M.",
    action: "a terminé le module 3",
    when: "il y a 3 h",
  },
];

const suggestions = [
  "54% de complétion — relancer les élèves bloqués →",
  "3 visiteurs ont abandonné le checkout hier →",
  "Ton CPL Meta a augmenté de 18% →",
];

type WorkspaceInfo = {
  name: string;
  slug: string;
  plan: string;
} | null;

export function CockpitView({ workspace }: { workspace: WorkspaceInfo }) {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-creo-2xl font-semibold text-creo-black">
          Cockpit
        </h1>
        <p className="mt-1 text-creo-base text-creo-gray-500">
          Vue d’ensemble de ton activité — inspirée des dashboards modernes.
        </p>
        {workspace ? (
          <p className="mt-2 text-creo-sm text-creo-gray-500">
            Workspace{" "}
            <span className="font-medium text-creo-black">{workspace.name}</span>{" "}
            · /{workspace.slug} ·{" "}
            <Badge variant="purple">{workspace.plan}</Badge>
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="CA du mois"
          value="4 280 €"
          icon={DollarSign}
          iconClassName="bg-creo-success-pale text-[#059669]"
          trend="▲ 23% vs mois dernier"
          trendPositive
        />
        <MetricCard
          label="Nouveaux contacts"
          value="147"
          icon={UserPlus}
          iconClassName="bg-creo-info-pale text-[#2563eb]"
          trend="▲ 12%"
          trendPositive
        />
        <MetricCard
          label="Élèves actifs"
          value="89"
          icon={GraduationCap}
          iconClassName="bg-creo-purple-pale text-creo-purple"
          trend="▲ 8%"
          trendPositive
        />
        <MetricCard
          label="Taux de complétion"
          value="54%"
          icon={TrendingUp}
          iconClassName="bg-creo-warning-pale text-[#d97706]"
          trend="▼ 3% vs mois dernier"
          trendPositive={false}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>Chiffre d’affaires</CardTitle>
            <div className="flex gap-1">
              {["7j", "30j", "90j", "12m"].map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant={p === "30j" ? "secondary" : "ghost"}
                  size="sm"
                  className={
                    p === "30j"
                      ? "bg-creo-purple-pale text-creo-purple hover:bg-creo-purple-pale"
                      : ""
                  }
                >
                  {p}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-creo-md">Activité récente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activities.map((a, i) => (
              <div
                key={i}
                className="flex gap-3 border-b border-creo-gray-100 pb-4 last:border-0 last:pb-0"
              >
                <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-creo-gray-100 text-creo-xs font-semibold text-creo-gray-700">
                  {a.who
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-creo-sm text-creo-black">
                    <span className="font-medium">{a.who}</span> {a.action}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {a.amount ? (
                      <span className="text-creo-sm font-medium text-[#059669]">
                        {a.amount}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-creo-xs text-creo-gray-400">
                      {a.when}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="border-creo-purple-pale bg-creo-purple-pale/40">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-creo-md bg-creo-purple-pale text-creo-purple">
            <Sparkles className="size-5" />
          </div>
          <div className="flex-1 space-y-3">
            <h2 className="text-creo-md font-semibold text-creo-black">
              Actions recommandées
            </h2>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-full border border-creo-purple/20 bg-creo-white px-3 py-1.5 text-left text-creo-sm text-creo-purple transition-colors hover:border-creo-purple/40"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
