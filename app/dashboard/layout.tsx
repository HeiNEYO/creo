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

  return (
    <DashboardShell
      userEmail={user.email ?? ""}
      displayName={profile?.full_name?.trim() ?? ""}
      avatarUrl={profile?.avatar_url ?? null}
    >
      {children}
    </DashboardShell>
  );
}
