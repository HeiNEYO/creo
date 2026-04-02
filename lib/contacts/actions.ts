"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export async function createContactServer(input: {
  email: string;
  firstName?: string;
  lastName?: string;
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

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Email invalide." };
  }

  const { error } = await supabase.from("contacts").insert({
    workspace_id: workspaceId,
    email,
    first_name: input.firstName?.trim() || null,
    last_name: input.lastName?.trim() || null,
    subscribed: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ce contact existe déjà." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/contacts");
  return { ok: true };
}
