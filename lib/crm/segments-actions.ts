"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export async function createCrmSegmentServer(input: {
  name: string;
  rules: Record<string, unknown>;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }
  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return { ok: false, error: "Aucun workspace." };
  }
  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Le nom est requis." };
  }

  const { data, error } = await supabase
    .from("crm_segments")
    .insert({
      workspace_id: workspaceId,
      name,
      rules: input.rules,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  return { ok: true, id: data.id };
}

export async function deleteCrmSegmentServer(input: {
  segmentId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }
  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return { ok: false, error: "Aucun workspace." };
  }

  const { data: seg, error: fetchErr } = await supabase
    .from("crm_segments")
    .select("workspace_id")
    .eq("id", input.segmentId)
    .maybeSingle();

  if (fetchErr || !seg) {
    return { ok: false, error: fetchErr?.message ?? "Segment introuvable." };
  }

  if (seg.workspace_id !== workspaceId) {
    return { ok: false, error: "Accès refusé." };
  }

  const { error } = await supabase.from("crm_segments").delete().eq("id", input.segmentId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  return { ok: true };
}
