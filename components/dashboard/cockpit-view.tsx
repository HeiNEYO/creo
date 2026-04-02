"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import {
  DollarSign,
  GraduationCap,
  Sparkles,
  TrendingUp,
  UserPlus,
} from "lucide-react";

import { MetricCard } from "@/components/dashboard/metric-card";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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

const periodPresets = ["7j", "30j", "90j", "12m"] as const;

type WorkspaceInfo = {
  name: string;
  slug: string;
  plan: string;
} | null;

export function CockpitView({ workspace }: { workspace: WorkspaceInfo }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const chartAppearance =
    mounted && resolvedTheme === "dark" ? "auto" : "light";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-[#202223] dark:text-white md:text-[28px] md:leading-tight">
          Tableau de bord
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-[#616161] dark:text-[#a3a3a3] md:text-[15px]">
          Vue d’ensemble de ton activité — même esprit que les admins SaaS
          modernes (Shopify, Polaris).
        </p>
        {workspace ? (
          <p className="mt-3 text-creo-sm text-[#616161] dark:text-[#a3a3a3]">
            Workspace{" "}
            <span className="font-semibold text-[#202223] dark:text-white">
              {workspace.name}
            </span>{" "}
            · /{workspace.slug} ·{" "}
            <Badge
              variant="outline"
              className="border-[#e3e5e8] bg-white font-medium text-[#202223] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-white"
            >
              {workspace.plan}
            </Badge>
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="CA du mois"
          value="4 280 €"
          icon={DollarSign}
          iconClassName="rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
          trend="▲ 23% vs mois dernier"
          trendPositive
        />
        <MetricCard
          label="Nouveaux contacts"
          value="147"
          icon={UserPlus}
          iconClassName="rounded-lg bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400"
          trend="▲ 12%"
          trendPositive
        />
        <MetricCard
          label="Élèves actifs"
          value="89"
          icon={GraduationCap}
          iconClassName="rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400"
          trend="▲ 8%"
          trendPositive
        />
        <MetricCard
          label="Taux de complétion"
          value="54%"
          icon={TrendingUp}
          iconClassName="rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
          trend="▼ 3% vs mois dernier"
          trendPositive={false}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="rounded-2xl lg:col-span-2">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 pb-2">
            <div>
              <CardTitle className="text-base font-semibold text-[#202223] dark:text-white">
                Chiffre d’affaires
              </CardTitle>
              <p className="mt-0.5 text-creo-sm text-[#616161] dark:text-[#a3a3a3]">
                Évolution sur la période sélectionnée
              </p>
            </div>
            <div className="flex flex-wrap gap-1">
              {periodPresets.map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 rounded-lg border px-2.5 text-xs font-medium",
                    p === "30j"
                      ? "border-[#e3e5e8] bg-[#ebebeb] text-[#202223] shadow-sm dark:border-[#2a2a2a] dark:bg-[#1f1f1f] dark:text-white"
                      : "border-transparent text-[#616161] hover:bg-black/[0.04] dark:text-[#a3a3a3] dark:hover:bg-white/[0.06]"
                  )}
                >
                  {p}
                </Button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <RevenueChart appearance={chartAppearance} />
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-[#202223] dark:text-white">
              Activité récente
            </CardTitle>
            <p className="text-creo-sm font-normal text-[#616161] dark:text-[#a3a3a3]">
              Dernières actions sur ton compte
            </p>
          </CardHeader>
          <CardContent className="space-y-0">
            {activities.map((a, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 py-4",
                  i < activities.length - 1 &&
                    "border-b border-[#e3e5e8] dark:border-[#2a2a2a]"
                )}
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#ebebeb] text-xs font-semibold text-[#616161] dark:bg-[#1f1f1f] dark:text-[#a3a3a3]">
                  {a.who
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-[#202223] dark:text-white">
                    <span className="font-semibold">{a.who}</span> {a.action}
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    {a.amount ? (
                      <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                        {a.amount}
                      </span>
                    ) : (
                      <span />
                    )}
                    <span className="text-xs text-[#8c9196] dark:text-[#737373]">
                      {a.when}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-[#e3e5e8] bg-[#fafbfb] dark:border-[#2a2a2a] dark:bg-[#101010]">
        <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-start">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-[#e3e5e8] dark:bg-[#1a1a1a] dark:ring-[#2a2a2a]">
            <Sparkles className="size-5 text-[#0033ff] dark:text-[#6688ff]" />
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <h2 className="text-base font-semibold text-[#202223] dark:text-white">
              Actions recommandées
            </h2>
            <p className="text-sm text-[#616161] dark:text-[#a3a3a3]">
              Pistes rapides — à traiter comme des rappels dans ton flux de
              travail.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="rounded-full border border-[#e3e5e8] bg-white px-3 py-1.5 text-left text-sm text-[#202223] shadow-sm transition-colors hover:border-[#c9cccf] hover:bg-[#f6f6f7] dark:border-[#2a2a2a] dark:bg-[#141414] dark:text-white dark:hover:border-[#3f3f3f] dark:hover:bg-[#1a1a1a]"
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
