"use client";

import Link from "next/link";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function CoursesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="mx-auto max-w-lg space-y-4 p-8 text-center">
      <h1 className="text-creo-lg font-semibold text-creo-black dark:text-foreground">
        Impossible d’afficher les formations
      </h1>
      <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
        {error.message ||
          "Une erreur serveur s’est produite. Réessaie dans un instant."}
      </p>
      {error.digest ? (
        <p className="text-creo-xs text-creo-gray-400">Réf. {error.digest}</p>
      ) : null}
      <div className="flex flex-wrap justify-center gap-2 pt-2">
        <Button type="button" onClick={reset}>
          Réessayer
        </Button>
        <Link href="/dashboard" className={buttonVariants({ variant: "outline" })}>
          Retour au cockpit
        </Link>
      </div>
    </Card>
  );
}
