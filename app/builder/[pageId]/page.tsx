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
    .select("id, title, type, published, content")
    .eq("id", params.pageId)
    .maybeSingle();

  if (error || !page) {
    notFound();
  }

  return (
    <BuilderShell
      pageId={page.id}
      initialTitle={page.title}
      initialPublished={page.published}
      initialType={page.type}
      initialContent={page.content}
    />
  );
}
