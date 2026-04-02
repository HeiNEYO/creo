"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";

/**
 * Fusionne des réponses dans signup_intake (brouillon ou étapes Typeform).
 */
export async function saveSignupIntakeDraftServer(
  answers: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const { data: row, error: fetchErr } = await supabase
    .from("profiles")
    .select("signup_intake")
    .eq("id", user.id)
    .single();

  if (fetchErr) {
    return { ok: false, error: fetchErr.message };
  }

  const prev =
    (row?.signup_intake as Record<string, unknown> | null | undefined) ?? {};
  const next = { ...prev, ...answers };

  const { error } = await supabase
    .from("profiles")
    .update({ signup_intake: next })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/questionnaire");
  revalidatePath("/dashboard/admin/creo-intake");
  return { ok: true };
}

/**
 * Enregistre les réponses finales et marque le questionnaire comme terminé.
 */
export async function completeSignupIntakeServer(
  answers: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const { data: row, error: fetchErr } = await supabase
    .from("profiles")
    .select("signup_intake")
    .eq("id", user.id)
    .single();

  if (fetchErr) {
    return { ok: false, error: fetchErr.message };
  }

  const prev =
    (row?.signup_intake as Record<string, unknown> | null | undefined) ?? {};
  const next = { ...prev, ...answers };

  const { error } = await supabase
    .from("profiles")
    .update({
      signup_intake: next,
      signup_intake_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/questionnaire");
  revalidatePath("/dashboard/admin/creo-intake");
  return { ok: true };
}
