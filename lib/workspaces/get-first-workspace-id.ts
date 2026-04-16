import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Premier workspace du user (déterministe). D’abord `workspace_members`, puis repli
 * propriétaire (`workspaces.owner_id`) si la ligne membre manque encore.
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
      .order("created_at", { ascending: false })
      .limit(1);

    if (!error && data?.[0]?.workspace_id) {
      return data[0].workspace_id;
    }

    /* Propriétaire sans ligne membre : RLS voit quand même le workspace via owner_id. */
    const { data: owned, error: ownErr } = await supabase
      .from("workspaces")
      .select("id")
      .eq("owner_id", userId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (ownErr || !owned?.[0]?.id) {
      return null;
    }
    return owned[0].id;
  } catch {
    return null;
  }
}
