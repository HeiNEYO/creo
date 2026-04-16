"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CourseThumbnail } from "@/components/dashboard/courses/course-thumbnail";
import { DeleteCourseButton } from "@/components/dashboard/courses/delete-course-button";
import { NewCourseDialog } from "@/components/dashboard/courses/new-course-dialog";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type CourseBandRow = {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  price: number;
  currency: string;
  status: string;
  access_type: string;
};

function formatPrice(amount: number, currency: string | null | undefined): string {
  const cur = (currency ?? "eur").toUpperCase();
  const code = cur === "EUR" ? "EUR" : cur;
  try {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: code,
    }).format(amount);
  } catch {
    return `${amount} ${currency ?? ""}`;
  }
}

const accessLabels: Record<string, string> = {
  paid: "Payant",
  free: "Gratuit",
  members_only: "Membres",
};

export function CoursesDashboard({ courses }: { courses: CourseBandRow[] }) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <PageHeader
        title="Formations"
        description="Crée des formations, modules et leçons — tout est enregistré dans Supabase."
        action={
          <Button type="button" className="gap-2" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" />
            Nouvelle formation
          </Button>
        }
      />

      {courses.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-creo-md font-medium text-creo-black dark:text-foreground">
            Aucune formation
          </p>
          <p className="mt-2 max-w-sm text-creo-sm text-creo-gray-500">
            Crée une formation ou attends la synchro avec ton workspace.
          </p>
          <Button
            type="button"
            className="mt-6 gap-2"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="size-4" />
            Nouvelle formation
          </Button>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {courses.map((c) => (
            <Card
              key={c.id}
              className="flex flex-col gap-3 p-3 sm:flex-row sm:items-stretch sm:gap-4"
            >
              <Link
                href={`/dashboard/courses/${c.id}`}
                className="group flex min-w-0 flex-1 gap-3 sm:gap-4"
              >
                <div className="h-20 w-28 shrink-0 overflow-hidden rounded-md">
                  <CourseThumbnail
                    title={c.title || "?"}
                    thumbnailUrl={c.thumbnail_url}
                    className="h-full w-full"
                  />
                </div>
                <div className="min-w-0 flex-1 py-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-creo-md font-semibold text-creo-black group-hover:underline dark:text-foreground">
                      {c.title || "Sans titre"}
                    </h2>
                    <Badge variant={c.status === "published" ? "green" : "gray"}>
                      {c.status === "published" ? "Publié" : "Brouillon"}
                    </Badge>
                    <Badge variant="outline" className="border-zinc-200/80 dark:border-zinc-600">
                      {accessLabels[c.access_type] ?? c.access_type}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-creo-sm text-creo-gray-500">
                    {c.description?.trim() ? c.description : "—"}
                  </p>
                  <p className="mt-2 text-creo-sm font-medium text-creo-gray-700 dark:text-zinc-300">
                    {formatPrice(c.price, c.currency)}
                  </p>
                </div>
              </Link>

              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-creo-gray-100 pt-3 dark:border-zinc-800 sm:flex-col sm:justify-center sm:border-t-0 sm:pt-0">
                <Link
                  href={`/dashboard/courses/${c.id}`}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  Ouvrir
                </Link>
                <DeleteCourseButton
                  courseId={c.id}
                  title={c.title || "Sans titre"}
                  label="Supprimer"
                />
              </div>
            </Card>
          ))}
        </div>
      )}

      <NewCourseDialog open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
