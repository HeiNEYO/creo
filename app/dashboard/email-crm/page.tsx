import { redirect } from "next/navigation";

import { EmailCrmHub } from "@/components/dashboard/email-crm/email-crm-hub";
import { getMarketingOverviewStats } from "@/lib/marketing/get-marketing-overview-stats";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function EmailCrmHomePage() {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  const stats = workspaceId
    ? await getMarketingOverviewStats(workspaceId)
    : null;

  return <EmailCrmHub stats={stats} />;
}
