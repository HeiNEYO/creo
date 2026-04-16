import { cn } from "@/lib/utils";

/** Bande animée type « shimmer » pour les placeholders de chargement. */
const skBar =
  "bg-gradient-to-r from-creo-gray-200 via-creo-gray-100 to-creo-gray-200 bg-[length:200%_100%] animate-creo-shimmer dark:from-zinc-800 dark:via-zinc-700 dark:to-zinc-800";

/**
 * Squelette plein écran pour le chargement de `/builder/[pageId]`
 * (barre d’outils + palette / canvas / panneau droit).
 */
export function BuilderLoadingSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[#f8f8f8] dark:bg-creo-gray-900",
        className
      )}
      role="status"
      aria-busy="true"
      aria-label="Chargement de l’éditeur"
    >
      <span className="sr-only">Chargement de l’éditeur…</span>

      {/* Barre éditeur */}
      <div className="flex h-[52px] shrink-0 items-center gap-3 border-b border-creo-gray-200 bg-creo-white px-3 md:px-4 dark:border-zinc-800 dark:bg-zinc-950">
        <div className={cn("h-8 w-24 rounded-md", skBar)} />
        <div className="hidden h-6 w-px bg-creo-gray-200 sm:block dark:bg-zinc-700" />
        <div className={cn("h-8 max-w-[200px] flex-1 rounded-md md:max-w-xs", skBar)} />
        <div className={cn("h-7 w-20 rounded-full", skBar)} />
        <div className={cn("ml-auto hidden h-8 w-24 rounded-md sm:block", skBar)} />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className={cn("h-9 w-9 rounded-creo-md", skBar)} />
          ))}
        </div>
        <div className={cn("hidden h-8 w-28 rounded-md sm:block", skBar)} />
      </div>

      {/* Zone 3 colonnes */}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* Palette (lg+) */}
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-creo-gray-200 bg-creo-white p-3 dark:border-zinc-800 dark:bg-zinc-950 lg:flex">
          <div className={cn("mb-3 h-8 w-full rounded-md", skBar)} />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={cn("h-10 w-full rounded-creo-md", skBar)} />
            ))}
          </div>
        </aside>

        {/* Canvas */}
        <div className="min-h-0 min-w-0 flex-1 overflow-hidden p-4 md:p-6">
          <div className="mx-auto flex h-full min-h-[min(78vh,900px)] max-w-5xl flex-col overflow-hidden rounded-2xl border border-creo-gray-200/90 bg-creo-white shadow-sm dark:border-zinc-700/90 dark:bg-zinc-950">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-creo-gray-100 px-4 py-2.5 dark:border-zinc-800/80">
              <div className="space-y-1.5">
                <div className={cn("h-2.5 w-24 rounded", skBar)} />
                <div className={cn("h-4 w-20 rounded", skBar)} />
              </div>
              <div className={cn("h-6 w-28 rounded-full", skBar)} />
            </div>
            <div className="min-h-0 flex-1 space-y-3 bg-creo-gray-50/50 p-4 dark:bg-zinc-950/50">
              <div className="mx-auto flex h-full min-h-[200px] max-w-xl flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-creo-gray-200 bg-white dark:border-zinc-600 dark:bg-zinc-900/50">
                <div className={cn("h-12 w-44 rounded-lg", skBar)} />
                <div className={cn("h-3 w-32 rounded", skBar)} />
              </div>
            </div>
          </div>
        </div>

        {/* Panneau droit (xl+) */}
        <aside className="hidden w-[min(100%,380px)] shrink-0 flex-col border-l border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 xl:flex">
          <div className="shrink-0 border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
            <div className={cn("h-4 w-28 rounded", skBar)} />
            <div className={cn("mt-2 h-3 w-40 rounded", skBar)} />
          </div>
          <div className="min-h-0 flex-1 space-y-4 overflow-hidden p-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className={cn("h-3 w-24 rounded", skBar)} />
                <div className={cn("h-9 w-full rounded-md", skBar)} />
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
