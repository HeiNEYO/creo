"use client";

import { Plus, Search, Upload } from "lucide-react";
import { useState } from "react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const rows = [
  {
    id: "1",
    email: "marie@exemple.com",
    name: "Marie Laurent",
    tags: ["acheteur", "seo"],
    source: "Facebook Ads",
    date: "12 mars 2025",
    status: "subscribed" as const,
  },
  {
    id: "2",
    email: "tom@exemple.com",
    name: "Thomas K.",
    tags: ["lead"],
    source: "Formulaire",
    date: "10 mars 2025",
    status: "subscribed" as const,
  },
];

export default function ContactsPage() {
  const [openId, setOpenId] = useState<string | null>(null);
  const selected = rows.find((r) => r.id === openId);

  return (
    <>
      <PageHeader
        title="Contacts"
        description="1 247 contacts (données de démo)"
        action={
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm">
              <Upload className="size-4" />
              Importer CSV
            </Button>
            <Button type="button" size="sm">
              <Plus className="size-4" />
              Ajouter
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-creo-gray-400" />
          <Input className="pl-9" placeholder="Email, nom…" />
        </div>
        <Button type="button" variant="ghost" size="sm">
          Tags
        </Button>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-left text-creo-sm">
          <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
            <tr>
              <th className="w-10 px-4 py-3">
                <input type="checkbox" aria-label="Tout" />
              </th>
              <th className="px-4 py-3">Contact</th>
              <th className="hidden px-4 py-3 md:table-cell">Tags</th>
              <th className="hidden px-4 py-3 lg:table-cell">Source</th>
              <th className="px-4 py-3">Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className={cn(
                  "cursor-pointer border-b border-creo-gray-100 hover:bg-creo-gray-50",
                  openId === r.id && "bg-creo-purple-pale/40"
                )}
                onClick={() => setOpenId(r.id)}
              >
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <input type="checkbox" aria-label={r.email} />
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-creo-black">{r.name}</p>
                  <p className="text-creo-xs text-creo-gray-500">{r.email}</p>
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <div className="flex flex-wrap gap-1">
                    {r.tags.map((t) => (
                      <Badge key={t} variant="purple">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </td>
                <td className="hidden px-4 py-3 lg:table-cell">
                  <Badge variant="gray">{r.source}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="green">Abonné</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Drawer */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md border-l border-creo-gray-200 bg-creo-white shadow-creo-modal transition-transform duration-200",
          openId ? "translate-x-0" : "translate-x-full"
        )}
      >
        {selected ? (
          <div className="flex h-full flex-col">
            <div className="flex items-start justify-between border-b border-creo-gray-100 p-6">
              <div className="flex gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-creo-purple-pale text-lg font-semibold text-creo-purple">
                  {selected.name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")}
                </div>
                <div>
                  <h2 className="text-creo-md font-semibold">{selected.name}</h2>
                  <p className="text-creo-sm text-creo-gray-500">
                    {selected.email}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="rounded-md p-1 text-creo-gray-500 hover:bg-creo-gray-100"
                onClick={() => setOpenId(null)}
                aria-label="Fermer"
              >
                ×
              </button>
            </div>
            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <section>
                <h3 className="text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
                  Informations
                </h3>
                <div className="mt-3 space-y-2">
                  <Input defaultValue={selected.name} />
                  <Input defaultValue={selected.email} />
                </div>
              </section>
              <section>
                <h3 className="text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
                  Formations
                </h3>
                <p className="mt-2 text-creo-sm text-creo-gray-500">
                  Aucun achat enregistré (démo).
                </p>
              </section>
              <section>
                <h3 className="text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
                  Activité
                </h3>
                <ul className="mt-3 space-y-2 border-l-2 border-creo-gray-100 pl-4 text-creo-sm text-creo-gray-600">
                  <li>Inscription — {selected.date}</li>
                </ul>
              </section>
            </div>
            <div className="border-t border-creo-gray-100 p-4">
              <Button type="button" className="w-full">
                Envoyer un email
              </Button>
            </div>
          </div>
        ) : null}
      </div>
      {openId ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px]"
          aria-label="Fermer le panneau"
          onClick={() => setOpenId(null)}
        />
      ) : null}
    </>
  );
}
