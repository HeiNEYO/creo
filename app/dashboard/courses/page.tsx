import Link from "next/link";
import { Plus } from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const courses = [
  {
    id: "c1",
    title: "SEO pour débutants",
    desc: "De zéro à ta première page Google en 6 semaines.",
    students: 32,
    completion: 67,
    price: "297 €",
    status: "published" as const,
  },
  {
    id: "c2",
    title: "Lancer son offre en 7 jours",
    desc: "Méthode condensée pour freelances pressés.",
    students: 18,
    completion: 41,
    price: "197 €",
    status: "draft" as const,
  },
];

export default function CoursesPage() {
  return (
    <>
      <PageHeader
        title="Formations"
        description="Structure type Notion + lecteur type Loom (prochaine itération)"
        action={
          <Link
            href="/dashboard/courses/new"
            className={buttonVariants({ className: "gap-2" })}
          >
            <Plus className="size-4" />
            Nouvelle formation
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((c) => (
          <Link key={c.id} href={`/dashboard/courses/${c.id}`}>
            <Card interactive className="h-full overflow-hidden p-0">
              <div className="relative aspect-video bg-gradient-to-br from-creo-purple-pale to-creo-purple/20">
                <span className="absolute left-3 top-3 text-2xl font-semibold text-creo-purple/40">
                  {c.title.slice(0, 2).toUpperCase()}
                </span>
                <div className="absolute right-2 top-2">
                  <Badge variant={c.status === "published" ? "green" : "gray"}>
                    {c.status === "published" ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              </div>
              <div className="p-5">
                <h2 className="text-creo-md font-semibold text-creo-black">
                  {c.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-creo-sm text-creo-gray-500">
                  {c.desc}
                </p>
                <p className="mt-3 text-creo-sm text-creo-gray-500">
                  {c.students} élèves · {c.completion}% complétion · {c.price}
                </p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-creo-gray-100">
                  <div
                    className="h-full rounded-full bg-creo-purple"
                    style={{ width: `${c.completion}%` }}
                  />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
