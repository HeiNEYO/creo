import { redirect } from "next/navigation";

import {
  SequencesList,
  type SequenceRow,
} from "@/components/dashboard/emails/sequences-list";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";
import { fetchWorkspacePlan } from "@/lib/workspaces/fetch-workspace-plan";

export const dynamic = "force-dynamic";

export default async function EmailCrmSequencesPage() {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  let sequences: SequenceRow[] = [];
  let platformPlan = "starter";

  if (workspaceId) {
    const plan = await fetchWorkspacePlan(supabase, workspaceId);
    platformPlan = plan ?? "starter";
    const { data } = await supabase
      .from("email_sequences")
      .select("id, name, active")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    const list = (data ?? []) as SequenceRow[];
    const ids = list.map((s) => s.id);
    if (ids.length > 0) {
      const { data: stepRows } = await supabase
        .from("email_sequence_steps")
        .select("sequence_id")
        .in("sequence_id", ids);

      const countMap = new Map<string, number>();
      for (const r of stepRows ?? []) {
        const sid = (r as { sequence_id: string }).sequence_id;
        countMap.set(sid, (countMap.get(sid) ?? 0) + 1);
      }
      sequences = list.map((s) => ({
        ...s,
        stepCount: countMap.get(s.id) ?? 0,
      }));
    } else {
      sequences = list;
    }
  }

  return <SequencesList sequences={sequences} platformPlan={platformPlan} />;
}
