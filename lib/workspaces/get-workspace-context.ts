import { createClient } from "@/lib/supabase/server";
import { ensureDefaultWorkspaceSafe } from "@/lib/workspaces/ensure-default";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export type WorkspaceContext = {
  supabase: ReturnType<typeof createClient>;
  user: { id: string; email?: string | null } | null;
  workspaceId: string | null;
};

/**
 * Contexte serveur : client Supabase + utilisateur + premier workspace membre.
 * Si aucun workspace (session ancienne, RPC jamais appelée, etc.), tente
 * `ensure_default_workspace` puis relit l’id.
 */
export async function getWorkspaceContext(): Promise<WorkspaceContext> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, user: null, workspaceId: null };
  }

  let workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);

  if (!workspaceId) {
    await ensureDefaultWorkspaceSafe(supabase);
    workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  }

  return {
    supabase,
    user: { id: user.id, email: user.email },
    workspaceId,
  };
}
