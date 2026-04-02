import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const user = await readAuthUser(supabase);

  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  let searchPages: { id: string; title: string }[] = [];
  if (workspaceId) {
    const { data } = await supabase
      .from("pages")
      .select("id, title")
      .eq("workspace_id", workspaceId)
      .order("updated_at", { ascending: false })
      .limit(80);
    searchPages = (data ?? []).map((p) => ({
      id: p.id,
      title: p.title ?? "",
    }));
  }

  return (
    <DashboardShell
      userEmail={user.email ?? ""}
      searchPages={searchPages}
    >
      {children}
    </DashboardShell>
  );
}
