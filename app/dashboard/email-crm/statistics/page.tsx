import { BarChart3, Mail } from "lucide-react";
import { redirect } from "next/navigation";

import { Card } from "@/components/ui/card";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function EmailCrmStatisticsPage() {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  let eventCount = 0;
  if (workspaceId) {
    const { count } = await supabase
      .from("email_campaign_events")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId);
    eventCount = count ?? 0;
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="flex items-center gap-3 p-5">
          <Mail className="size-5 text-creo-purple" aria-hidden />
          <div>
            <p className="text-creo-xs uppercase text-creo-gray-500">Événements enregistrés</p>
            <p className="text-2xl font-semibold tabular-nums dark:text-white">{eventCount}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-5">
          <BarChart3 className="size-5 text-creo-purple" aria-hidden />
          <div>
            <p className="text-creo-xs uppercase text-creo-gray-500">Dashboard avancé</p>
            <p className="text-creo-sm text-creo-gray-500">
              Graphiques (Recharts), heatmap des liens et exports par campagne — prochaine itération.
            </p>
          </div>
        </Card>
      </div>
    </>
  );
}
