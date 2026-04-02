import { cn } from "@/lib/utils";

/** Squelette zone principale dashboard (clair / sombre). */
export function DashboardMainSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse space-y-8", className)}
      aria-hidden
    >
      <div className="space-y-2">
        <div className="h-8 w-48 max-w-full rounded-lg bg-[#e3e5e8] dark:bg-[#2a2a2a]" />
        <div className="h-4 w-full max-w-md rounded-md bg-[#ebebeb] dark:bg-[#1f1f1f]" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-white shadow-[0_1px_0_rgba(0,0,0,0.05)] ring-1 ring-[#e3e5e8] dark:bg-[#141414] dark:ring-[#2a2a2a]"
          />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-[320px] rounded-2xl bg-white ring-1 ring-[#e3e5e8] dark:bg-[#141414] dark:ring-[#2a2a2a] lg:col-span-2" />
        <div className="h-[320px] rounded-2xl bg-white ring-1 ring-[#e3e5e8] dark:bg-[#141414] dark:ring-[#2a2a2a]" />
      </div>
    </div>
  );
}

/** Squelette liste / tableau générique. */
export function DashboardTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-4" aria-hidden>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="h-10 w-full max-w-md rounded-lg bg-[#ebebeb] dark:bg-[#1f1f1f]" />
        <div className="h-9 w-32 rounded-lg bg-[#ebebeb] dark:bg-[#1f1f1f]" />
      </div>
      <div className="rounded-2xl bg-white p-4 ring-1 ring-[#e3e5e8] dark:bg-[#141414] dark:ring-[#2a2a2a]">
        <div className="space-y-3">
          {Array.from({ length: rows }).map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-lg bg-[#f6f6f7] dark:bg-[#1a1a1a]"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
