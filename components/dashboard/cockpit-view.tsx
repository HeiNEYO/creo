"use client";

import Link from "next/link";

import type { CockpitActivityItem } from "@/lib/analytics/get-recent-activity";
import type { CockpitUnifiedMetrics } from "@/lib/analytics/get-cockpit-hero-metrics";
import type { CockpitSalesPayload } from "@/lib/analytics/get-cockpit-sales";
import { SalesAnalyticsPanel } from "@/components/dashboard/analytics/sales-analytics-panel";
import { CockpitUnifiedChart } from "@/components/dashboard/cockpit-unified-chart";
import { SubscriptionStarterBanner } from "@/components/dashboard/subscription-starter-banner";
import { WorkspaceBootstrapBanner } from "@/components/dashboard/workspace-bootstrap-banner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type WorkspaceInfo = {
  name: string;
  slug: string;
  plan: string;
} | null;

function initialsFromHeadline(s: string): string {
  const parts = s.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

export function CockpitView({
  workspace,
  sales,
  heroMetrics,
  recentActivity,
  stripeChargesEnabled,
}: {
  workspace: WorkspaceInfo;
  sales: CockpitSalesPayload | null;
  heroMetrics: CockpitUnifiedMetrics | null;
  recentActivity?: CockpitActivityItem[] | null;
  stripeChargesEnabled: boolean;
}) {
  const showStarterBanner =
    workspace &&
    String(workspace.plan ?? "")
      .trim()
      .toLowerCase() === "starter";

  return (
    <div className="space-y-8">
      {!workspace ? <WorkspaceBootstrapBanner /> : null}
      {showStarterBanner ? <SubscriptionStarterBanner /> : null}

      {workspace ? <CockpitUnifiedChart metrics={heroMetrics} /> : null}

      <SalesAnalyticsPanel
        sales={sales}
        recentOrders={null}
        stripeChargesEnabled={stripeChargesEnabled}
        layout="home"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="border-[#e3e5e8] shadow-none dark:border-[var(--creo-dashboard-border)] lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-semibold text-[#202223] dark:text-white">
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {recentActivity && recentActivity.length > 0 ? (
              recentActivity.map((a, i) => (
                <div
                  key={a.id}
                  className={cn(
                    "flex gap-3 py-4",
                    i < recentActivity.length - 1 &&
                      "border-b border-[#e3e5e8] dark:border-[var(--creo-dashboard-border)]",
                  )}
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--creo-dashboard-canvas)] text-[11px] font-semibold text-[#616161] dark:bg-white/[0.06] dark:text-creo-gray-500">
                    {initialsFromHeadline(a.headline)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-[#202223] dark:text-white">
                      <span className="font-semibold">{a.headline}</span>
                      <span className="text-[#616161] dark:text-creo-gray-500">
                        {" "}
                        — {a.detail}
                      </span>
                    </p>
                    <p className="mt-1 text-[11px] text-[#8c9196] dark:text-[#737373]">
                      {a.when}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-[13px] text-[#8c9196] dark:text-creo-gray-500">
                Aucune activité récente.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#e3e5e8] shadow-none dark:border-[var(--creo-dashboard-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-[15px] font-semibold text-[#202223] dark:text-white">
              Raccourcis
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-[13px]">
            <Link
              href="/dashboard/pages"
              className="rounded-md px-2 py-2 text-[#2563eb] hover:bg-black/[0.04] dark:text-blue-400 dark:hover:bg-white/[0.06]"
            >
              Site
            </Link>
            <Link
              href="/dashboard/email-crm"
              className="rounded-md px-2 py-2 text-[#2563eb] hover:bg-black/[0.04] dark:text-blue-400 dark:hover:bg-white/[0.06]"
            >
              Email &amp; CRM
            </Link>
            <Link
              href="/dashboard/integrations"
              className="rounded-md px-2 py-2 text-[#2563eb] hover:bg-black/[0.04] dark:text-blue-400 dark:hover:bg-white/[0.06]"
            >
              Intégrations
            </Link>
            <Link
              href="/dashboard/settings"
              className="rounded-md px-2 py-2 text-[#2563eb] hover:bg-black/[0.04] dark:text-blue-400 dark:hover:bg-white/[0.06]"
            >
              Paramètres
            </Link>
          </CardContent>
        </Card>
      </div>

      <nav className="flex flex-wrap gap-x-3 gap-y-1 border-t border-[#e3e5e8] pt-6 text-[13px] dark:border-[var(--creo-dashboard-border)]">
        <Link
          href="/dashboard/pages"
          className="text-[#2563eb] hover:underline dark:text-blue-400"
        >
          Site
        </Link>
        <span className="text-[#c9cccf]" aria-hidden>
          ·
        </span>
        <Link
          href="/dashboard/email-crm"
          className="text-[#2563eb] hover:underline dark:text-blue-400"
        >
          Email &amp; CRM
        </Link>
        <span className="text-[#c9cccf]" aria-hidden>
          ·
        </span>
        <Link
          href="/dashboard/integrations"
          className="text-[#2563eb] hover:underline dark:text-blue-400"
        >
          Intégrations
        </Link>
        <span className="text-[#c9cccf]" aria-hidden>
          ·
        </span>
        <Link
          href="/dashboard/settings?section=payment-gateways"
          className="text-[#2563eb] hover:underline dark:text-blue-400"
        >
          Paiements
        </Link>
        <span className="text-[#c9cccf]" aria-hidden>
          ·
        </span>
        <Link
          href="/dashboard/settings"
          className="text-[#2563eb] hover:underline dark:text-blue-400"
        >
          Paramètres
        </Link>
      </nav>
    </div>
  );
}
