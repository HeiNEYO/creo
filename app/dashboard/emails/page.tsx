"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function EmailsPage() {
  const [tab, setTab] = useState<"campaigns" | "sequences">("campaigns");

  return (
    <>
      <PageHeader
        title="Email marketing"
        description="Style Loops — campagnes & séquences"
        action={
          <Button type="button" size="sm">
            <Plus className="size-4" />
            {tab === "campaigns" ? "Nouvelle campagne" : "Nouvelle séquence"}
          </Button>
        }
      />

      <div className="mb-6 flex gap-1 rounded-creo-md border border-creo-gray-200 p-1 w-fit">
        <button
          type="button"
          onClick={() => setTab("campaigns")}
          className={`rounded-md px-4 py-2 text-creo-sm font-medium ${
            tab === "campaigns"
              ? "bg-creo-purple-pale text-creo-purple"
              : "text-creo-gray-500"
          }`}
        >
          Campagnes
        </button>
        <button
          type="button"
          onClick={() => setTab("sequences")}
          className={`rounded-md px-4 py-2 text-creo-sm font-medium ${
            tab === "sequences"
              ? "bg-creo-purple-pale text-creo-purple"
              : "text-creo-gray-500"
          }`}
        >
          Séquences
        </button>
      </div>

      {tab === "campaigns" ? (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-creo-sm">
            <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Ouverture</th>
                <th className="px-4 py-3 text-left">Clic</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-creo-gray-100">
                <td className="px-4 py-3 font-medium">Lancement printemps</td>
                <td className="px-4 py-3">
                  <Badge variant="green">Envoyée</Badge>
                </td>
                <td className="px-4 py-3">42%</td>
                <td className="px-4 py-3">8%</td>
              </tr>
              <tr>
                <td className="px-4 py-3 font-medium">Relance paniers</td>
                <td className="px-4 py-3">
                  <Badge variant="gray">Brouillon</Badge>
                </td>
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">—</td>
              </tr>
            </tbody>
          </table>
        </Card>
      ) : (
        <Card className="p-6">
          <p className="text-creo-sm text-creo-gray-500">
            Éditeur visuel de séquences (flow trigger → emails) — prochaine
            itération.
          </p>
        </Card>
      )}
    </>
  );
}
