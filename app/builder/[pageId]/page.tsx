import { notFound, redirect } from "next/navigation";

import { BuilderShell } from "@/components/builder/builder-shell";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

type PageProps = { params: { pageId: string } };

export default async function BuilderPage({ params }: PageProps) {
  const { supabase, user } = await getWorkspaceContext();

  if (!user) {
    redirect("/login");
  }

  const { data: page, error } = await supabase
    .from("pages")
    .select("id, title, slug, type, published, content, workspace_id")
    .eq("id", params.pageId)
    .maybeSingle();

  if (error || !page) {
    notFound();
  }

  const { data: ws } = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", page.workspace_id)
    .maybeSingle();

  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const publicPageHref =
    base && ws?.slug
      ? `${base}/p/${ws.slug}/${page.slug}`
      : null;

  return (
    <BuilderShell
      pageId={page.id}
      pageSlug={page.slug}
      workspaceSlug={ws?.slug ?? ""}
      publicPageHref={publicPageHref}
      initialTitle={page.title}
      initialPublished={page.published}
      initialType={page.type}
      initialContent={page.content}
    />
  );
}
