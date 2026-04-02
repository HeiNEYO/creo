import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await getWorkspaceContext();

  if (!user) {
    redirect("/login");
  }

  return (
    <DashboardShell userEmail={user.email ?? ""}>{children}</DashboardShell>
  );
}
