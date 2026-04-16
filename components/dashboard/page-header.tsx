import { cn } from "@/lib/utils";

type PageHeaderProps = {
  /** Conservé pour compatibilité ; non affiché. */
  title?: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
  /** Affiché à gauche lorsqu’il y a une action (ex. marque + boutons). */
  leading?: React.ReactNode;
};

/**
 * Barre d’actions optionnelle sous le header du shell. Titres / sous-titres de page ne sont plus
 * affichés (la navigation latérale suffit comme repère).
 */
export function PageHeader({ className, action, leading }: PageHeaderProps) {
  if (!action) {
    return null;
  }

  return (
    <div
      className={cn(
        "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center",
        leading ? "sm:justify-between" : "sm:justify-end",
        className
      )}
    >
      {leading ? <div className="shrink-0">{leading}</div> : null}
      <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">{action}</div>
    </div>
  );
}
