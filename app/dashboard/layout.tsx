import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";

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

  return (
    <DashboardShell userEmail={user.email ?? ""}>{children}</DashboardShell>
  );
}
