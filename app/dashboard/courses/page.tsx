import Link from "next/link";
import { Plus } from "lucide-react";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { isRedirectError } from "@/lib/next/is-redirect-error";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

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

type CourseRow = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  currency: string;
  status: string;
};

export default async function CoursesPage() {
  try {
    return await CoursesPageContent();
  } catch (error) {
    if (isRedirectError(error)) throw error;
    const message = error instanceof Error ? error.message : String(error);
    return (
      <Card className="border-red-200 bg-red-50/90 p-6 dark:border-red-900/50 dark:bg-red-950/30">
        <p className="text-creo-sm font-medium text-red-800 dark:text-red-200">
          Erreur lors du chargement des formations
        </p>
        <p className="mt-2 break-all font-mono text-creo-xs text-red-700 dark:text-red-300">
          {message}
        </p>
        <p className="mt-3 text-creo-xs text-red-600/90 dark:text-red-300/80">
          Si le message est vide, ouvre les logs Vercel (fonction /dashboard/courses) pour la stack
          complète.
        </p>
      </Card>
    );
  }
}

async function CoursesPageContent() {
  const { supabase, user, workspaceId } = await getWorkspaceContext();

  if (!user) {
    redirect("/login");
  }

  let courses: CourseRow[] = [];
  let queryError: string | null = null;

  if (workspaceId) {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("id, title, description, price, currency, status")
        .eq("workspace_id", workspaceId);

      if (error) {
        queryError = error.message;
      } else {
        courses =
          data?.map((c) => {
            const rawPrice = c.price;
            const priceNum =
              typeof rawPrice === "number"
                ? rawPrice
                : typeof rawPrice === "string"
                  ? parseFloat(rawPrice)
                  : Number(rawPrice);
            return {
              id: String(c.id),
              title: typeof c.title === "string" ? c.title : "",
              description:
                c.description === undefined || c.description === null
                  ? null
                  : String(c.description),
              price: Number.isFinite(priceNum) ? priceNum : 0,
              currency:
                typeof c.currency === "string" && c.currency
                  ? c.currency
                  : "eur",
              status: typeof c.status === "string" ? c.status : "draft",
            };
          }) ?? [];
        courses.sort((a, b) => b.id.localeCompare(a.id));
      }
    } catch (e) {
      queryError =
        e instanceof Error ? e.message : "Erreur inattendue lors du chargement.";
    }
  }

  return (
    <>
      <PageHeader
        title="Formations"
        description="Crée des formations, modules et leçons — tout est enregistré dans Supabase."
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

      {!workspaceId ? (
        <Card className="border-amber-200 bg-amber-50/80 p-6 dark:border-amber-900/40 dark:bg-amber-950/25">
          <p className="text-creo-sm font-medium text-amber-900 dark:text-amber-100">
            Aucun workspace disponible
          </p>
          <p className="mt-2 text-creo-sm text-amber-800/90 dark:text-amber-200/90">
            La fonction SQL{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
              ensure_default_workspace
            </code>{" "}
            n’a pas créé d’espace (migration ou droits Supabase). Vérifie la migration{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/50">
              20260402140000_ensure_default_workspace_rpc.sql
            </code>
            , puis recharge.
          </p>
        </Card>
      ) : null}

      {queryError ? (
        <Card className="border-red-200 bg-red-50/80 p-6 dark:border-red-900/50 dark:bg-red-950/30">
          <p className="text-creo-sm font-medium text-red-800 dark:text-red-200">
            Erreur Supabase lors du chargement des formations
          </p>
          <p className="mt-2 font-mono text-creo-xs text-red-700 dark:text-red-300">
            {queryError}
          </p>
          <p className="mt-3 text-creo-xs text-red-600/90 dark:text-red-300/80">
            Vérifie que la table{" "}
            <code className="rounded bg-red-100 px-1 dark:bg-red-900/50">courses</code> existe
            (migration initiale) et les politiques RLS sur ton projet Supabase.
          </p>
        </Card>
      ) : null}

      {!queryError && courses.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-creo-md font-medium text-creo-black dark:text-foreground">
            Aucune formation
          </p>
          <p className="mt-2 max-w-sm text-creo-sm text-creo-gray-500">
            Crée une formation ou attends la synchro avec ton workspace.
          </p>
          <Link
            href="/dashboard/courses/new"
            className={buttonVariants({ className: "mt-6 gap-2" })}
          >
            <Plus className="size-4" />
            Nouvelle formation
          </Link>
        </Card>
      ) : null}

      {!queryError && courses.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((c) => {
            const initials = (c.title || "?").slice(0, 2).toUpperCase();
            return (
              <Link key={c.id} href={`/dashboard/courses/${c.id}`}>
                <Card interactive className="h-full overflow-hidden p-0">
                  <div className="relative aspect-video bg-gradient-to-br from-creo-purple-pale to-creo-purple/20">
                    <span className="absolute left-3 top-3 text-2xl font-semibold text-creo-purple/40">
                      {initials}
                    </span>
                    <div className="absolute right-2 top-2">
                      <Badge variant={c.status === "published" ? "green" : "gray"}>
                        {c.status === "published" ? "Publié" : "Brouillon"}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-5">
                    <h2 className="text-creo-md font-semibold text-creo-black dark:text-foreground">
                      {c.title || "Sans titre"}
                    </h2>
                    <p className="mt-2 line-clamp-2 text-creo-sm text-creo-gray-500">
                      {c.description ?? "—"}
                    </p>
                    <p className="mt-3 text-creo-sm text-creo-gray-500">
                      {formatPrice(c.price, c.currency)}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      ) : null}
    </>
  );
}
