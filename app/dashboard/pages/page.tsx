import Link from "next/link";
import { redirect } from "next/navigation";

import { PagesBrowser } from "@/components/dashboard/pages/pages-browser";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { buildPublicPagePath, toAbsoluteAppUrl } from "@/lib/dashboard/page-preview-url";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

export default async function DashboardPagesPage() {
  const { supabase, user, workspaceId } = await getWorkspaceContext();

  if (!user) {
    redirect("/login");
  }

  if (!workspaceId) {
    return (
      <Card className="p-8 text-center">
        <p className="text-creo-md font-medium text-creo-black">
          Workspace introuvable
        </p>
        <p className="mt-2 text-creo-sm text-creo-gray-500">
          Déconnecte-toi puis reconnecte-toi pour initialiser ton espace.
        </p>
        <Link href="/login" className={buttonVariants({ className: "mt-6" })}>
          Connexion
        </Link>
      </Card>
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "").trim();

  const [{ data: rows, error }, { data: wsRow }] = await Promise.all([
    supabase
      .from("pages")
      .select("id, title, type, published, views, updated_at, slug")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false }),
    supabase.from("workspaces").select("slug").eq("id", workspaceId).maybeSingle(),
  ]);

  if (error) {
    return (
      <Card className="p-8 text-center text-creo-sm text-red-600">
        Impossible de charger les pages : {error.message}
      </Card>
    );
  }

  const workspaceSlug = typeof wsRow?.slug === "string" ? wsRow.slug : "";

  const pages =
    rows?.map((r) => {
      const published = Boolean(r.published);
      const hasSlugs =
        published && workspaceSlug && typeof r.slug === "string" && r.slug.trim();
      const previewRel = hasSlugs ? buildPublicPagePath(workspaceSlug, r.slug, { preview: true }) : null;
      const viewRel = hasSlugs ? buildPublicPagePath(workspaceSlug, r.slug) : null;
      const previewUrl = previewRel ? toAbsoluteAppUrl(previewRel, appUrl) : null;
      const publicViewUrl = viewRel ? toAbsoluteAppUrl(viewRel, appUrl) : null;
      return {
        id: r.id,
        title: r.title,
        type: r.type,
        published,
        views: Number(r.views ?? 0),
        updated_at: r.updated_at,
        slug: typeof r.slug === "string" ? r.slug : "",
        previewUrl,
        publicViewUrl,
      };
    }) ?? [];

  return <PagesBrowser pages={pages} />;
}
