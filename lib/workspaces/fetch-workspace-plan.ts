import type { SupabaseClient } from "@supabase/supabase-js";

/** Lit `workspaces.plan` pour le workspace courant (RLS). */
export async function fetchWorkspacePlan(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<string | null> {
  const { data } = await supabase
    .from("workspaces")
    .select("plan")
    .eq("id", workspaceId)
    .maybeSingle();
  return typeof data?.plan === "string" ? data.plan.trim() : null;
}
