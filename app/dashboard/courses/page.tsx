import { redirect } from "next/navigation";

import {
  CoursesDashboard,
  type CourseBandRow,
} from "@/components/dashboard/courses/courses-dashboard";
import { Card } from "@/components/ui/card";
import { isRedirectError } from "@/lib/next/is-redirect-error";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

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

  let courses: CourseBandRow[] = [];
  let queryError: string | null = null;

  if (workspaceId) {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select(
          "id, title, description, thumbnail_url, price, currency, status, access_type"
        )
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
              thumbnail_url:
                typeof c.thumbnail_url === "string" && c.thumbnail_url.trim()
                  ? c.thumbnail_url.trim()
                  : null,
              price: Number.isFinite(priceNum) ? priceNum : 0,
              currency:
                typeof c.currency === "string" && c.currency
                  ? c.currency
                  : "eur",
              status: typeof c.status === "string" ? c.status : "draft",
              access_type:
                typeof c.access_type === "string" ? c.access_type : "paid",
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

      {workspaceId && !queryError ? <CoursesDashboard courses={courses} /> : null}
    </>
  );
}
