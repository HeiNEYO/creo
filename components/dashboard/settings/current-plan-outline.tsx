import { cn } from "@/lib/utils";

type Props = {
  planLabel: string;
  className?: string;
};

/**
 * Plan actuel : contour bleu CRÉO + pastille « Votre plan » sur le bord supérieur (style fieldset).
 */
export function CurrentPlanOutline({ planLabel, className }: Props) {
  return (
    <div
      className={cn(
        "relative rounded-xl border-2 border-creo-blue px-4 pb-4 pt-6 dark:border-creo-blue",
        className,
      )}
    >
      <span
        className={cn(
          "absolute left-4 top-0 -translate-y-1/2 bg-[var(--creo-dashboard-canvas)] px-2",
          "text-[11px] font-semibold uppercase tracking-[0.14em] text-creo-blue",
          "dark:bg-[var(--creo-surface-app)] dark:text-creo-blue-readable",
        )}
      >
        Votre plan
      </span>
      <p className="text-lg font-semibold tracking-tight text-foreground">{planLabel}</p>
      <p className="mt-1 max-w-2xl text-creo-sm leading-relaxed text-muted-foreground">
        Abonnement facturé à CRÉO pour l’éditeur, le CRM et l’e-mail — distinct de l’encaissement de tes clients sur tes
        pages.
      </p>
    </div>
  );
}
