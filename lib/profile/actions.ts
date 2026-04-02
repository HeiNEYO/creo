"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileServer(input: {
  fullName: string;
  avatarUrl: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const full_name = input.fullName.trim() || null;
  let avatar_url: string | null = input.avatarUrl.trim();
  if (!avatar_url) {
    avatar_url = null;
  } else {
    try {
      // Valide URL absolue (photo hébergée : Supabase Storage, Gravatar, etc.)
      const u = new URL(avatar_url);
      if (u.protocol !== "https:" && u.protocol !== "http:") {
        return { ok: false, error: "URL de photo invalide." };
      }
    } catch {
      return { ok: false, error: "URL de photo invalide." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, avatar_url })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/profile");
  revalidatePath("/dashboard/settings");
  return { ok: true };
}
