import { cache } from "react";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export type WorkspaceContext = {
  supabase: ReturnType<typeof createClient>;
  user: { id: string; email?: string | null } | null;
  workspaceId: string | null;
};

/**
 * Contexte serveur : client Supabase + utilisateur + premier workspace membre.
 * `cache()` : une seule exécution par requête (layout + page partagent le résultat).
 */
export const getWorkspaceContext = cache(
  async function getWorkspaceContext(): Promise<WorkspaceContext> {
    const supabase = createClient();
    const user = await readAuthUser(supabase);

    if (!user) {
      return { supabase, user: null, workspaceId: null };
    }

    const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);

    return {
      supabase,
      user: { id: user.id, email: user.email },
      workspaceId,
    };
  }
);
