import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Premier workspace du user (déterministe). N’utilise pas `.maybeSingle()` :
 * avec plusieurs lignes dans `workspace_members`, `maybeSingle` renvoie une erreur PostgREST.
 */
export async function getFirstWorkspaceIdForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .limit(1);

    if (error || !data?.[0]) {
      return null;
    }
    return data[0].workspace_id;
  } catch {
    return null;
  }
}
