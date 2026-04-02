import Link from "next/link";
import { redirect } from "next/navigation";

import { PagesBrowser } from "@/components/dashboard/pages/pages-browser";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
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

  const { data: rows, error } = await supabase
    .from("pages")
    .select("id, title, type, published, views, updated_at")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (error) {
    return (
      <Card className="p-8 text-center text-creo-sm text-red-600">
        Impossible de charger les pages : {error.message}
      </Card>
    );
  }

  const pages =
    rows?.map((r) => ({
      id: r.id,
      title: r.title,
      type: r.type,
      published: r.published,
      views: Number(r.views ?? 0),
      updated_at: r.updated_at,
    })) ?? [];

  return <PagesBrowser pages={pages} />;
}
