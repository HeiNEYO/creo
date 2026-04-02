"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RevenueChart = dynamic(
  () =>
    import("@/components/dashboard/revenue-chart").then((m) => m.RevenueChart),
  { ssr: false, loading: () => <div className="h-64 animate-pulse rounded-lg bg-creo-gray-100" /> }
);

export default function AnalyticsPage() {
  const [tab, setTab] = useState<"global" | "pages" | "courses" | "emails">(
    "global"
  );

  return (
    <>
      <PageHeader
        title="Analytics"
        description="Métriques façon Vercel — données de démo"
        action={
          <select className="rounded-creo-md border border-creo-gray-300 bg-white px-3 py-2 text-creo-sm">
            <option>7 derniers jours</option>
            <option>30 derniers jours</option>
            <option>90 derniers jours</option>
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
            className={`rounded-full px-4 py-1.5 text-creo-sm font-medium ${
              tab === key
                ? "bg-creo-purple-pale text-creo-purple"
                : "text-creo-gray-500 hover:bg-creo-gray-100"
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
              <CardTitle>Chiffre d’affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart />
            </CardContent>
          </Card>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ["CA total", "12 480 €"],
              ["Commandes", "48"],
              ["Panier moyen", "260 €"],
            ].map(([k, v]) => (
              <Card key={k} className="p-4">
                <p className="text-creo-sm text-creo-gray-500">{k}</p>
                <p className="mt-1 text-creo-xl font-semibold">{v}</p>
              </Card>
            ))}
          </div>
          <Card className="overflow-hidden p-0">
            <table className="w-full text-creo-sm">
              <thead className="bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500">
                <tr>
                  <th className="px-4 py-3 text-left">Source</th>
                  <th className="px-4 py-3 text-left">Visites</th>
                  <th className="px-4 py-3 text-left">Leads</th>
                  <th className="px-4 py-3 text-left">CA</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-creo-gray-100">
                  <td className="px-4 py-3">Meta Ads</td>
                  <td className="px-4 py-3">4 200</td>
                  <td className="px-4 py-3">312</td>
                  <td className="px-4 py-3">5 900 €</td>
                </tr>
                <tr className="border-t border-creo-gray-100">
                  <td className="px-4 py-3">Organique</td>
                  <td className="px-4 py-3">2 100</td>
                  <td className="px-4 py-3">89</td>
                  <td className="px-4 py-3">2 100 €</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </div>
      )}

      {tab !== "global" && (
        <Card className="p-8 text-center text-creo-sm text-creo-gray-500">
          Onglet « {tab} » — tableaux et détails à brancher sur les données
          réelles.
        </Card>
      )}
    </>
  );
}
