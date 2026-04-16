"use client";

import {
  BookOpen,
  GraduationCap,
  Layers,
  Library,
  Plus,
  Search,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { CourseThumbnail } from "@/components/dashboard/courses/course-thumbnail";
import { DeleteCourseButton } from "@/components/dashboard/courses/delete-course-button";
import { NewCourseDialog } from "@/components/dashboard/courses/new-course-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type CourseBandRow = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  currency: string;
  status: string;
  access_type: string;
  created_at: string;
  moduleCount: number;
  lessonCount: number;
};

function formatPrice(amount: number, currency: string | null | undefined): string {
  const cur = (currency ?? "eur").toUpperCase();
  const code = cur === "EUR" ? "EUR" : cur;
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `${amount} ${currency ?? ""}`;
  }
}

function formatListedDate(iso: string): string {
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
  } catch {
    return "";
  }
}

const accessLabels: Record<string, string> = {
  paid: "Payant",
  free: "Gratuit",
  members_only: "Membres",
};

type StatusFilter = "all" | "published" | "draft";
type SortKey = "recent" | "title" | "price-asc" | "price-desc";

const FILTER_TABS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "published", label: "Publiées" },
  { key: "draft", label: "Brouillons" },
];

export function CoursesDashboard({ courses }: { courses: CourseBandRow[] }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  const stats = useMemo(() => {
    const published = courses.filter((c) => c.status === "published").length;
    const draft = courses.filter((c) => c.status !== "published").length;
    const lessons = courses.reduce((a, c) => a + c.lessonCount, 0);
    return {
      total: courses.length,
      published,
      draft,
      lessons,
    };
  }, [courses]);

  const filteredSorted = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = courses.filter((c) => {
      if (statusFilter === "published" && c.status !== "published") return false;
      if (statusFilter === "draft" && c.status === "published") return false;
      if (!q) return true;
      const title = (c.title || "").toLowerCase();
      const desc = (c.description || "").toLowerCase();
      return title.includes(q) || desc.includes(q);
    });

    const sorted = [...list];
    switch (sortKey) {
      case "title":
        sorted.sort((a, b) =>
          (a.title || "").localeCompare(b.title || "", "fr", { sensitivity: "base" })
        );
        break;
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "recent":
      default:
        sorted.sort((a, b) => {
          const ta = new Date(a.created_at).getTime();
          const tb = new Date(b.created_at).getTime();
          return tb - ta;
        });
    }
    return sorted;
  }, [courses, query, statusFilter, sortKey]);

  return (
    <>
      <div className="mb-6 space-y-1">
        <h1 className="text-creo-xl font-semibold tracking-tight text-creo-black dark:text-foreground">
          Formations
        </h1>
        <p className="max-w-2xl text-creo-sm leading-relaxed text-creo-gray-600 dark:text-muted-foreground">
          Organise ton catalogue : programme modulaire, leçons multimédia, tarification et publication.
          Utilise la recherche et les filtres pour retrouver une formation rapidement.
        </p>
      </div>

      <PageHeader
        action={
          <Button type="button" className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Nouvelle formation
          </Button>
        }
      />

      {/* Indicateurs */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-creo-gray-200/90 p-4 shadow-[var(--creo-shadow-card-rest)] dark:!border-white/[0.12]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[var(--creo-purple-pale)] text-[var(--creo-blue)] dark:bg-accent/30">
              <Library className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-creo-2xl font-semibold tabular-nums text-creo-black dark:text-foreground">
                {stats.total}
              </p>
              <p className="text-creo-xs font-medium text-creo-gray-500">Formations</p>
            </div>
          </div>
        </Card>
        <Card className="border-creo-gray-200/90 p-4 shadow-[var(--creo-shadow-card-rest)] dark:!border-white/[0.12]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
              <Sparkles className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-creo-2xl font-semibold tabular-nums text-creo-black dark:text-foreground">
                {stats.published}
              </p>
              <p className="text-creo-xs font-medium text-creo-gray-500">Publiées</p>
            </div>
          </div>
        </Card>
        <Card className="border-creo-gray-200/90 p-4 shadow-[var(--creo-shadow-card-rest)] dark:!border-white/[0.12]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-creo-gray-100 text-creo-gray-700 dark:bg-muted dark:text-foreground">
              <GraduationCap className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-creo-2xl font-semibold tabular-nums text-creo-black dark:text-foreground">
                {stats.draft}
              </p>
              <p className="text-creo-xs font-medium text-creo-gray-500">Brouillons</p>
            </div>
          </div>
        </Card>
        <Card className="border-creo-gray-200/90 p-4 shadow-[var(--creo-shadow-card-rest)] dark:!border-white/[0.12]">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
              <BookOpen className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-creo-2xl font-semibold tabular-nums text-creo-black dark:text-foreground">
                {stats.lessons}
              </p>
              <p className="text-creo-xs font-medium text-creo-gray-500">Leçons au total</p>
            </div>
          </div>
        </Card>
      </div>

      {courses.length === 0 ? (
        <Card className="flex flex-col items-center justify-center border-dashed border-creo-gray-300 bg-creo-gray-50/30 py-16 text-center dark:border-border dark:bg-muted/10">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-[var(--creo-purple-pale)] text-[var(--creo-blue)] dark:bg-accent/25">
            <Library className="size-7" aria-hidden />
          </div>
          <p className="mt-5 text-creo-md font-semibold text-creo-black dark:text-foreground">
            Aucune formation pour l’instant
          </p>
          <p className="mt-2 max-w-md text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
            Crée ta première formation : tu pourras ajouter des modules, des leçons (texte, vidéo,
            audio, PDF) et définir prix et visibilité dans l’éditeur.
          </p>
          <ul className="mt-4 max-w-sm space-y-1.5 text-left text-creo-xs text-creo-gray-500 dark:text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-[var(--creo-blue)]" aria-hidden>
                •
              </span>
              Structure pédagogique claire par modules
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--creo-blue)]" aria-hidden>
                •
              </span>
              Aperçu gratuit possible par leçon
            </li>
            <li className="flex gap-2">
              <span className="text-[var(--creo-blue)]" aria-hidden>
                •
              </span>
              Publication / brouillon en un clic
            </li>
          </ul>
          <Button
            type="button"
            className="mt-8 gap-2"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="size-4" />
            Nouvelle formation
          </Button>
        </Card>
      ) : (
        <>
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative min-w-0 flex-1 lg:max-w-md">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-creo-gray-400"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Rechercher par titre ou description…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="h-11 rounded-xl border-creo-gray-200 pl-10 dark:border-border"
                aria-label="Rechercher une formation"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="sr-only">Trier</span>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className={cn(
                  "h-11 rounded-xl border border-creo-gray-200 bg-white px-3 text-creo-sm text-creo-black",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--creo-ring-brand)]",
                  "dark:border-border dark:bg-background dark:text-foreground"
                )}
                aria-label="Trier les formations"
              >
                <option value="recent">Plus récentes</option>
                <option value="title">Titre (A → Z)</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          <div
            className="mb-5 flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filtrer par statut"
          >
            {FILTER_TABS.map(({ key, label }) => {
              const active = statusFilter === key;
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setStatusFilter(key)}
                  className={cn(
                    "rounded-full px-4 py-2 text-creo-sm font-medium transition-colors",
                    active
                      ? "bg-[var(--creo-blue)] text-white shadow-sm dark:bg-[var(--creo-blue)]"
                      : "bg-creo-gray-100 text-creo-gray-700 hover:bg-creo-gray-200 dark:bg-muted dark:text-foreground dark:hover:bg-muted/80"
                  )}
                >
                  {label}
                  {key === "all" ? (
                    <span className="ml-1.5 tabular-nums opacity-90">({stats.total})</span>
                  ) : key === "published" ? (
                    <span className="ml-1.5 tabular-nums opacity-90">({stats.published})</span>
                  ) : (
                    <span className="ml-1.5 tabular-nums opacity-90">({stats.draft})</span>
                  )}
                </button>
              );
            })}
          </div>

          {filteredSorted.length === 0 ? (
            <Card className="border-dashed p-10 text-center">
              <p className="text-creo-sm font-medium text-creo-gray-800 dark:text-foreground">
                Aucune formation ne correspond à ta recherche
              </p>
              <p className="mt-1 text-creo-xs text-creo-gray-500">
                Modifie les filtres ou le texte de recherche.
              </p>
              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                }}
              >
                Réinitialiser
              </Button>
            </Card>
          ) : (
            <ul className="space-y-4">
              {filteredSorted.map((c) => {
                const listed = formatListedDate(c.created_at);
                return (
                  <li key={c.id}>
                    <Card className="overflow-hidden border !border-creo-gray-200/95 shadow-[var(--creo-shadow-card-rest)] dark:!border-white/[0.12]">
                      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-stretch sm:gap-5 sm:p-5">
                        <Link
                          href={`/dashboard/courses/${c.id}`}
                          className="group flex min-w-0 flex-1 gap-4"
                        >
                          <div className="h-24 w-32 shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-36">
                            <CourseThumbnail
                              title={c.title || "?"}
                              thumbnailUrl={c.thumbnail_url}
                              className="h-full w-full"
                            />
                          </div>
                          <div className="min-w-0 flex-1 py-0.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h2 className="text-creo-md font-semibold text-creo-black group-hover:underline dark:text-foreground">
                                {c.title || "Sans titre"}
                              </h2>
                              <Badge variant={c.status === "published" ? "green" : "gray"}>
                                {c.status === "published" ? "Publié" : "Brouillon"}
                              </Badge>
                              <Badge
                                variant="outline"
                                className="border-zinc-200/80 dark:border-zinc-600"
                              >
                                {accessLabels[c.access_type] ?? c.access_type}
                              </Badge>
                            </div>
                            <p className="mt-1.5 line-clamp-2 text-creo-sm text-creo-gray-500 dark:text-muted-foreground">
                              {c.description?.trim() ? c.description : "Pas de description."}
                            </p>
                            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-creo-xs text-creo-gray-500 dark:text-muted-foreground">
                              <span className="inline-flex items-center gap-1.5">
                                <Layers className="size-3.5 shrink-0 opacity-70" aria-hidden />
                                <span>
                                  {c.moduleCount} module{c.moduleCount !== 1 ? "s" : ""}
                                </span>
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <BookOpen className="size-3.5 shrink-0 opacity-70" aria-hidden />
                                <span>
                                  {c.lessonCount} leçon{c.lessonCount !== 1 ? "s" : ""}
                                </span>
                              </span>
                              {listed ? (
                                <span className="text-creo-gray-400">Créée le {listed}</span>
                              ) : null}
                            </div>
                            <p className="mt-2 text-creo-sm font-semibold text-creo-gray-800 dark:text-foreground">
                              {formatPrice(c.price, c.currency)}
                            </p>
                          </div>
                        </Link>

                        <div className="flex shrink-0 items-center justify-end gap-2 border-t border-creo-gray-100 pt-4 dark:border-zinc-800 sm:w-auto sm:flex-col sm:justify-center sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0">
                          <Link
                            href={`/dashboard/courses/${c.id}`}
                            className={buttonVariants({ variant: "default", size: "sm" })}
                          >
                            Éditer
                          </Link>
                          <DeleteCourseButton
                            courseId={c.id}
                            title={c.title || "Sans titre"}
                            label="Supprimer"
                          />
                        </div>
                      </div>
                    </Card>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      <NewCourseDialog open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
