import { cn } from "@/lib/utils";

/** Bande animée type shimmer (alignée sur le builder). */
const skBar =
  "bg-gradient-to-r from-creo-gray-200 via-creo-gray-100 to-creo-gray-200 bg-[length:200%_100%] animate-creo-shimmer dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800";

type PagePreviewThumbSkeletonProps = {
  className?: string;
  /** Variante compacte (liste Site) : blocs plus denses. */
  compact?: boolean;
};

/**
 * Squelette pour la zone d’aperçu d’une page (iframe en cours de chargement ou route loading).
 */
export function PagePreviewThumbSkeleton({
  className,
  compact = false,
}: PagePreviewThumbSkeletonProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-md bg-zinc-100/95 ring-1 ring-inset ring-zinc-200/70 dark:bg-zinc-900 dark:ring-zinc-700/50",
        compact ? "gap-1 p-1.5" : "gap-2 p-2.5",
        className
      )}
      aria-hidden
    >
      {/* mini « barre de fenêtre » */}
      <div className="flex items-center gap-1">
        <div className="flex gap-0.5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={cn("rounded-full", skBar, compact ? "size-1" : "size-1.5")}
            />
          ))}
        </div>
        <div className={cn("ml-auto rounded", skBar, compact ? "h-1 w-6" : "h-1.5 w-10")} />
      </div>
      <div className={cn("rounded", skBar, compact ? "h-1.5 w-[85%]" : "h-2 w-3/4")} />
      <div className={cn("rounded", skBar, compact ? "h-1.5 w-[60%]" : "h-2 w-1/2")} />
      <div className={cn("mt-auto min-h-0 flex-1 rounded-sm", skBar)} />
    </div>
  );
}

type SitePagesLoadingSkeletonProps = {
  className?: string;
  /** Nombre de lignes type bandeau. */
  rows?: number;
};

/**
 * Squelette route `/dashboard/pages` : en-tête, barre de recherche, filtres, bandeaux avec aperçu.
 */
export function SitePagesLoadingSkeleton({
  className,
  rows = 6,
}: SitePagesLoadingSkeletonProps) {
  return (
    <div
      className={cn("space-y-6", className)}
      role="status"
      aria-busy="true"
      aria-label="Chargement des pages"
    >
      <span className="sr-only">Chargement des pages du site…</span>

      <div className="mb-6 flex justify-end">
        <div className={cn("h-10 w-[148px] rounded-creo-md", skBar)} />
      </div>

      {/* Recherche + filtres */}
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className={cn("h-10 w-full max-w-md rounded-creo-md", skBar)} />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn("h-9 w-16 rounded-md", skBar)} />
          ))}
        </div>
      </div>

      {/* Bandeaux */}
      <div className="flex flex-col gap-2">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-3 rounded-xl border border-[#e3e5e8] bg-white p-3 shadow-[var(--creo-shadow-card-rest)] dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-panel)] dark:shadow-none sm:flex-row sm:items-stretch sm:gap-4"
          >
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md">
              <PagePreviewThumbSkeleton compact className="absolute inset-0 h-full w-full" />
            </div>
            <div className="min-w-0 flex-1 space-y-2 py-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <div className={cn("h-5 w-48 max-w-full rounded-md", skBar)} />
                <div className={cn("h-5 w-14 rounded-full", skBar)} />
                <div className={cn("h-5 w-20 rounded-full", skBar)} />
              </div>
              <div className={cn("h-3 w-32 rounded", skBar)} />
              <div className={cn("h-3 w-full max-w-sm rounded", skBar)} />
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 border-t border-creo-gray-100 pt-3 dark:border-zinc-800 sm:flex-col sm:justify-center sm:border-t-0 sm:pt-0">
              <div className={cn("h-8 w-24 rounded-md", skBar)} />
              <div className={cn("h-8 w-24 rounded-md", skBar)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
