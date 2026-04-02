"use client";

import { LayoutGrid, List, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { NewPageDialog } from "@/components/dashboard/pages/new-page-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const mockPages = [
  {
    id: "1",
    title: "Lancement printemps",
    type: "Landing",
    status: "published" as const,
    views: "1 240",
    conv: "4,2 %",
  },
  {
    id: "2",
    title: "Vente formation SEO",
    type: "Vente",
    status: "draft" as const,
    views: "892",
    conv: "2,1 %",
  },
  {
    id: "3",
    title: "Opt-in newsletter",
    type: "Opt-in",
    status: "published" as const,
    views: "3 102",
    conv: "18 %",
  },
];

export default function DashboardPagesPage() {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Pages"
        description="Crée des pages qui convertissent"
        action={
          <Button type="button" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Nouvelle page
          </Button>
        }
      />

      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-creo-gray-400" />
          <Input className="pl-9" placeholder="Rechercher…" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" type="button">
            Tout
          </Button>
          <Button variant="ghost" size="sm" type="button">
            Landing
          </Button>
          <Button variant="ghost" size="sm" type="button">
            Brouillon
          </Button>
          <div className="ml-2 flex rounded-creo-md border border-creo-gray-200 p-0.5">
            <button
              type="button"
              onClick={() => setView("grid")}
              className={`rounded-md p-1.5 ${view === "grid" ? "bg-creo-gray-100" : ""}`}
              aria-label="Grille"
            >
              <LayoutGrid className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={`rounded-md p-1.5 ${view === "list" ? "bg-creo-gray-100" : ""}`}
              aria-label="Liste"
            >
              <List className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {mockPages.map((p) => (
            <Link key={p.id} href={`/builder/${p.id}`}>
              <Card interactive className="h-full">
                <div className="relative aspect-[16/10] rounded-creo-md bg-creo-gray-100">
                  <div className="absolute right-2 top-2">
                    <Badge variant={p.status === "published" ? "green" : "gray"}>
                      {p.status === "published" ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-creo-md font-semibold text-creo-black">
                    {p.title}
                  </p>
                  <Badge variant="purple" className="mt-2">
                    {p.type}
                  </Badge>
                  <p className="mt-3 text-creo-sm text-creo-gray-500">
                    {p.views} vues · {p.conv} conversion
                  </p>
                  <p className="mt-1 text-creo-xs text-creo-gray-400">
                    Modifié aujourd’hui
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-creo-sm">
            <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
              <tr>
                <th className="px-4 py-3">Nom</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Vues</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockPages.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-creo-gray-100 hover:bg-creo-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">{p.type}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.status === "published" ? "green" : "gray"}>
                      {p.status === "published" ? "Publié" : "Brouillon"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{p.views}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/builder/${p.id}`}
                      className={buttonVariants({ variant: "ghost", size: "sm" })}
                    >
                      Éditer
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      <NewPageDialog open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
