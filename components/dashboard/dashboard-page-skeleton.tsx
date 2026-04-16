import { cn } from "@/lib/utils";

/** Squelette zone principale dashboard (clair / sombre). */
export function DashboardMainSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse space-y-8", className)}
      aria-hidden
    >
      <div className="space-y-2">
        <div className="h-8 w-48 max-w-full rounded-lg bg-[#e3e5e8] dark:bg-[var(--creo-dashboard-border)]" />
        <div className="h-4 w-full max-w-md rounded-md bg-[#e4e6e9] dark:bg-[var(--creo-gray-300)]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl border border-[#e3e5e8] bg-white shadow-[var(--creo-shadow-card-rest)] dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-panel)] dark:shadow-none"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-[320px] rounded-2xl border border-[#e3e5e8] bg-white shadow-[var(--creo-shadow-card-rest)] dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-panel)] dark:shadow-none lg:col-span-2" />
        <div className="h-[320px] rounded-2xl border border-[#e3e5e8] bg-white shadow-[var(--creo-shadow-card-rest)] dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-panel)] dark:shadow-none" />
      </div>
    </div>
  );
}

/** Squelette liste / tableau générique. */
export function DashboardTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-full max-w-md rounded-lg bg-[#ebebeb] dark:bg-[var(--creo-gray-300)]" />
        <div className="h-9 w-32 rounded-lg bg-[#ebebeb] dark:bg-[var(--creo-gray-300)]" />
      </div>
      <div className="rounded-2xl border border-[#e3e5e8] bg-white p-4 shadow-[var(--creo-shadow-card-rest)] dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-panel)] dark:shadow-none">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-[#f4f5f7] dark:bg-[var(--creo-surface-raised)]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/** Squelette page Formations (stats, barre d’outils, cartes). */
export function CoursesDashboardSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-6" aria-hidden>
      <div className="space-y-2">
        <div className="h-7 w-44 max-w-full rounded-lg bg-[#e3e5e8] dark:bg-[var(--creo-dashboard-border)]" />
        <div className="h-4 w-full max-w-lg rounded-md bg-[#e4e6e9] dark:bg-[var(--creo-gray-300)]" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-20 rounded-xl border border-[#e3e5e8] bg-white dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-panel)]"
          />
        ))}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="h-11 flex-1 rounded-xl bg-[#ebebeb] dark:bg-[var(--creo-gray-300)]" />
        <div className="h-11 w-full rounded-xl bg-[#ebebeb] dark:bg-[var(--creo-gray-300)] sm:w-48" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="flex gap-4 rounded-xl border border-[#e3e5e8] bg-white p-4 dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-panel)]"
          >
            <div className="h-24 w-32 shrink-0 rounded-lg bg-[#f4f5f7] dark:bg-[var(--creo-surface-raised)]" />
            <div className="min-w-0 flex-1 space-y-2 py-1">
              <div className="h-5 w-2/3 max-w-xs rounded bg-[#ebebeb] dark:bg-[var(--creo-gray-300)]" />
              <div className="h-4 w-full max-w-md rounded bg-[#f4f5f7] dark:bg-[var(--creo-surface-raised)]" />
              <div className="h-4 w-24 rounded bg-[#f4f5f7] dark:bg-[var(--creo-surface-raised)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
