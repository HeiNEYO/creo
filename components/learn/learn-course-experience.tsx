"use client";

import {
  ArrowLeft,
  BookOpen,
  ChevronRight,
  ExternalLink,
  FileText,
  Headphones,
  List,
  Lock,
  Play,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";

import { CourseThumbnail } from "@/components/dashboard/courses/course-thumbnail";
import { Button } from "@/components/ui/button";
import type { CourseLessonDTO, CourseStructureDTO } from "@/lib/courses/types";
import { cn } from "@/lib/utils";

export type LearnCourseMeta = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  currency: string;
  compare_at_price: number | null;
  status: string;
  slug: string | null;
  access_type: string;
};

function formatMoney(amount: number, currency: string): string {
  const cur = (currency || "eur").toUpperCase();
  try {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: cur }).format(
      amount
    );
  } catch {
    return `${amount} ${currency}`;
  }
}

function lessonIcon(type: CourseLessonDTO["content_type"]) {
  switch (type) {
    case "video":
      return Video;
    case "audio":
      return Headphones;
    case "pdf":
      return FileText;
    default:
      return BookOpen;
  }
}

function findLesson(
  structure: CourseStructureDTO,
  lessonId: string | null
): CourseLessonDTO | null {
  if (!lessonId) return null;
  for (const m of structure.modules) {
    const l = m.lessons.find((x) => x.id === lessonId);
    if (l) return l;
  }
  return null;
}

function LessonContent({ lesson }: { lesson: CourseLessonDTO }) {
  if (lesson.content_type === "text") {
    return (
      <div
        className="prose prose-neutral dark:prose-invert max-w-none text-creo-base leading-relaxed"
        style={{ whiteSpace: "pre-wrap" }}
      >
        {lesson.content_text?.trim()
          ? lesson.content_text
          : "Contenu texte à venir ou vide pour cette leçon."}
      </div>
    );
  }

  const url = lesson.content_url?.trim();
  if (!url) {
    return (
      <p className="text-creo-sm text-creo-gray-500">
        Aucune URL renseignée pour ce média.
      </p>
    );
  }

  if (lesson.content_type === "video") {
    const yt =
      /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/.exec(url);
    if (yt?.[1]) {
      return (
        <div className="overflow-hidden rounded-xl border border-creo-gray-200 bg-black shadow-sm dark:border-border">
          <div className="aspect-video w-full">
            <iframe
              title="Vidéo"
              src={`https://www.youtube.com/embed/${yt[1]}`}
              className="size-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      );
    }
    return (
      <div className="space-y-3">
        <div className="flex aspect-video max-h-[min(60vh,520px)] items-center justify-center rounded-xl bg-zinc-950">
          <Button type="button" variant="secondary" className="gap-2" asChild>
            <a href={url} target="_blank" rel="noopener noreferrer">
              <Play className="size-5 fill-current" />
              Ouvrir la vidéo
            </a>
          </Button>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-creo-sm text-[var(--creo-blue)] hover:underline"
        >
          <ExternalLink className="size-3.5" />
          {url}
        </a>
      </div>
    );
  }

  if (lesson.content_type === "audio") {
    return (
      <div className="rounded-xl border border-creo-gray-200 bg-creo-gray-50 p-6 dark:border-border dark:bg-muted/30">
        <audio controls className="w-full max-w-lg" src={url}>
          <track kind="captions" />
        </audio>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-creo-xs text-creo-gray-500 hover:text-[var(--creo-blue)]"
        >
          <ExternalLink className="size-3" />
          Fichier audio
        </a>
      </div>
    );
  }

  /* pdf */
  return (
    <div className="space-y-3">
      <Button type="button" variant="outline" className="gap-2" asChild>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <FileText className="size-4" />
          Ouvrir le PDF
        </a>
      </Button>
    </div>
  );
}

export function LearnCourseExperience({
  variant,
  course,
  structure,
  backHref = "/dashboard/courses",
}: {
  variant: "preview" | "public";
  course: LearnCourseMeta;
  structure: CourseStructureDTO;
  backHref?: string;
}) {
  const lessonsFlat = useMemo(
    () =>
      structure.modules.flatMap((m) =>
        m.lessons.map((l) => ({ lesson: l, moduleTitle: m.title }))
      ),
    [structure.modules]
  );

  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    () => lessonsFlat[0]?.lesson.id ?? null
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const selectedLesson = findLesson(structure, selectedLessonId);
  const currentIndex = selectedLesson
    ? lessonsFlat.findIndex((x) => x.lesson.id === selectedLesson.id)
    : -1;
  const prevLesson = currentIndex > 0 ? lessonsFlat[currentIndex - 1] : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < lessonsFlat.length - 1
      ? lessonsFlat[currentIndex + 1]
      : null;

  const progressPct =
    lessonsFlat.length > 0
      ? Math.round(((currentIndex + 1) / lessonsFlat.length) * 100)
      : 0;

  const showTarif =
    course.access_type === "paid" && Number.isFinite(Number(course.price)) && Number(course.price) > 0;
  const compareOk =
    course.compare_at_price != null &&
    Number.isFinite(course.compare_at_price) &&
    course.compare_at_price > Number(course.price);

  const selectLesson = useCallback((id: string) => {
    setSelectedLessonId(id);
    setMobileNavOpen(false);
  }, []);

  const sidebar = (
    <nav
      className={cn(
        "flex w-full shrink-0 flex-col border-creo-gray-200 bg-white dark:border-border dark:bg-card",
        "lg:w-[300px] lg:border-r",
        mobileNavOpen ? "fixed inset-0 z-40 flex lg:relative lg:inset-auto" : "hidden lg:flex"
      )}
      aria-label="Programme de la formation"
    >
      <div className="flex items-center justify-between border-b border-creo-gray-100 p-4 lg:hidden dark:border-border">
        <span className="text-creo-sm font-semibold">Programme</span>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="size-9"
          onClick={() => setMobileNavOpen(false)}
          aria-label="Fermer"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="mb-4">
          <p className="text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
            Progression
          </p>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-creo-gray-100 dark:bg-muted">
            <div
              className="h-full rounded-full bg-[var(--creo-blue)] transition-[width] duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="mt-1 text-center text-creo-xs text-creo-gray-500">
            Leçon {Math.max(0, currentIndex + 1)} / {lessonsFlat.length}
          </p>
        </div>

        {structure.modules.length === 0 ? (
          <p className="text-creo-sm text-creo-gray-500">Aucun module dans cette formation.</p>
        ) : (
          <div className="space-y-5">
            {structure.modules.map((mod, mi) => (
              <div key={mod.id}>
                <p className="text-creo-xs font-semibold uppercase tracking-wide text-creo-gray-400">
                  Module {mi + 1}
                </p>
                <p className="text-creo-sm font-medium text-creo-black dark:text-foreground">
                  {mod.title}
                </p>
                <ul className="mt-2 space-y-0.5">
                  {mod.lessons.map((les) => {
                    const Icon = lessonIcon(les.content_type);
                    const active = les.id === selectedLessonId;
                    return (
                      <li key={les.id}>
                        <button
                          type="button"
                          onClick={() => selectLesson(les.id)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg px-2 py-2.5 text-left text-creo-sm transition-colors",
                            active
                              ? "bg-[var(--creo-purple-pale)] font-medium text-[var(--creo-blue)] dark:bg-accent/30 dark:text-[var(--creo-blue-readable)]"
                              : "text-creo-gray-700 hover:bg-creo-gray-50 dark:text-muted-foreground dark:hover:bg-muted/50"
                          )}
                        >
                          <Icon className="size-4 shrink-0 opacity-70" aria-hidden />
                          <span className="min-w-0 flex-1 truncate">{les.title}</span>
                          {les.is_free_preview ? (
                            <span className="shrink-0 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-900 dark:bg-amber-950/50 dark:text-amber-200">
                              Aperçu
                            </span>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <div className="flex min-h-[calc(100vh-57px)] flex-col bg-[var(--creo-dashboard-canvas)] dark:bg-background">
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-creo-gray-200 bg-white/95 px-3 backdrop-blur-sm dark:border-border dark:bg-card/95 md:px-5">
        {variant === "preview" ? (
          <Button type="button" size="sm" variant="outline" className="gap-1.5" asChild>
            <Link href={backHref}>
              <ArrowLeft className="size-4" />
              Éditeur
            </Link>
          </Button>
        ) : (
          <Link
            href="/dashboard"
            className="text-creo-xs font-medium text-creo-gray-500 hover:text-[var(--creo-blue)] md:text-creo-sm"
          >
            ← Espace créateur
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-creo-sm font-semibold text-creo-black dark:text-foreground">
            {course.title}
          </p>
          {variant === "preview" ? (
            <p className="hidden text-creo-xs text-amber-700 dark:text-amber-300/90 sm:block">
              Aperçu — rendu proche de l’expérience élève (accès complet sans paiement ici).
            </p>
          ) : null}
        </div>
        <div className="hidden h-2 max-w-[160px] flex-1 rounded-full bg-creo-gray-100 md:block lg:max-w-[220px] dark:bg-muted">
          <div
            className="h-full rounded-full bg-[var(--creo-blue)] transition-[width]"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {showTarif ? (
          <div className="hidden shrink-0 items-center gap-2 rounded-full border border-creo-gray-200 bg-white px-3 py-1.5 text-creo-xs font-medium shadow-sm sm:flex dark:border-border dark:bg-card">
            {compareOk ? (
              <>
                <span className="text-creo-gray-400 line-through">
                  {formatMoney(course.compare_at_price!, course.currency)}
                </span>
                <span className="text-creo-purple dark:text-[var(--creo-blue-readable)]">
                  {formatMoney(Number(course.price), course.currency)}
                </span>
              </>
            ) : (
              <span className="text-creo-black dark:text-foreground">
                {formatMoney(Number(course.price), course.currency)}
              </span>
            )}
          </div>
        ) : course.access_type === "free" ? (
          <span className="hidden shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-creo-xs font-medium text-emerald-800 sm:inline dark:bg-emerald-950/40 dark:text-emerald-200">
            Gratuit
          </span>
        ) : null}
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5 lg:hidden"
          onClick={() => setMobileNavOpen(true)}
        >
          <List className="size-4" />
          Programme
        </Button>
      </header>

      <div className="flex min-h-0 flex-1">
        {mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            aria-label="Fermer le programme"
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}
        {sidebar}

        <main className="flex min-w-0 flex-1 flex-col">
          {!selectedLesson ? (
            <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
              <BookOpen className="size-12 text-creo-gray-300 dark:text-muted-foreground" />
              <p className="mt-4 text-creo-sm font-medium text-creo-gray-700 dark:text-foreground">
                Sélectionne une leçon dans le programme
              </p>
            </div>
          ) : (
            <>
              <div className="border-b border-creo-gray-100 bg-white px-4 py-6 dark:border-border dark:bg-card md:px-8">
                <div className="mx-auto max-w-3xl">
                  {course.thumbnail_url ? (
                    <div className="mb-6 overflow-hidden rounded-xl border border-creo-gray-100 dark:border-border">
                      <div className="aspect-[21/9] max-h-48 w-full">
                        <CourseThumbnail
                          title={course.title}
                          thumbnailUrl={course.thumbnail_url}
                          className="h-full w-full rounded-none"
                        />
                      </div>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-start gap-3">
                    <h1 className="text-creo-2xl font-semibold tracking-tight text-creo-black dark:text-foreground">
                      {selectedLesson.title}
                    </h1>
                    {selectedLesson.is_free_preview ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-creo-xs font-medium text-amber-900 dark:bg-amber-950/60 dark:text-amber-200">
                        <Sparkles className="size-3" />
                        Aperçu gratuit
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-creo-gray-100 px-2.5 py-0.5 text-creo-xs text-creo-gray-600 dark:bg-muted dark:text-muted-foreground">
                        <Lock className="size-3" />
                        Contenu réservé aux inscrits en production
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-creo-xs text-creo-gray-500">
                    {selectedLesson.content_type === "video"
                      ? "Vidéo"
                      : selectedLesson.content_type === "audio"
                        ? "Audio"
                        : selectedLesson.content_type === "pdf"
                          ? "PDF"
                          : "Texte"}
                    {selectedLesson.duration != null && selectedLesson.duration > 0
                      ? ` · ~${selectedLesson.duration} min`
                      : ""}
                  </p>
                </div>
              </div>
              <div className="flex-1 bg-white px-4 py-8 dark:border-border dark:bg-card md:px-8">
                <div className="mx-auto max-w-3xl">
                  <LessonContent lesson={selectedLesson} />
                </div>
              </div>
              <div className="border-t border-creo-gray-100 bg-creo-gray-50/80 px-4 py-5 dark:border-border dark:bg-muted/20 md:px-8">
                <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!prevLesson}
                    className="gap-1"
                    onClick={() => prevLesson && selectLesson(prevLesson.lesson.id)}
                  >
                    <ChevronRight className="size-4 rotate-180" />
                    Précédente
                  </Button>
                  <Button
                    type="button"
                    disabled={!nextLesson}
                    className="gap-1"
                    onClick={() => nextLesson && selectLesson(nextLesson.lesson.id)}
                  >
                    Suivante
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
