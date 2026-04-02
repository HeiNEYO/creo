import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function NewCoursePage() {
  return (
    <>
      <PageHeader
        title="Nouvelle formation"
        description="Assistant de création — à brancher sur l’API plus tard."
      />
      <Card className="max-w-lg p-6">
        <p className="text-creo-sm text-creo-gray-500">
          Pour l’instant, ouvre une formation existante pour voir l’éditeur
          3 colonnes.
        </p>
        <div className="mt-6 flex flex-wrap gap-2">
          <Link
            href="/dashboard/courses"
            className={buttonVariants({ variant: "outline" })}
          >
            Retour
          </Link>
          <Link href="/dashboard/courses/c1" className={buttonVariants()}>
            Ouvrir la démo
          </Link>
        </div>
      </Card>
    </>
  );
}
