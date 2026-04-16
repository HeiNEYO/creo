import { notFound, redirect } from "next/navigation";

import {
  SequenceDetailView,
  type SequenceStepRow,
} from "@/components/dashboard/emails/sequence-detail-view";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function EmailSequenceDetailPage({ params }: Props) {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    redirect("/dashboard");
  }

  const { data: seq, error: seqErr } = await supabase
    .from("email_sequences")
    .select("id, name, active")
    .eq("id", params.id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (seqErr || !seq) {
    notFound();
  }

  const { data: stepRows } = await supabase
    .from("email_sequence_steps")
    .select("id, subject, content, delay_days, delay_hours, position")
    .eq("sequence_id", params.id)
    .order("position", { ascending: true });

  const steps = (stepRows ?? []) as SequenceStepRow[];

  return (
    <SequenceDetailView
      sequence={{
        id: seq.id,
        name: seq.name,
        active: seq.active,
      }}
      steps={steps}
    />
  );
}
