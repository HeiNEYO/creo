"use client";

import { FileQuestion } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { PagePreviewThumbSkeleton } from "@/components/dashboard/pages/page-preview-skeleton";
import { cn } from "@/lib/utils";

function initialsFromTitle(title: string): string {
  const t = title.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]!.slice(0, 1) + parts[1]!.slice(0, 1)).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

function Placeholder({
  title,
  variant,
  className,
}: {
  title: string;
  variant: "draft" | "unavailable";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-zinc-100 via-zinc-50 to-zinc-200/80 text-zinc-500 dark:from-zinc-800 dark:via-zinc-900 dark:to-zinc-800 dark:text-zinc-400",
        className
      )}
    >
      {variant === "draft" ? (
        <span className="select-none text-2xl font-semibold tracking-tight text-zinc-400 dark:text-zinc-500">
          {initialsFromTitle(title)}
        </span>
      ) : (
        <FileQuestion className="size-8 opacity-50" aria-hidden />
      )}
      {variant === "draft" ? (
        <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide text-zinc-600 shadow-sm dark:bg-zinc-950/90 dark:text-zinc-300">
          Brouillon
        </span>
      ) : (
        <span className="absolute bottom-1.5 left-1/2 max-w-[90%] -translate-x-1/2 truncate rounded bg-white/90 px-1.5 py-0.5 text-[9px] font-medium text-zinc-600 shadow-sm dark:bg-zinc-950/90 dark:text-zinc-300">
          Aperçu indisponible
        </span>
      )}
    </div>
  );
}

type PagePreviewThumbProps = {
  previewUrl: string | null;
  title: string;
  published: boolean;
  /** Ratio zone d’aperçu */
  aspectClassName?: string;
  /** Variante liste : iframe plus petit */
  compact?: boolean;
};

/**
 * Aperçu visuel de la page publiée (iframe chargée seulement à l’approche du viewport)
 * ou placeholder (brouillon / URL manquante).
 */
export function PagePreviewThumb({
  previewUrl,
  title,
  published,
  aspectClassName = "aspect-[16/10]",
  compact = false,
}: PagePreviewThumbProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    if (!published || !previewUrl) return;
    const el = hostRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setShouldLoad(true);
      },
      { root: null, rootMargin: "180px 0px", threshold: 0.01 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [published, previewUrl]);

  if (!published) {
    return <Placeholder title={title} variant="draft" className={aspectClassName} />;
  }
  if (!previewUrl) {
    return <Placeholder title={title} variant="unavailable" className={aspectClassName} />;
  }

  const w = compact ? 1024 : 1280;
  const h = compact ? 640 : 800;
  const scale = compact ? 0.2 : 0.264;

  return (
    <div
      ref={hostRef}
      className={cn(
        "relative w-full overflow-hidden rounded-md bg-zinc-100 ring-1 ring-inset ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-700/50",
        aspectClassName
      )}
    >
      {shouldLoad ? (
        <iframe
          title={`Aperçu · ${title}`}
          src={previewUrl}
          className={cn(
            "pointer-events-none absolute left-0 top-0 block border-0 transition-opacity duration-300",
            iframeLoaded ? "opacity-100" : "opacity-0"
          )}
          style={{
            width: w,
            height: h,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups-to-escape-sandbox"
          onLoad={() => setIframeLoaded(true)}
        />
      ) : null}
      {!iframeLoaded ? (
        <PagePreviewThumbSkeleton
          compact={compact}
          className="absolute inset-0 h-full w-full"
        />
      ) : null}
    </div>
  );
}
