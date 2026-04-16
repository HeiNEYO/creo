import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";

/**
 * Rappel d’upgrade pour les workspaces en plan Starter (abonnement plateforme).
 */
export function SubscriptionStarterBanner() {
  return (
    <div
      className="rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-creo-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-50"
      role="status"
    >
      <p className="font-medium">Tu es en plan Starter</p>
      <p className="mt-1 text-creo-sm text-amber-900/90 dark:text-amber-100/90">
        Pour facturer l’accès à la plateforme (Creator) et débloquer l’envoi de masse aux abonnés
        e-mail, souscris depuis Paramètres → Abonnement CRÉO. Les tests d’e-mail et le reste du
        tableau de bord restent disponibles.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/dashboard/settings?section=subscription-creo"
          className={buttonVariants({ size: "sm" })}
        >
          Abonnement CRÉO
        </Link>
      </div>
    </div>
  );
}
