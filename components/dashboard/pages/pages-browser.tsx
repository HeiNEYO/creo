"use client";

import { ExternalLink, Plus, Search } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { DeletePageButton } from "@/components/dashboard/pages/delete-page-button";
import { NewPageDialog } from "@/components/dashboard/pages/new-page-dialog";
import { PagePreviewThumb } from "@/components/dashboard/pages/page-preview-thumb";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type DashboardPageRow = {
  id: string;
  title: string;
  type: string;
  published: boolean;
  views: number;
  updated_at: string;
  slug: string;
  /** URL absolue ou relative vers la page publique (paramètre aperçu dashboard, sans compter les vues). */
  previewUrl: string | null;
  /** URL de la page publique (sans `creo_preview`) pour ouvrir dans un nouvel onglet. */
  publicViewUrl: string | null;
};

const typeLabels: Record<string, string> = {
  landing: "Landing",
  sales: "Vente",
  optin: "Opt-in",
  thankyou: "Merci",
  checkout: "Checkout",
  custom: "Libre",
  upsell: "Upsell",
  webinar: "Webinaire",
  blog: "Blog",
  membership: "Adhésion",
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
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pages.filter((p) => {
      if (q) {
        const inTitle = p.title.toLowerCase().includes(q);
        const inSlug = p.slug.toLowerCase().includes(q);
        if (!inTitle && !inSlug) return false;
      }
      if (filter === "landing" && p.type !== "landing") return false;
      if (filter === "draft" && p.published) return false;
      return true;
    });
  }, [pages, query, filter]);

  return (
    <>
      <PageHeader
        title="Site"
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
            placeholder="Rechercher par titre ou slug…"
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
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((p) => (
            <Card
              key={p.id}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-stretch sm:gap-4"
            >
              <Link
                href={`/builder/${p.id}`}
                prefetch
                className="group flex min-w-0 flex-1 gap-3 sm:gap-4"
              >
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md">
                  <PagePreviewThumb
                    previewUrl={p.previewUrl}
                    title={p.title}
                    published={p.published}
                    compact
                    aspectClassName="h-full w-full"
                  />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-creo-md font-semibold text-creo-black group-hover:underline dark:text-zinc-100">
                      {p.title}
                    </p>
                    <Badge variant={p.published ? "green" : "gray"}>
                      {p.published ? "Publié" : "Brouillon"}
                    </Badge>
                    <Badge variant="outline" className="border-zinc-200/80 dark:border-zinc-600">
                      {typeLabels[p.type] ?? p.type}
                    </Badge>
                  </div>
                  {p.slug ? (
                    <p className="mt-1 truncate text-creo-xs text-creo-gray-400" title={p.slug}>
                      /{p.slug}
                    </p>
                  ) : null}
                  <p className="mt-2 text-creo-sm text-creo-gray-500">
                    {formatViews(p.views)} vues · modifié {formatUpdated(p.updated_at)}
                  </p>
                </div>
              </Link>

              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-creo-gray-100 pt-3 dark:border-zinc-800 sm:flex-col sm:justify-center sm:border-t-0 sm:pt-0">
                {p.publicViewUrl ? (
                  <a
                    href={p.publicViewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      buttonVariants({ variant: "outline", size: "sm" }),
                      "gap-1.5"
                    )}
                  >
                    <ExternalLink className="size-3.5 shrink-0" aria-hidden />
                    Voir en ligne
                  </a>
                ) : null}
                <Link
                  href={`/builder/${p.id}`}
                  prefetch
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Éditer
                </Link>
                <DeletePageButton pageId={p.id} title={p.title} label="Supprimer" />
              </div>
            </Card>
          ))}
        </div>
      )}

      <NewPageDialog open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
