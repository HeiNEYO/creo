import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Lit auth.getUser() sans déstructurer `data.user` (évite un crash si `data` est null/undefined,
 * ce qui peut arriver en cas de réponse atypique ou d’erreur réseau côté PostgREST).
 */
export async function readAuthUser(
  supabase: SupabaseClient
): Promise<User | null> {
  try {
    const { data } = await supabase.auth.getUser();
    return data?.user ?? null;
  } catch {
    return null;
  }
}
