"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

function slugifyWorkspaceSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function updateWorkspaceServer(input: {
  name: string;
  slug: string;
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

  const name = input.name.trim();
  const slug = slugifyWorkspaceSlug(input.slug);
  if (!name) {
    return { ok: false, error: "Le nom est requis." };
  }
  if (!slug) {
    return { ok: false, error: "Le slug est invalide." };
  }

  const { error } = await supabase
    .from("workspaces")
    .update({ name, slug })
    .eq("id", workspaceId);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ce slug est déjà pris. Choisis-en un autre." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
