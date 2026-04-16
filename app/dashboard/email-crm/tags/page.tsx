import { redirect } from "next/navigation";

import { TagsCrmView } from "@/components/dashboard/email-crm/tags-crm-view";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function EmailCrmTagsPage() {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  let tags: {
    id: string;
    name: string;
    slug: string;
    color_hex: string | null;
    contactCount?: number;
  }[] = [];

  if (workspaceId) {
    const { data } = await supabase
      .from("workspace_tags")
      .select("id, name, slug, color_hex")
      .eq("workspace_id", workspaceId)
      .order("name", { ascending: true });

    tags = (data ?? []) as typeof tags;

    const { data: tagUsages } = await supabase
      .from("contacts")
      .select("tags")
      .eq("workspace_id", workspaceId);

    const counts = new Map<string, number>();
    for (const row of tagUsages ?? []) {
      for (const t of (row.tags as string[]) ?? []) {
        counts.set(t, (counts.get(t) ?? 0) + 1);
      }
    }

    tags = tags.map((t) => ({
      ...t,
      contactCount: counts.get(t.name) ?? 0,
    }));
  }

  return <TagsCrmView tags={tags} />;
}
