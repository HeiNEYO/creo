import { DASHBOARD_SEARCH_PAGES_LIMIT } from "@/lib/config/limits";
import { jsonData } from "@/lib/http/response";
import { getSupabasePublicEnv } from "@/lib/supabase/env-public";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createRouteHandlerClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

/**
 * Index léger pour la palette ⌘K — ne bloque plus le layout dashboard.
 */
export async function GET() {
  if (!getSupabasePublicEnv()) {
    return jsonData({ pages: [] }, 503);
  }

  const supabase = createRouteHandlerClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return jsonData({ pages: [] }, 401);
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return jsonData({ pages: [] });
  }

  const { data, error } = await supabase
    .from("pages")
    .select("id, title")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(DASHBOARD_SEARCH_PAGES_LIMIT);

  if (error) {
    return jsonData({ pages: [], error: error.message }, 500);
  }

  return jsonData({
    pages: (data ?? []).map((p) => ({
      id: p.id,
      title: p.title ?? "",
    })),
  });
}
