import { Webhook } from "lucide-react";

import { IntegrationBrandLogo } from "@/components/dashboard/integrations/integration-brand-logo";
import type { IntegrationCatalogId } from "@/lib/integrations/catalog";
import { cn } from "@/lib/utils";

export function IntegrationCardIcon({
  id,
  className,
}: {
  id: IntegrationCatalogId;
  className?: string;
}) {
  /**
   * Pastille compacte : le logo occupe tout l’espace intérieur (object-contain),
   * padding minimal pour éviter l’effet « petit picto dans une grande boîte ».
   */
  const box =
    "flex size-11 shrink-0 flex-col overflow-hidden rounded-xl bg-white p-1 shadow-[var(--creo-shadow-card-rest)] dark:bg-muted dark:shadow-none";

  if (id === "webhook") {
    return (
      <div className={cn(box, "bg-creo-gray-50 dark:bg-muted", className)} aria-hidden>
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
          <Webhook className="size-7 max-h-full max-w-full shrink-0 text-creo-gray-700 dark:text-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn(box, className)} aria-hidden>
      <div className="relative min-h-0 min-w-0 flex-1">
        <IntegrationBrandLogo
          id={id}
          size={96}
          className="absolute inset-0 m-auto h-full w-full max-h-full max-w-full object-contain"
        />
      </div>
    </div>
  );
}

/** Icône titre page détail (légèrement plus grande). */
export function IntegrationDetailTitleIcon({
  id,
  className,
}: {
  id: IntegrationCatalogId;
  className?: string;
}) {
  if (id === "webhook") {
    return (
      <div
        className={cn(
          "flex size-14 shrink-0 flex-col overflow-hidden rounded-xl bg-creo-gray-100 p-1 shadow-[var(--creo-shadow-card-rest)] dark:bg-muted dark:shadow-none",
          className
        )}
        aria-hidden
      >
        <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center">
          <Webhook className="size-9 max-h-full max-w-full shrink-0 text-creo-gray-700 dark:text-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex size-14 shrink-0 flex-col overflow-hidden rounded-xl bg-white p-1 shadow-[var(--creo-shadow-card-rest)] dark:bg-muted dark:shadow-none",
        className
      )}
      aria-hidden
    >
      <div className="relative min-h-0 min-w-0 flex-1">
        <IntegrationBrandLogo
          id={id}
          size={112}
          className="absolute inset-0 m-auto h-full w-full max-h-full max-w-full object-contain"
        />
      </div>
    </div>
  );
}
