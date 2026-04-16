import Link from "next/link";

import { NewCourseForm } from "@/components/dashboard/courses/new-course-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";

export default function NewCoursePage() {
  return (
    <>
      <Card className="max-w-2xl space-y-6 p-6">
        <NewCourseForm />
        <Link href="/dashboard/courses" className={buttonVariants({ variant: "outline" })}>
          Annuler
        </Link>
      </Card>
    </>
  );
}
