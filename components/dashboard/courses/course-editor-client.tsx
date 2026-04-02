"use client";

import {
  ChevronDown,
  FileText,
  GripVertical,
  Headphones,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";

import {
  createCourseLessonServer,
  createCourseModuleServer,
  deleteCourseLessonServer,
  deleteCourseModuleServer,
  updateCourseLessonServer,
  updateCourseModuleServer,
  updateCourseServer,
} from "@/lib/courses/actions";
import type { CourseLessonDTO, CourseStructureDTO } from "@/lib/courses/types";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type CourseEditorCourse = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  price: number;
  currency: string;
};

function lessonIcon(type: CourseLessonDTO["content_type"]) {
  switch (type) {
    case "video":
      return Video;
    case "audio":
      return Headphones;
    case "pdf":
      return FileText;
    default:
      return FileText;
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

function ModuleTitleField({
  moduleId,
  courseId,
  initialTitle,
}: {
  moduleId: string;
  courseId: string;
  initialTitle: string;
}) {
  const router = useRouter();
  const [v, setV] = useState(initialTitle);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setV(initialTitle);
  }, [initialTitle]);

  const save = useCallback(() => {
    const t = v.trim();
    if (!t || t === initialTitle.trim()) return;
    startTransition(async () => {
      const res = await updateCourseModuleServer({
        moduleId,
        courseId,
        title: t,
      });
      if (res.ok) router.refresh();
    });
  }, [v, initialTitle, moduleId, courseId, router]);

  return (
    <Input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={save}
      disabled={pending}
      className="h-8 border-creo-gray-200 text-creo-sm font-medium dark:border-border"
    />
  );
}

function LessonEditorPanel({
  courseId,
  lesson,
  onRequestDelete,
}: {
  courseId: string;
  lesson: CourseLessonDTO;
  onRequestDelete?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [title, setTitle] = useState(lesson.title);
  const [contentType, setContentType] =
    useState<CourseLessonDTO["content_type"]>(lesson.content_type);
  const [contentText, setContentText] = useState(lesson.content_text ?? "");
  const [contentUrl, setContentUrl] = useState(lesson.content_url ?? "");
  const [duration, setDuration] = useState(
    lesson.duration != null ? String(lesson.duration) : ""
  );
  const [freePreview, setFreePreview] = useState(lesson.is_free_preview);

  useEffect(() => {
    setTitle(lesson.title);
    setContentType(lesson.content_type);
    setContentText(lesson.content_text ?? "");
    setContentUrl(lesson.content_url ?? "");
    setDuration(lesson.duration != null ? String(lesson.duration) : "");
    setFreePreview(lesson.is_free_preview);
    setMsg(null);
  }, [lesson]);

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await updateCourseLessonServer({
        lessonId: lesson.id,
        courseId,
        title,
        content_type: contentType,
        content_text: contentText || null,
        content_url: contentUrl.trim() || null,
        duration: duration.trim() ? parseInt(duration, 10) : null,
        is_free_preview: freePreview,
      });
      if (res.ok) {
        setMsg("Enregistré.");
        router.refresh();
      } else {
        setMsg(res.error);
      }
    });
  }

  return (
    <div className="space-y-4">
      {msg ? (
        <p
          className={cn(
            "text-creo-sm",
            msg === "Enregistré." ? "text-emerald-600" : "text-red-600"
          )}
        >
          {msg}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label>Titre de la leçon</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Type de contenu</Label>
        <select
          value={contentType}
          onChange={(e) =>
            setContentType(e.target.value as CourseLessonDTO["content_type"])
          }
          className="flex h-9 w-full max-w-xs rounded-creo-md border border-creo-gray-300 bg-creo-white px-3 text-creo-sm dark:border-input dark:bg-background"
        >
          <option value="text">Texte</option>
          <option value="video">Vidéo</option>
          <option value="pdf">PDF</option>
          <option value="audio">Audio</option>
        </select>
      </div>
      {(contentType === "video" ||
        contentType === "audio" ||
        contentType === "pdf") && (
        <div className="space-y-2">
          <Label>URL (fichier ou embed)</Label>
          <Input
            value={contentUrl}
            onChange={(e) => setContentUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
      )}
      {contentType === "text" && (
        <div className="space-y-2">
          <Label>Contenu texte</Label>
          <Textarea
            rows={12}
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            placeholder="Contenu Markdown ou texte brut…"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <Label>Durée (minutes)</Label>
          <Input
            type="number"
            min={0}
            className="w-28"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>
        <label className="mt-8 flex cursor-pointer items-center gap-2 text-creo-sm">
          <input
            type="checkbox"
            checked={freePreview}
            onChange={(e) => setFreePreview(e.target.checked)}
            className="size-4 rounded border-creo-gray-300"
          />
          Aperçu gratuit
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer la leçon"}
        </Button>
        {onRequestDelete ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={pending}
            onClick={onRequestDelete}
          >
            <Trash2 className="size-3.5" />
            Supprimer la leçon
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function CourseSettingsPanel({ course }: { course: CourseEditorCourse }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [price, setPrice] = useState(String(course.price));
  const [currency, setCurrency] = useState((course.currency ?? "eur").toLowerCase());

  useEffect(() => {
    setTitle(course.title);
    setDescription(course.description ?? "");
    setPrice(String(course.price));
    setCurrency((course.currency ?? "eur").toLowerCase());
  }, [course]);

  function saveMeta() {
    setError(null);
    const p = parseFloat(price.replace(",", "."));
    if (Number.isNaN(p) || p < 0) {
      setError("Prix invalide.");
      return;
    }
    startTransition(async () => {
      const res = await updateCourseServer({
        courseId: course.id,
        title,
        description: description.trim() || null,
        price: p,
        currency,
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function setStatus(next: "draft" | "published") {
    setError(null);
    startTransition(async () => {
      const res = await updateCourseServer({
        courseId: course.id,
        status: next,
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <Card className="space-y-4 p-6">
      <div className="space-y-2">
        <Label>Titre</Label>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label>Description</Label>
        <Textarea
          rows={4}
          placeholder="Résumé visible sur la boutique…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="flex flex-wrap gap-4">
        <div className="space-y-2">
          <Label>Prix</Label>
          <Input
            type="text"
            inputMode="decimal"
            className="w-32"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Devise</Label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="flex h-9 w-full rounded-creo-md border border-creo-gray-300 bg-creo-white px-3 text-creo-sm dark:border-input dark:bg-background"
          >
            <option value="eur">EUR</option>
            <option value="usd">USD</option>
          </select>
        </div>
      </div>
      {error ? <p className="text-creo-sm text-red-600">{error}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={saveMeta} disabled={pending}>
          {pending ? "…" : "Enregistrer"}
        </Button>
        {course.status !== "published" ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setStatus("published")}
            disabled={pending}
          >
            Publier la formation
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStatus("draft")}
            disabled={pending}
          >
            Repasser en brouillon
          </Button>
        )}
      </div>
    </Card>
  );
}

export function CourseEditorClient({
  course,
  structure,
}: {
  course: CourseEditorCourse;
  structure: CourseStructureDTO;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"content" | "settings" | "students">(
    "content"
  );
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [structPending, startStructTransition] = useTransition();

  const lessonsFlat = useMemo(
    () =>
      structure.modules.flatMap((m) =>
        m.lessons.map((l) => ({ ...l, moduleTitle: m.title }))
      ),
    [structure.modules]
  );

  useEffect(() => {
    setSelectedLessonId((prev) => {
      if (prev && lessonsFlat.some((l) => l.id === prev)) return prev;
      return lessonsFlat[0]?.id ?? null;
    });
  }, [lessonsFlat]);

  const selectedLesson = findLesson(structure, selectedLessonId);

  const toggleModule = (id: string) => {
    setExpanded((e) => ({ ...e, [id]: e[id] === false ? true : !e[id] }));
  };

  const addModule = () => {
    startStructTransition(async () => {
      const res = await createCourseModuleServer({ courseId: course.id });
      if (res.ok) router.refresh();
    });
  };

  const addLesson = (moduleId: string) => {
    startStructTransition(async () => {
      const res = await createCourseLessonServer({
        moduleId,
        courseId: course.id,
      });
      if (res.ok) {
        setSelectedLessonId(res.id);
        router.refresh();
      }
    });
  };

  const removeModule = (moduleId: string) => {
    if (
      !window.confirm(
        "Supprimer ce module et toutes ses leçons ? Cette action est définitive."
      )
    ) {
      return;
    }
    startStructTransition(async () => {
      const res = await deleteCourseModuleServer({
        moduleId,
        courseId: course.id,
      });
      if (res.ok) {
        router.refresh();
      } else {
        window.alert(res.error);
      }
    });
  };

  const removeLesson = (lessonId: string) => {
    if (
      !window.confirm(
        "Supprimer cette leçon ? Cette action est définitive."
      )
    ) {
      return;
    }
    startStructTransition(async () => {
      const res = await deleteCourseLessonServer({
        lessonId,
        courseId: course.id,
      });
      if (res.ok) {
        if (selectedLessonId === lessonId) setSelectedLessonId(null);
        router.refresh();
      } else {
        window.alert(res.error);
      }
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 space-y-3 lg:w-[280px]">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-creo-sm font-semibold text-creo-black dark:text-foreground">
            Structure
          </h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1"
            onClick={addModule}
            disabled={structPending}
          >
            <Plus className="size-3.5" />
            Module
          </Button>
        </div>
        <Card className="space-y-2 p-3">
          {structure.modules.length === 0 ? (
            <p className="text-creo-xs text-creo-gray-500">
              Aucun module. Ajoute un module pour commencer.
            </p>
          ) : (
            structure.modules.map((mod) => {
              const open = expanded[mod.id] !== false;
              return (
                <div key={mod.id} className="rounded-creo-md border border-creo-gray-100 dark:border-border">
                  <div className="flex items-center gap-1 p-2">
                    <button
                      type="button"
                      onClick={() => toggleModule(mod.id)}
                      className="rounded p-1 text-creo-gray-500 hover:bg-creo-gray-100 dark:hover:bg-muted/50"
                      aria-expanded={open}
                    >
                      <ChevronDown
                        className={cn("size-4 transition-transform", !open && "-rotate-90")}
                      />
                    </button>
                    <GripVertical className="size-3.5 shrink-0 text-creo-gray-400" />
                    <div className="min-w-0 flex-1">
                      <ModuleTitleField
                        moduleId={mod.id}
                        courseId={course.id}
                        initialTitle={mod.title}
                      />
                    </div>
                    <Button
                      type="button"
                      size="icon-xs"
                      variant="ghost"
                      className="text-creo-gray-400 hover:text-red-600"
                      aria-label="Supprimer le module"
                      onClick={() => removeModule(mod.id)}
                      disabled={structPending}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                  {open && (
                    <div className="border-t border-creo-gray-100 px-2 pb-2 pt-1 dark:border-border">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mb-2 w-full gap-1 text-creo-xs"
                        onClick={() => addLesson(mod.id)}
                        disabled={structPending}
                      >
                        <Plus className="size-3" />
                        Leçon
                      </Button>
                      <ul className="space-y-0.5">
                        {mod.lessons.map((les) => {
                          const Icon = lessonIcon(les.content_type);
                          const active = les.id === selectedLessonId;
                          return (
                            <li
                              key={les.id}
                              className={cn(
                                "flex items-center gap-1 rounded-md pr-1",
                                active
                                  ? "bg-creo-purple-pale text-creo-purple dark:bg-accent/30"
                                  : "hover:bg-creo-gray-50 dark:hover:bg-muted/40"
                              )}
                            >
                              <button
                                type="button"
                                onClick={() => setSelectedLessonId(les.id)}
                                className="flex min-w-0 flex-1 items-center gap-2 px-2 py-1.5 text-left text-creo-sm"
                              >
                                <Icon className="size-3.5 shrink-0 opacity-80" />
                                <span className="truncate">{les.title}</span>
                              </button>
                              <Button
                                type="button"
                                size="icon-xs"
                                variant="ghost"
                                className="shrink-0 text-creo-gray-400 hover:text-red-600"
                                aria-label="Supprimer la leçon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeLesson(les.id);
                                }}
                                disabled={structPending}
                              >
                                <Trash2 className="size-3" />
                              </Button>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </Card>
      </aside>

      <main className="min-w-0 flex-1 space-y-4">
        <div className="flex flex-wrap items-center gap-2 border-b border-creo-gray-200 pb-4 dark:border-border">
          <Badge variant={course.status === "published" ? "green" : "gray"}>
            {course.status === "published" ? "Publié" : "Brouillon"}
          </Badge>
          {(
            [
              ["content", "Leçon"],
              ["settings", "Paramètres formation"],
              ["students", "Élèves"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={cn(
                "rounded-none px-3 py-1 text-creo-sm font-medium transition-colors",
                tab === key
                  ? "bg-creo-purple-pale text-creo-purple"
                  : "text-creo-gray-500 hover:bg-creo-gray-100 dark:hover:bg-muted/50"
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "content" && (
          <>
            {!selectedLesson ? (
              <Card className="p-8 text-center text-creo-sm text-creo-gray-500">
                {structure.modules.length === 0
                  ? "Crée un module puis une leçon pour éditer le contenu."
                  : "Sélectionne une leçon dans la colonne de gauche."}
              </Card>
            ) : (
              <Card className="p-6">
                <LessonEditorPanel
                  courseId={course.id}
                  lesson={selectedLesson}
                  onRequestDelete={() => removeLesson(selectedLesson.id)}
                />
              </Card>
            )}
          </>
        )}

        {tab === "settings" && <CourseSettingsPanel course={course} />}

        {tab === "students" && (
          <Card className="overflow-hidden p-0">
            <table className="w-full text-creo-sm">
              <thead className="bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500 dark:bg-muted/40">
                <tr>
                  <th className="px-4 py-3 text-left">Élève</th>
                  <th className="px-4 py-3 text-left">Progression</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-creo-gray-100 dark:border-border">
                  <td className="px-4 py-3 text-creo-gray-500" colSpan={2}>
                    Aucun élève inscrit pour l’instant.
                  </td>
                </tr>
              </tbody>
            </table>
          </Card>
        )}
      </main>

      <aside className="w-full shrink-0 space-y-4 lg:w-[260px]">
        <Card className="p-4">
          <h3 className="text-creo-sm font-semibold">Résumé</h3>
          <dl className="mt-3 space-y-2 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
            <div>
              <dt className="text-creo-xs text-creo-gray-400">Prix</dt>
              <dd>
                {new Intl.NumberFormat("fr-FR", {
                  style: "currency",
                  currency: (course.currency ?? "eur").toUpperCase(),
                }).format(Number(course.price))}
              </dd>
            </div>
            <div>
              <dt className="text-creo-xs text-creo-gray-400">Modules</dt>
              <dd>{structure.modules.length}</dd>
            </div>
            <div>
              <dt className="text-creo-xs text-creo-gray-400">Leçons</dt>
              <dd>{lessonsFlat.length}</dd>
            </div>
          </dl>
        </Card>
        <Link
          href="/dashboard/courses"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          ← Retour aux formations
        </Link>
      </aside>
    </div>
  );
}
