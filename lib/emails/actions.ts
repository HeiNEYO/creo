"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export async function createEmailCampaignServer(input: {
  name: string;
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
    .from("email_campaigns")
    .insert({
      workspace_id: workspaceId,
      name,
      subject: "",
      content: {},
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/emails");
  return { ok: true, id: data.id };
}

export async function createEmailSequenceServer(input: {
  name: string;
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
    .from("email_sequences")
    .insert({
      workspace_id: workspaceId,
      name,
      trigger_type: "manual",
      trigger_config: {},
      active: false,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/emails");
  return { ok: true, id: data.id };
}
