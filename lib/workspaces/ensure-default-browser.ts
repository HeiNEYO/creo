import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Bootstrap workspace depuis le navigateur (JWT déjà présent sur le client Supabase).
 * Évite la Server Action, source d’échecs silencieux (undefined) en prod.
 */
export async function ensureDefaultWorkspaceFromBrowser(
  supabase: SupabaseClient
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc("ensure_default_workspace");
  if (error) {
    return { error: error.message };
  }
  return { error: null };
}
