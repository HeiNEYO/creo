"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

/**
 * Erreurs dans les pages dashboard (pas dans dashboard/layout.tsx — celles-ci
 * remontent vers la racine). Couvre cockpit, réglages, etc.
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="mx-auto max-w-lg space-y-4 p-8 text-center">
      <h1 className="text-creo-lg font-semibold text-creo-black dark:text-foreground">
        Une erreur s’est produite dans le tableau de bord
      </h1>
      <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
        {error.message ||
          "Réessaie dans un instant. Si ça continue, vérifie les variables Supabase sur Vercel."}
      </p>
      {error.digest ? (
        <p className="font-mono text-creo-xs text-creo-gray-400">
          Réf. {error.digest}
        </p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Button type="button" onClick={() => reset()}>
          Réessayer
        </Button>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Cockpit
        </Link>
      </div>
    </Card>
  );
}
