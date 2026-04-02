import { NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env-public";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

/**
 * Index léger pour la palette ⌘K — ne bloque plus le layout dashboard.
 */
export async function GET() {
  if (!getSupabasePublicEnv()) {
    return NextResponse.json({ pages: [] }, { status: 503 });
  }

  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return NextResponse.json({ pages: [] }, { status: 401 });
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return NextResponse.json({ pages: [] });
  }

  const { data, error } = await supabase
    .from("pages")
    .select("id, title")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(80);

  if (error) {
    return NextResponse.json(
      { pages: [], error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    pages: (data ?? []).map((p) => ({
      id: p.id,
      title: p.title ?? "",
    })),
  });
}
