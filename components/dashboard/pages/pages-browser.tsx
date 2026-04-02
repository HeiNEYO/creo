"use client";

import { LayoutGrid, List, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { NewPageDialog } from "@/components/dashboard/pages/new-page-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export type DashboardPageRow = {
  id: string;
  title: string;
  type: string;
  published: boolean;
  views: number;
  updated_at: string;
};

const typeLabels: Record<string, string> = {
  landing: "Landing",
  sales: "Vente",
  optin: "Opt-in",
  thankyou: "Merci",
  checkout: "Checkout",
  custom: "Libre",
};

function formatViews(n: number): string {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function formatUpdated(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

type Filter = "all" | "landing" | "draft";

export function PagesBrowser({ pages }: { pages: DashboardPageRow[] }) {
  const [view, setView] = useState<"grid" | "list">("grid");
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pages.filter((p) => {
      if (q && !p.title.toLowerCase().includes(q)) return false;
      if (filter === "landing" && p.type !== "landing") return false;
      if (filter === "draft" && p.published) return false;
      return true;
    });
  }, [pages, query, filter]);

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
          <Input
            className="pl-9"
            placeholder="Rechercher…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant={filter === "all" ? "outline" : "ghost"}
            size="sm"
            type="button"
            onClick={() => setFilter("all")}
          >
            Tout
          </Button>
          <Button
            variant={filter === "landing" ? "outline" : "ghost"}
            size="sm"
            type="button"
            onClick={() => setFilter("landing")}
          >
            Landing
          </Button>
          <Button
            variant={filter === "draft" ? "outline" : "ghost"}
            size="sm"
            type="button"
            onClick={() => setFilter("draft")}
          >
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

      {pages.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-creo-md font-medium text-creo-black">
            Aucune page pour l’instant
          </p>
          <p className="mt-2 max-w-sm text-creo-sm text-creo-gray-500">
            Crée ta première page pour l’éditer dans le builder.
          </p>
          <Button
            type="button"
            className="mt-6"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="size-4" />
            Nouvelle page
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="py-12 text-center text-creo-sm text-creo-gray-500">
          Aucun résultat pour ces filtres.
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <Link key={p.id} href={`/builder/${p.id}`} prefetch>
              <Card interactive className="h-full">
                <div className="relative aspect-[16/10] rounded-creo-md bg-creo-gray-100">
                  <div className="absolute right-2 top-2">
                    <Badge variant={p.published ? "green" : "gray"}>
                      {p.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-creo-md font-semibold text-creo-black">
                    {p.title}
                  </p>
                  <Badge variant="purple" className="mt-2">
                    {typeLabels[p.type] ?? p.type}
                  </Badge>
                  <p className="mt-3 text-creo-sm text-creo-gray-500">
                    {formatViews(p.views)} vues
                  </p>
                  <p className="mt-1 text-creo-xs text-creo-gray-400">
                    Modifié {formatUpdated(p.updated_at)}
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
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-creo-gray-100 hover:bg-creo-gray-50"
                >
                  <td className="px-4 py-3 font-medium">{p.title}</td>
                  <td className="px-4 py-3">{typeLabels[p.type] ?? p.type}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.published ? "green" : "gray"}>
                      {p.published ? "Publié" : "Brouillon"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">{formatViews(p.views)}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/builder/${p.id}`}
                      prefetch
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
