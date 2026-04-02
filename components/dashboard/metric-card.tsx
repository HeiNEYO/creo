import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  iconClassName?: string;
  trend: string;
  trendPositive?: boolean;
};

export function MetricCard({
  label,
  value,
  icon: Icon,
  iconClassName,
  trend,
  trendPositive = true,
}: MetricCardProps) {
  return (
    <Card className="rounded-2xl p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex size-9 items-center justify-center rounded-creo-md",
            iconClassName ?? "bg-creo-purple-pale text-creo-purple"
          )}
        >
          <Icon className="size-4" />
        </div>
      </div>
      <p className="mt-4 text-creo-sm text-creo-gray-500">{label}</p>
      <p className="mt-1 text-creo-2xl font-medium text-creo-black">{value}</p>
      <p
        className={cn(
          "mt-2 text-creo-sm font-medium",
          trendPositive ? "text-[#059669]" : "text-creo-danger"
        )}
      >
        {trend}
      </p>
    </Card>
  );
}
