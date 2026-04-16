import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
  iconClassName?: string;
  /** Variation vs période précédente (%). Absent = ligne masquée. */
  deltaPct?: number | null;
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  deltaPct,
}: MetricCardProps) {
  const showDelta = typeof deltaPct === "number" && Number.isFinite(deltaPct);

  return (
    <Card className="border-[#e3e5e8] bg-white p-5 shadow-none dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)] sm:p-6">
      {Icon ? (
        <div className="flex items-start justify-between gap-3">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-[10px] bg-[var(--creo-dashboard-canvas)] text-[#5c5f62] dark:bg-white/[0.06] dark:text-creo-gray-500",
              iconClassName,
            )}
          >
            <Icon className="size-[18px]" strokeWidth={1.75} />
          </div>
        </div>
      ) : null}
      <p
        className={cn(
          "text-[13px] text-[#616161] dark:text-creo-gray-500",
          Icon ? "mt-4" : "mt-0",
        )}
      >
        {label}
      </p>
      <p className="mt-1.5 text-[26px] font-semibold leading-tight tracking-tight text-[#202223] dark:text-white">
        {value}
      </p>
      {showDelta ? (
        <div className="mt-2.5 flex flex-wrap items-center gap-x-2 gap-y-1">
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2.5 py-1 text-[13px] font-semibold tabular-nums tracking-tight",
              deltaPct >= 0
                ? "bg-[color:var(--creo-dashboard-trend-positive-soft)] text-[color:var(--creo-dashboard-trend-positive)]"
                : "bg-[color:var(--creo-dashboard-trend-negative-soft)] text-[color:var(--creo-dashboard-trend-negative)]",
            )}
          >
            <span className="text-[0.95em]" aria-hidden>
              {deltaPct >= 0 ? "↗" : "↘"}
            </span>
            {Math.abs(deltaPct).toFixed(1)} %
          </span>
          <span className="text-[12px] font-normal text-[#8c9196] dark:text-creo-gray-500">
            vs période préc.
          </span>
        </div>
      ) : null}
    </Card>
  );
}
