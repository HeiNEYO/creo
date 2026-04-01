import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

function slugPrefixFromEmail(email: string | undefined): string {
  const local = email?.split("@")[0]?.toLowerCase() ?? "";
  const cleaned = local.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned.length > 0 ? cleaned.slice(0, 48) : "workspace";
}

/**
 * Crée un workspace + ligne owner dans workspace_members si l’utilisateur n’en a aucun.
 * Le slug inclut un suffixe aléatoire pour respecter l’unicité globale sans lire les autres workspaces (RLS).
 */
export async function ensureDefaultWorkspace(
  supabase: SupabaseClient,
  user: User
): Promise<void> {
  const { data: memberRow, error: memberError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (memberError) {
    throw new Error(memberError.message);
  }
  if (memberRow) {
    return;
  }

  const meta = user.user_metadata as { full_name?: string } | undefined;
  const fullName = meta?.full_name?.trim();
  if (fullName) {
    const { error: profileError } = await supabase
      .from("profiles")
      .update({ full_name: fullName })
      .eq("id", user.id);
    if (profileError) {
      throw new Error(profileError.message);
    }
  }

  const prefix = slugPrefixFromEmail(user.email ?? undefined);
  const slug = `${prefix}-${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;

  const { data: workspace, error: workspaceError } = await supabase
    .from("workspaces")
    .insert({
      name: "Mon workspace",
      slug,
      owner_id: user.id,
    })
    .select("id")
    .single();

  if (workspaceError) {
    throw new Error(workspaceError.message);
  }

  const { error: insertMemberError } = await supabase
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
    });

  if (insertMemberError) {
    throw new Error(insertMemberError.message);
  }
}
