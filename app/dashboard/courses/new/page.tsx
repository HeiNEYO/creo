import Link from "next/link";

import { NewCourseForm } from "@/components/dashboard/courses/new-course-form";
import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";

export default function NewCoursePage() {
  return (
    <>
      <PageHeader
        title="Nouvelle formation"
        description="Crée une formation brouillon puis complète la structure dans l’éditeur."
      />
      <Card className="max-w-lg space-y-6 p-6">
        <NewCourseForm />
        <Link href="/dashboard/courses" className={buttonVariants({ variant: "outline" })}>
          Annuler
        </Link>
      </Card>
    </>
  );
}
