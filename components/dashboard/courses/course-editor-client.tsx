"use client";

import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ExternalLink,
  Eye,
  FileText,
  GraduationCap,
  Headphones,
  Layers,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  Users,
  Video,
  Wand2,
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
import { makeUniqueCourseSlug } from "@/lib/courses/slug";
import type { CourseLessonDTO, CourseStructureDTO } from "@/lib/courses/types";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export type CourseEditorCourse = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  price: number;
  currency: string;
  thumbnail_url: string | null;
  access_type: string;
  slug: string | null;
  compare_at_price: number | null;
};

const selectFieldClass =
  "flex h-9 w-full rounded-creo-md border border-creo-gray-300 bg-creo-white px-3 text-creo-base text-creo-black transition-colors duration-150 focus-visible:border-creo-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--creo-ring-brand)] disabled:cursor-not-allowed disabled:opacity-50 dark:border-input dark:bg-background";

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

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-creo-lg border border-creo-gray-200/80 bg-white/90 p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-border dark:bg-card/60">
      <div>
        <h3 className="text-creo-sm font-semibold text-creo-black dark:text-foreground">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 text-creo-xs leading-relaxed text-creo-gray-500">{description}</p>
        ) : null}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
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
      className="h-9 border-transparent bg-white/90 text-creo-sm font-medium shadow-none hover:border-creo-gray-200 focus-visible:border-creo-purple dark:bg-background/80"
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

  const typeLabels: Record<CourseLessonDTO["content_type"], string> = {
    text: "Texte",
    video: "Vidéo",
    pdf: "PDF",
    audio: "Audio",
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-creo-gray-100 pb-4 dark:border-border">
        <p className="text-creo-xs font-medium uppercase tracking-wide text-creo-gray-400">
          Leçon sélectionnée
        </p>
        <h2 className="mt-1 text-creo-lg font-semibold text-creo-black dark:text-foreground">
          {title.trim() || "Sans titre"}
        </h2>
      </div>

      {msg ? (
        <p
          className={cn(
            "rounded-md px-3 py-2 text-creo-sm",
            msg === "Enregistré."
              ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200"
          )}
          role="status"
        >
          {msg}
        </p>
      ) : null}

      <FormSection
        title="Informations"
        description="Titre affiché dans le programme et côté élève."
      >
        <div className="space-y-2">
          <Label htmlFor={`lesson-title-${lesson.id}`}>Titre de la leçon</Label>
          <Input
            id={`lesson-title-${lesson.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
      </FormSection>

      <FormSection
        title="Contenu pédagogique"
        description={
          contentType === "text"
            ? "Rédige le corps de la leçon (texte ou Markdown)."
            : "Indique l’URL du fichier hébergé ou du lecteur (embed)."
        }
      >
        <div className="space-y-2">
          <Label htmlFor={`lesson-type-${lesson.id}`}>Format</Label>
          <select
            id={`lesson-type-${lesson.id}`}
            value={contentType}
            onChange={(e) =>
              setContentType(e.target.value as CourseLessonDTO["content_type"])
            }
            className={cn(selectFieldClass, "max-w-xs")}
          >
            {(Object.keys(typeLabels) as CourseLessonDTO["content_type"][]).map((k) => (
              <option key={k} value={k}>
                {typeLabels[k]}
              </option>
            ))}
          </select>
        </div>
        {(contentType === "video" || contentType === "audio" || contentType === "pdf") && (
          <div className="space-y-2">
            <Label htmlFor={`lesson-url-${lesson.id}`}>URL (fichier ou embed)</Label>
            <Input
              id={`lesson-url-${lesson.id}`}
              value={contentUrl}
              onChange={(e) => setContentUrl(e.target.value)}
              placeholder="https://…"
              inputMode="url"
            />
          </div>
        )}
        {contentType === "text" && (
          <div className="space-y-2">
            <Label htmlFor={`lesson-body-${lesson.id}`}>Texte</Label>
            <Textarea
              id={`lesson-body-${lesson.id}`}
              rows={14}
              value={contentText}
              onChange={(e) => setContentText(e.target.value)}
              placeholder="Contenu Markdown ou texte brut…"
              className="min-h-[200px] resize-y font-mono text-creo-sm leading-relaxed"
            />
          </div>
        )}
      </FormSection>

      <FormSection title="Options" description="Durée indicative et extrait gratuit éventuel.">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="space-y-2 sm:w-36">
            <Label htmlFor={`lesson-dur-${lesson.id}`}>Durée (min)</Label>
            <Input
              id={`lesson-dur-${lesson.id}`}
              type="number"
              min={0}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
            />
          </div>
          <label
            htmlFor={`lesson-preview-${lesson.id}`}
            className="flex cursor-pointer items-center gap-3 rounded-creo-md border border-creo-gray-200 bg-white px-3 py-2.5 dark:border-border dark:bg-background"
          >
            <input
              id={`lesson-preview-${lesson.id}`}
              type="checkbox"
              checked={freePreview}
              onChange={(e) => setFreePreview(e.target.checked)}
              className="size-4 rounded border-creo-gray-300 text-creo-purple focus:ring-creo-purple"
            />
            <span className="text-creo-sm text-creo-gray-700 dark:text-foreground">
              Proposer cette leçon en aperçu gratuit
            </span>
          </label>
        </div>
      </FormSection>

      <div className="flex flex-wrap items-center gap-3 border-t border-creo-gray-100 pt-6 dark:border-border">
        <Button type="button" onClick={save} disabled={pending} className="min-w-[140px]">
          {pending ? "Enregistrement…" : "Enregistrer la leçon"}
        </Button>
        {onRequestDelete ? (
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/40"
            disabled={pending}
            onClick={onRequestDelete}
          >
            <Trash2 className="size-3.5" />
            Supprimer
          </Button>
        ) : null}
      </div>
    </div>
  );
}

const ACCESS_OPTIONS: { value: "paid" | "free" | "members_only"; label: string }[] = [
  { value: "paid", label: "Payant" },
  { value: "free", label: "Gratuit" },
  { value: "members_only", label: "Réservé aux membres" },
];

function CourseSettingsPanel({ course }: { course: CourseEditorCourse }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description ?? "");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnail_url ?? "");
  const [slug, setSlug] = useState(course.slug ?? "");
  const [price, setPrice] = useState(String(course.price));
  const [compareAtPrice, setCompareAtPrice] = useState(
    course.compare_at_price != null ? String(course.compare_at_price) : ""
  );
  const [currency, setCurrency] = useState((course.currency ?? "eur").toLowerCase());
  const [accessType, setAccessType] = useState<
    "paid" | "free" | "members_only"
  >(
    course.access_type === "free" || course.access_type === "members_only"
      ? course.access_type
      : "paid"
  );

  useEffect(() => {
    setTitle(course.title);
    setDescription(course.description ?? "");
    setThumbnailUrl(course.thumbnail_url ?? "");
    setSlug(course.slug ?? "");
    setPrice(String(course.price));
    setCompareAtPrice(course.compare_at_price != null ? String(course.compare_at_price) : "");
    setCurrency((course.currency ?? "eur").toLowerCase());
    setAccessType(
      course.access_type === "free" || course.access_type === "members_only"
        ? course.access_type
        : "paid"
    );
  }, [course]);

  function saveMeta() {
    setError(null);
    const p = parseFloat(price.replace(",", "."));
    if (Number.isNaN(p) || p < 0) {
      setError("Prix invalide.");
      return;
    }
    const capRaw = compareAtPrice.trim().replace(",", ".");
    let compareNum: number | null = null;
    if (capRaw.length > 0) {
      const c = parseFloat(capRaw);
      if (Number.isNaN(c) || c < 0) {
        setError("Prix barré invalide.");
        return;
      }
      if (c <= p) {
        setError("Le prix barré doit être supérieur au prix de vente pour afficher une réduction.");
        return;
      }
      compareNum = c;
    }
    startTransition(async () => {
      const res = await updateCourseServer({
        courseId: course.id,
        title,
        description: description.trim() || null,
        thumbnail_url: thumbnailUrl.trim() || null,
        price: p,
        currency,
        access_type: accessType,
        slug: slug.trim() || null,
        compare_at_price: compareNum,
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

  const discountPct =
    course.compare_at_price != null &&
    course.compare_at_price > course.price &&
    course.price >= 0
      ? Math.round((1 - course.price / course.compare_at_price) * 100)
      : null;

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div className="rounded-creo-lg border border-dashed border-creo-purple/25 bg-[var(--creo-purple-pale)]/40 px-4 py-3 dark:border-creo-purple/30 dark:bg-accent/10">
        <p className="flex items-start gap-2 text-creo-sm text-creo-gray-700 dark:text-foreground">
          <Sparkles className="mt-0.5 size-4 shrink-0 text-creo-purple" />
          <span>
            Définis l’URL publique, le tarif et un éventuel prix barré : ils seront visibles sur la
            page de vente et dans l’expérience élève. Utilise l’aperçu depuis l’en-tête pour
            contrôler le rendu.
          </span>
        </p>
        {discountPct != null ? (
          <p className="mt-2 text-creo-xs text-creo-gray-600 dark:text-muted-foreground">
            Réduction affichée actuellement : environ <strong>{discountPct} %</strong> par rapport au
            prix barré.
          </p>
        ) : null}
      </div>

      <FormSection
        title="Fiche formation"
        description="Titre, résumé et visuel utilisés sur la liste et la vitrine."
      >
        <div className="space-y-2">
          <Label htmlFor="course-set-title">Titre</Label>
          <Input
            id="course-set-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-set-desc">Description courte</Label>
          <Textarea
            id="course-set-desc"
            rows={4}
            placeholder="Résumé visible pour les visiteurs…"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-set-thumb">Image de couverture (URL)</Label>
          <Input
            id="course-set-thumb"
            type="url"
            inputMode="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://…"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-set-access">Type d’accès</Label>
          <select
            id="course-set-access"
            value={accessType}
            onChange={(e) =>
              setAccessType(e.target.value as "paid" | "free" | "members_only")
            }
            className={selectFieldClass}
          >
            {ACCESS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </FormSection>

      <FormSection
        title="URL et slug"
        description="Segment d’URL pour /learn/… — unique dans ton espace. Laisse vide si tu n’as pas encore de lien public."
      >
        <div className="space-y-2">
          <Label htmlFor="course-set-slug">Slug</Label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              id="course-set-slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="ma-formation"
              className="font-mono text-creo-sm sm:flex-1"
              spellCheck={false}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="shrink-0 gap-1.5"
              onClick={() => setSlug(makeUniqueCourseSlug(title || course.title || "formation"))}
            >
              <Wand2 className="size-3.5" />
              Générer
            </Button>
          </div>
          <p className="text-creo-xs text-creo-gray-500">
            Exemple : <span className="font-mono text-creo-gray-600">/learn/{slug.trim() || "…"}</span>
          </p>
        </div>
      </FormSection>

      <FormSection
        title="Tarif et promotion"
        description="Prix facturé et, optionnellement, un prix de référence barré (doit être supérieur au prix de vente)."
      >
        <div className="flex flex-wrap gap-4">
          <div className="min-w-[120px] flex-1 space-y-2">
            <Label htmlFor="course-set-price">Prix de vente</Label>
            <Input
              id="course-set-price"
              type="text"
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>
          <div className="min-w-[120px] flex-1 space-y-2">
            <Label htmlFor="course-set-compare">Prix barré (optionnel)</Label>
            <Input
              id="course-set-compare"
              type="text"
              inputMode="decimal"
              value={compareAtPrice}
              onChange={(e) => setCompareAtPrice(e.target.value)}
              placeholder="ex. 199"
            />
          </div>
          <div className="w-full min-w-[100px] max-w-[140px] space-y-2">
            <Label htmlFor="course-set-cur">Devise</Label>
            <select
              id="course-set-cur"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={selectFieldClass}
            >
              <option value="eur">EUR</option>
              <option value="usd">USD</option>
            </select>
          </div>
        </div>
      </FormSection>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-creo-sm text-red-700 dark:bg-red-950/40 dark:text-red-200">
          {error}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button type="button" onClick={saveMeta} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer les modifications"}
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
    </div>
  );
}

const tabs = [
  { key: "content" as const, label: "Leçon", icon: BookOpen },
  { key: "settings" as const, label: "Paramètres", icon: Settings },
  { key: "students" as const, label: "Élèves", icon: Users },
];

export function CourseEditorClient({
  course,
  structure,
}: {
  course: CourseEditorCourse;
  structure: CourseStructureDTO;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"content" | "settings" | "students">("content");
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
        setTab("content");
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
    if (!window.confirm("Supprimer cette leçon ? Cette action est définitive.")) {
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

  const cur = (course.currency ?? "eur").toUpperCase();
  const priceLabel = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: cur,
  }).format(Number(course.price));
  const compareLabel =
    course.compare_at_price != null && course.compare_at_price > Number(course.price)
      ? new Intl.NumberFormat("fr-FR", { style: "currency", currency: cur }).format(
          course.compare_at_price
        )
      : null;
  const publicLearnHref =
    course.status === "published" && course.slug?.trim()
      ? `/learn/${course.slug.trim()}`
      : null;

  return (
    <div className="pb-8">
      {/* En-tête */}
      <div className="mb-6 space-y-4 border-b border-creo-gray-200 pb-6 dark:border-border">
        <Link
          href="/dashboard/courses"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 gap-1.5 text-creo-gray-600 hover:text-creo-black dark:text-zinc-400 dark:hover:text-white"
          )}
        >
          <ArrowLeft className="size-4" />
          Formations
        </Link>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-creo-2xl font-semibold tracking-tight text-[#202223] dark:text-white">
                {course.title || "Formation sans titre"}
              </h1>
              <Badge variant={course.status === "published" ? "green" : "gray"}>
                {course.status === "published" ? "Publié" : "Brouillon"}
              </Badge>
            </div>
            <p className="max-w-2xl text-creo-sm leading-relaxed text-[#616161] dark:text-creo-gray-500">
              Structure le programme à gauche, rédige chaque leçon au centre. Paramètres, tarif et
              URL dans l’onglet dédié — prévisualise le parcours élève à tout moment.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button type="button" size="sm" variant="outline" className="gap-1.5" asChild>
                <Link href={`/dashboard/courses/${course.id}/preview`}>
                  <Eye className="size-3.5" />
                  Aperçu élève
                </Link>
              </Button>
              {publicLearnHref ? (
                <Button type="button" size="sm" variant="secondary" className="gap-1.5" asChild>
                  <a href={publicLearnHref} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="size-3.5" />
                    Page publique
                  </a>
                </Button>
              ) : null}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-creo-gray-200 bg-white px-3 py-1.5 text-creo-xs font-medium text-creo-gray-700 dark:border-border dark:bg-background">
              <Layers className="size-3.5 text-creo-gray-400" />
              {structure.modules.length} module{structure.modules.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-creo-gray-200 bg-white px-3 py-1.5 text-creo-xs font-medium text-creo-gray-700 dark:border-border dark:bg-background">
              <GraduationCap className="size-3.5 text-creo-gray-400" />
              {lessonsFlat.length} leçon{lessonsFlat.length !== 1 ? "s" : ""}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-creo-gray-200 bg-white px-3 py-1.5 text-creo-xs font-medium text-creo-gray-700 dark:border-border dark:bg-background">
              {compareLabel ? (
                <>
                  <span className="text-creo-gray-400 line-through">{compareLabel}</span>
                  <span className="text-creo-purple dark:text-[var(--creo-blue-readable)]">
                    {priceLabel}
                  </span>
                </>
              ) : (
                priceLabel
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        {/* Colonne programme — en dessous du contenu sur mobile (order) */}
        <aside className="order-2 w-full shrink-0 space-y-4 lg:order-1 lg:w-[min(100%,320px)] xl:w-[340px]">
          <div>
            <h2 className="text-creo-sm font-semibold text-creo-black dark:text-foreground">
              Programme
            </h2>
            <p className="mt-0.5 text-creo-xs text-creo-gray-500">
              Modules et leçons — clique sur une leçon pour l’éditer.
            </p>
          </div>

          <Card className="overflow-hidden border-creo-gray-200/80 p-0 shadow-sm dark:border-border">
            <div className="flex items-center justify-between gap-2 border-b border-creo-gray-100 bg-creo-gray-50/80 px-3 py-2.5 dark:border-border dark:bg-muted/30">
              <span className="text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
                Arborescence
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-8 gap-1 text-creo-xs"
                onClick={addModule}
                disabled={structPending}
              >
                <Plus className="size-3.5" />
                Module
              </Button>
            </div>
            <div className="space-y-2 p-3">
              {structure.modules.length === 0 ? (
                <div className="rounded-creo-md border border-dashed border-creo-gray-200 bg-creo-gray-50/50 px-4 py-8 text-center dark:border-border dark:bg-muted/20">
                  <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
                    Aucun module pour l’instant.
                  </p>
                  <p className="mt-1 text-creo-xs text-creo-gray-500">
                    Ajoute un module puis des leçons pour constituer ton programme.
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-4 gap-1"
                    onClick={addModule}
                    disabled={structPending}
                  >
                    <Plus className="size-3.5" />
                    Premier module
                  </Button>
                </div>
              ) : (
                structure.modules.map((mod, modIndex) => {
                  const open = expanded[mod.id] !== false;
                  return (
                    <div
                      key={mod.id}
                      className="overflow-hidden rounded-creo-md border border-creo-gray-100 bg-white dark:border-border dark:bg-card"
                    >
                      <div className="flex items-stretch gap-1 border-b border-creo-gray-50 bg-zinc-50/90 p-1.5 dark:border-border dark:bg-muted/40">
                        <button
                          type="button"
                          onClick={() => toggleModule(mod.id)}
                          className="flex shrink-0 items-center justify-center rounded-md px-1 text-creo-gray-500 hover:bg-white/80 dark:hover:bg-background/80"
                          aria-expanded={open}
                          aria-label={open ? "Replier le module" : "Déplier le module"}
                        >
                          <ChevronDown
                            className={cn("size-4 transition-transform", !open && "-rotate-90")}
                          />
                        </button>
                        <span className="flex w-7 shrink-0 items-center justify-center rounded-md bg-white text-creo-xs font-semibold text-creo-gray-500 shadow-sm dark:bg-background">
                          {modIndex + 1}
                        </span>
                        <div className="min-w-0 flex-1 py-0.5">
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
                          className="shrink-0 text-creo-gray-400 hover:text-red-600"
                          aria-label="Supprimer le module"
                          onClick={() => removeModule(mod.id)}
                          disabled={structPending}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                      {open && (
                        <div className="space-y-1 px-2 pb-2 pt-2">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="mb-1 h-8 w-full gap-1 text-creo-xs"
                            onClick={() => addLesson(mod.id)}
                            disabled={structPending}
                          >
                            <Plus className="size-3" />
                            Ajouter une leçon
                          </Button>
                          <ul className="space-y-0.5">
                            {mod.lessons.map((les, i) => {
                              const Icon = lessonIcon(les.content_type);
                              const active = les.id === selectedLessonId;
                              return (
                                <li key={les.id}>
                                  <div
                                    className={cn(
                                      "flex items-center gap-0.5 overflow-hidden rounded-md border border-transparent transition-colors",
                                      active
                                        ? "border-creo-purple/25 bg-[var(--creo-purple-pale)] dark:bg-accent/25"
                                        : "hover:bg-creo-gray-50 dark:hover:bg-muted/40"
                                    )}
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedLessonId(les.id);
                                        setTab("content");
                                      }}
                                      className="flex min-w-0 flex-1 items-center gap-2 px-2 py-2 text-left"
                                    >
                                      <span className="flex size-6 shrink-0 items-center justify-center rounded bg-white/80 text-[10px] font-medium text-creo-gray-500 dark:bg-background/80">
                                        {i + 1}
                                      </span>
                                      <Icon className="size-3.5 shrink-0 opacity-70" />
                                      <span className="truncate text-creo-sm">{les.title}</span>
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
                                  </div>
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
            </div>
          </Card>

          <Card className="border-creo-gray-100 p-4 dark:border-border">
            <h3 className="text-creo-xs font-semibold uppercase tracking-wide text-creo-gray-500">
              Résumé
            </h3>
            <dl className="mt-3 space-y-3 text-creo-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-creo-gray-500">Tarif</dt>
                <dd className="text-right font-medium text-creo-black dark:text-foreground">
                  {compareLabel ? (
                    <span className="inline-flex flex-col items-end gap-0.5">
                      <span className="text-creo-xs font-normal text-creo-gray-400 line-through">
                        {compareLabel}
                      </span>
                      <span className="text-creo-purple dark:text-[var(--creo-blue-readable)]">
                        {priceLabel}
                      </span>
                    </span>
                  ) : (
                    priceLabel
                  )}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-creo-gray-500">Accès</dt>
                <dd className="font-medium text-creo-black dark:text-foreground">
                  {ACCESS_OPTIONS.find((o) => o.value === course.access_type)?.label ??
                    course.access_type}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-creo-gray-500">Slug</dt>
                <dd className="max-w-[55%] truncate font-mono text-creo-xs text-creo-black dark:text-foreground">
                  {course.slug?.trim() ? course.slug.trim() : "—"}
                </dd>
              </div>
            </dl>
          </Card>
        </aside>

        {/* Contenu principal */}
        <main className="order-1 min-w-0 flex-1 lg:order-2">
          <div
            className="sticky top-0 z-10 -mx-4 mb-6 px-4 md:-mx-6 md:px-6 lg:-mx-0 lg:px-0"
            role="tablist"
            aria-label="Sections de l’éditeur"
          >
            <div className="flex gap-1 overflow-x-auto rounded-creo-lg border border-creo-gray-200/90 bg-white/90 p-1 shadow-sm dark:border-border dark:bg-card/80">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  onClick={() => setTab(key)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-creo-md px-3.5 py-2 text-creo-sm font-medium transition-colors",
                    tab === key
                      ? "bg-creo-purple text-white shadow-sm dark:bg-[var(--creo-blue)] dark:text-white"
                      : "text-creo-gray-600 hover:bg-creo-gray-100 dark:text-muted-foreground dark:hover:bg-muted/60"
                  )}
                >
                  <Icon className="size-4 shrink-0 opacity-90" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {tab === "content" && (
            <>
              {!selectedLesson ? (
                <Card className="border-dashed p-10 text-center">
                  <BookOpen className="mx-auto size-10 text-creo-gray-300 dark:text-zinc-600" />
                  <p className="mt-4 text-creo-sm font-medium text-creo-gray-700 dark:text-foreground">
                    {structure.modules.length === 0
                      ? "Commence par créer un module."
                      : "Choisis une leçon dans le programme."}
                  </p>
                  <p className="mt-1 text-creo-xs text-creo-gray-500">
                    {structure.modules.length === 0
                      ? "Utilise le bouton « Module » ou « Premier module » à gauche."
                      : "Clique sur une leçon dans la liste pour afficher l’éditeur ici."}
                  </p>
                </Card>
              ) : (
                <Card className="border-creo-gray-200/80 p-5 shadow-sm sm:p-8 dark:border-border">
                  <LessonEditorPanel
                    courseId={course.id}
                    lesson={selectedLesson}
                    onRequestDelete={() => removeLesson(selectedLesson.id)}
                  />
                </Card>
              )}
            </>
          )}

          {tab === "settings" && (
            <Card className="border-creo-gray-200/80 p-5 shadow-sm sm:p-8 dark:border-border">
              <CourseSettingsPanel course={course} />
            </Card>
          )}

          {tab === "students" && (
            <Card className="overflow-hidden border-creo-gray-200/80 dark:border-border">
              <div className="border-b border-creo-gray-100 bg-creo-gray-50/80 px-5 py-4 dark:border-border dark:bg-muted/30">
                <h3 className="text-creo-sm font-semibold text-creo-black dark:text-foreground">
                  Inscriptions
                </h3>
                <p className="mt-0.5 text-creo-xs text-creo-gray-500">
                  Suivi des élèves — bientôt enrichi (progression, e-mail).
                </p>
              </div>
              <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-creo-gray-100 dark:bg-muted">
                  <Users className="size-7 text-creo-gray-400" />
                </div>
                <p className="mt-4 text-creo-sm font-medium text-creo-gray-700 dark:text-foreground">
                  Aucun élève inscrit pour l’instant
                </p>
                <p className="mt-1 max-w-sm text-creo-xs text-creo-gray-500">
                  Quand des ventes ou inscriptions seront reliées à cette formation, la liste
                  apparaîtra ici.
                </p>
              </div>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
