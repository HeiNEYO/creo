"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

import type { DashboardStats } from "@/lib/analytics/get-dashboard-stats";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RevenueChart = dynamic(
  () =>
    import("@/components/dashboard/revenue-chart").then((m) => m.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-lg bg-creo-gray-100 dark:bg-muted/40" />
    ),
  }
);

function eur(n: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);
}

type Props = {
  stats: DashboardStats;
};

export function AnalyticsView({ stats }: Props) {
  const [tab, setTab] = useState<"global" | "pages" | "courses" | "emails">(
    "global"
  );

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Données de ton workspace (7 derniers jours pour les vues événements)"
        action={
          <select
            className="rounded-creo-md border border-creo-gray-300 bg-creo-white px-3 py-2 text-creo-sm text-creo-black dark:border-input dark:bg-background dark:text-foreground"
            disabled
            aria-label="Période"
          >
            <option>7 derniers jours</option>
          </select>
        }
      />

      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["global", "Vue globale"],
            ["pages", "Pages"],
            ["courses", "Formations"],
            ["emails", "Emails"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`rounded-none px-4 py-1.5 text-creo-sm font-medium ${
              tab === key
                ? "bg-creo-purple-pale text-creo-purple"
                : "text-creo-gray-500 hover:bg-creo-gray-100 dark:hover:bg-muted/50"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "global" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vues (événements analytics)</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart
                appearance="light"
                series={stats.viewsSeries}
                dataLabel="Vues"
                valueSuffix=""
                valueIsInteger
              />
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["CA (commandes payées)", eur(stats.revenueTotal)],
              ["Commandes payées", String(stats.ordersCount)],
              ["Panier moyen", stats.ordersCount ? eur(stats.avgBasket) : "—"],
            ].map(([k, v]) => (
              <Card key={k} className="p-4">
                <p className="text-creo-sm text-creo-gray-500">{k}</p>
                <p className="mt-1 text-creo-xl font-semibold">{v}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Contacts", String(stats.contactsCount)],
              ["Pages", String(stats.pagesCount)],
              ["Vues pages (total)", String(stats.pageViewsTotal)],
            ].map(([k, v]) => (
              <Card key={k} className="p-4">
                <p className="text-creo-sm text-creo-gray-500">{k}</p>
                <p className="mt-1 text-creo-xl font-semibold">{v}</p>
              </Card>
            ))}
          </div>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-creo-sm">
              <thead className="bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500 dark:bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left">Type d’événement</th>
                  <th className="px-4 py-3 text-left">7 jours</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-creo-gray-100 dark:border-border">
                  <td className="px-4 py-3">Vues</td>
                  <td className="px-4 py-3">{stats.eventCounts.view}</td>
                </tr>
                <tr className="border-t border-creo-gray-100 dark:border-border">
                  <td className="px-4 py-3">Clics</td>
                  <td className="px-4 py-3">{stats.eventCounts.click}</td>
                </tr>
                <tr className="border-t border-creo-gray-100 dark:border-border">
                  <td className="px-4 py-3">Conversions</td>
                  <td className="px-4 py-3">{stats.eventCounts.conversion}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab === "pages" && (
        <div className="space-y-6">
          <Card className="overflow-hidden p-0">
            <div className="border-b border-creo-gray-100 px-4 py-3 dark:border-border">
              <CardTitle className="text-creo-md">Pages les plus vues</CardTitle>
            </div>
            <table className="w-full text-creo-sm">
              <thead className="bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500 dark:bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left">Titre</th>
                  <th className="px-4 py-3 text-left">Vues</th>
                </tr>
              </thead>
              <tbody>
                {stats.topPages.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-creo-gray-500" colSpan={2}>
                      Aucune page pour l’instant.
                    </td>
                  </tr>
                ) : (
                  stats.topPages.map((p) => (
                    <tr
                      key={p.id}
                      className="border-t border-creo-gray-100 dark:border-border"
                    >
                      <td className="px-4 py-3">{p.title}</td>
                      <td className="px-4 py-3">{p.views}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
          <Card className="p-6">
            <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
              Pages publiées : {stats.publishedPagesCount}. URL publique :{" "}
              <code className="text-creo-xs">/p/&#123;slug-workspace&#125;/&#123;slug-page&#125;</code>
            </p>
            <Link
              href="/dashboard/pages"
              className={buttonVariants({ className: "mt-4 inline-flex" })}
            >
              Gérer les pages
            </Link>
          </Card>
        </div>
      )}

      {tab === "courses" && (
        <Card className="p-6">
          <CardTitle className="text-creo-md">Formations</CardTitle>
          <p className="mt-2 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
            Inscriptions et complétion par formation : prochaine évolution. Va dans
            Formations pour créer du contenu.
          </p>
          <Link
            href="/dashboard/courses"
            className={buttonVariants({ className: "mt-6 inline-flex" })}
          >
            Ouvrir Formations
          </Link>
        </Card>
      )}

      {tab === "emails" && (
        <Card className="p-6">
          <CardTitle className="text-creo-md">Emails</CardTitle>
          <p className="mt-2 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
            Les stats d’ouverture/clic dépendront de ton ESP (ex. Resend webhooks).
            Édite et envoie des tests depuis une campagne.
          </p>
          <Link
            href="/dashboard/emails"
            className={buttonVariants({ className: "mt-6 inline-flex" })}
          >
            Ouvrir Emails
          </Link>
        </Card>
      )}
    </>
  );
}
