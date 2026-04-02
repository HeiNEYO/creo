import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { supabase, user } = await getWorkspaceContext();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const { data: notifRows, error: notifError } = await supabase
    .from("user_notifications")
    .select("id, title, body, link, read_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const notifications =
    notifError || !notifRows
      ? []
      : notifRows.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          link: n.link,
          read_at: n.read_at,
          created_at: n.created_at,
        }));

  const displayName = profile?.full_name?.trim() || "";

  return (
    <DashboardShell
      userEmail={user.email ?? ""}
      displayName={displayName}
      avatarUrl={profile?.avatar_url ?? null}
      notifications={notifications}
    >
      {children}
    </DashboardShell>
  );
}
