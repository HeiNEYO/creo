import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { NewCourseForm } from "@/components/dashboard/courses/new-course-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link
          href="/dashboard/courses"
          className={cn(
            buttonVariants({ variant: "ghost", size: "sm" }),
            "-ml-2 gap-1.5 text-creo-gray-600 hover:text-creo-black dark:text-zinc-400 dark:hover:text-white"
          )}
        >
          <ArrowLeft className="size-4" aria-hidden />
          Formations
        </Link>
        <h1 className="text-creo-xl font-semibold tracking-tight text-creo-black dark:text-foreground">
          Nouvelle formation
        </h1>
        <p className="max-w-xl text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
          Les modules et leçons se gèrent ensuite dans l’éditeur.
        </p>
      </div>
      <Card className="max-w-2xl space-y-6 border !border-creo-gray-200/95 p-6 shadow-[var(--creo-shadow-card-rest)] dark:!border-white/[0.12]">
        <NewCourseForm />
        <Link href="/dashboard/courses" className={buttonVariants({ variant: "outline" })}>
          Annuler
        </Link>
      </Card>
    </div>
  );
}
