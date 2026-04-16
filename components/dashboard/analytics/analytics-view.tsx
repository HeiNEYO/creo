"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import type { ReactNode } from "react";

import type { CockpitOrderRow } from "@/lib/analytics/get-recent-orders";
import type { CockpitSalesPayload } from "@/lib/analytics/get-cockpit-sales";
import type { DashboardStats } from "@/lib/analytics/get-dashboard-stats";
import { SalesAnalyticsPanel } from "@/components/dashboard/analytics/sales-analytics-panel";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { emailCrmRoutes } from "@/lib/email-crm/routes";

const RevenueChart = dynamic(
  () =>
    import("@/components/dashboard/revenue-chart").then((m) => m.RevenueChart),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 animate-pulse rounded-[var(--creo-dashboard-card-radius)] bg-creo-gray-100 dark:bg-muted/40" />
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

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-4 text-[15px] font-semibold tracking-tight text-[#202223] dark:text-white">
      {children}
    </h2>
  );
}

type Props = {
  stats: DashboardStats;
  sales: CockpitSalesPayload | null;
  recentOrders: CockpitOrderRow[] | null;
  stripeChargesEnabled: boolean;
};

export function AnalyticsView({
  stats,
  sales,
  recentOrders,
  stripeChargesEnabled,
}: Props) {
  return (
    <div className="space-y-10 pb-8">
      <section>
        <SectionTitle>Ventes</SectionTitle>
        <SalesAnalyticsPanel
          sales={sales}
          recentOrders={recentOrders}
          stripeChargesEnabled={stripeChargesEnabled}
          layout="analytics"
        />
      </section>

      <section className="border-t border-[#e3e5e8] pt-10 dark:border-[var(--creo-dashboard-border)]">
        <SectionTitle>Contacts</SectionTitle>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Contacts (total)", String(stats.contactsCount)],
              ["Inscrits (email)", String(stats.contactsSubscribed)],
              ["Nouveaux (7 j.)", String(stats.contactsCreated7d)],
              ["Nouveaux (30 j.)", String(stats.contactsCreated30d)],
            ].map(([k, v]) => (
              <Card
                key={k}
                className="border-[#e3e5e8] p-4 shadow-none dark:border-[var(--creo-dashboard-border)]"
              >
                <p className="text-creo-sm text-creo-gray-500">{k}</p>
                <p className="mt-1 text-creo-xl font-semibold">{v}</p>
              </Card>
            ))}
          </div>
          <Card className="border-[#e3e5e8] shadow-none dark:border-[var(--creo-dashboard-border)]">
            <CardHeader>
              <CardTitle className="text-[15px]">Nouveaux contacts par jour</CardTitle>
              <p className="text-creo-sm font-normal text-creo-gray-500">
                7 derniers jours (création en base).
              </p>
            </CardHeader>
            <CardContent>
              <RevenueChart
                appearance="light"
                series={stats.contactsSeries}
                dataLabel="Nouveaux contacts"
                valueSuffix=""
                valueIsInteger
              />
            </CardContent>
          </Card>
          <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
            Segments et tags :{" "}
            <Link
              href={emailCrmRoutes.contacts}
              className="font-medium text-[#2563eb] underline-offset-2 hover:underline dark:text-blue-400"
            >
              module Contacts
            </Link>
            .
          </p>
        </div>
      </section>

      <section className="border-t border-[#e3e5e8] pt-10 dark:border-[var(--creo-dashboard-border)]">
        <SectionTitle>Trafic &amp; synthèse</SectionTitle>
        <div className="space-y-6">
          <Card className="border-[#e3e5e8] shadow-none dark:border-[var(--creo-dashboard-border)]">
            <CardHeader>
              <CardTitle className="text-[15px]">Vues (événements analytics)</CardTitle>
              <p className="text-creo-sm font-normal text-creo-gray-500">
                7 derniers jours.
              </p>
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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["CA (commandes payées, total)", eur(stats.revenueTotal)],
              ["Commandes payées (total)", String(stats.ordersCount)],
              ["Panier moyen (total)", stats.ordersCount ? eur(stats.avgBasket) : "—"],
            ].map(([k, v]) => (
              <Card
                key={k}
                className="border-[#e3e5e8] p-4 shadow-none dark:border-[var(--creo-dashboard-border)]"
              >
                <p className="text-creo-sm text-creo-gray-500">{k}</p>
                <p className="mt-1 text-creo-xl font-semibold">{v}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Pages", String(stats.pagesCount)],
              ["Pages publiées", String(stats.publishedPagesCount)],
              ["Vues pages (cumul)", String(stats.pageViewsTotal)],
            ].map(([k, v]) => (
              <Card
                key={k}
                className="border-[#e3e5e8] p-4 shadow-none dark:border-[var(--creo-dashboard-border)]"
              >
                <p className="text-creo-sm text-creo-gray-500">{k}</p>
                <p className="mt-1 text-creo-xl font-semibold">{v}</p>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              ["Formations (total)", String(stats.coursesTotal)],
              ["Inscriptions (total)", String(stats.enrollmentsTotal)],
            ].map(([k, v]) => (
              <Card
                key={k}
                className="border-[#e3e5e8] p-4 shadow-none dark:border-[var(--creo-dashboard-border)]"
              >
                <p className="text-creo-sm text-creo-gray-500">{k}</p>
                <p className="mt-1 text-creo-xl font-semibold">{v}</p>
              </Card>
            ))}
          </div>
          <Card className="overflow-hidden border-[#e3e5e8] p-0 shadow-none dark:border-[var(--creo-dashboard-border)]">
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
      </section>

      <section className="border-t border-[#e3e5e8] pt-10 dark:border-[var(--creo-dashboard-border)]">
        <SectionTitle>Pages</SectionTitle>
        <div className="space-y-6">
          <Card className="overflow-hidden border-[#e3e5e8] p-0 shadow-none dark:border-[var(--creo-dashboard-border)]">
            <div className="border-b border-creo-gray-100 px-4 py-3 dark:border-border">
              <CardTitle className="text-creo-md">Les plus vues</CardTitle>
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
          <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
            {stats.publishedPagesCount} page(s) publiée(s). URL :{" "}
            <code className="text-creo-xs">/p/&#123;slug-workspace&#125;/&#123;slug-page&#125;</code>
            .{" "}
            <Link
              href="/dashboard/pages"
              className="font-medium text-[#2563eb] underline-offset-2 hover:underline dark:text-blue-400"
            >
              Gérer les pages
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-[#e3e5e8] pt-10 dark:border-[var(--creo-dashboard-border)]">
        <SectionTitle>Formations</SectionTitle>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["Formations (total)", String(stats.coursesTotal)],
              ["Publiées", String(stats.coursesPublished)],
              ["Inscriptions", String(stats.enrollmentsTotal)],
            ].map(([k, v]) => (
              <Card
                key={k}
                className="border-[#e3e5e8] p-4 shadow-none dark:border-[var(--creo-dashboard-border)]"
              >
                <p className="text-creo-sm text-creo-gray-500">{k}</p>
                <p className="mt-1 text-creo-xl font-semibold">{v}</p>
              </Card>
            ))}
          </div>
          <Card className="overflow-hidden border-[#e3e5e8] p-0 shadow-none dark:border-[var(--creo-dashboard-border)]">
            <div className="border-b border-creo-gray-100 px-4 py-3 dark:border-border">
              <CardTitle className="text-creo-md">Les plus suivies</CardTitle>
              <p className="mt-1 text-creo-sm text-creo-gray-500">
                Par inscriptions (toutes périodes).
              </p>
            </div>
            <table className="w-full text-creo-sm">
              <thead className="bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500 dark:bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left">Formation</th>
                  <th className="px-4 py-3 text-left">Inscriptions</th>
                </tr>
              </thead>
              <tbody>
                {stats.topCoursesByEnrollments.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-creo-gray-500" colSpan={2}>
                      Aucune inscription pour l’instant.
                    </td>
                  </tr>
                ) : (
                  stats.topCoursesByEnrollments.map((c) => (
                    <tr
                      key={c.id}
                      className="border-t border-creo-gray-100 dark:border-border"
                    >
                      <td className="px-4 py-3">{c.title}</td>
                      <td className="px-4 py-3">{c.enrollments}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </Card>
          <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
            <Link
              href="/dashboard/courses"
              className="font-medium text-[#2563eb] underline-offset-2 hover:underline dark:text-blue-400"
            >
              Gérer les formations
            </Link>
          </p>
        </div>
      </section>

      <section className="border-t border-[#e3e5e8] pt-10 dark:border-[var(--creo-dashboard-border)]">
        <SectionTitle>Emails</SectionTitle>
        <Card className="border-[#e3e5e8] p-6 shadow-none dark:border-[var(--creo-dashboard-border)]">
          <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
            Les stats d’ouverture et de clic dépendront de ton ESP (ex. webhooks
            Resend). Édite et envoie des tests depuis une campagne.
          </p>
          <Link
            href="/dashboard/email-crm"
            className={buttonVariants({ className: "mt-4 inline-flex" })}
          >
            Ouvrir Emails
          </Link>
        </Card>
      </section>
    </div>
  );
}
