import { createClient } from "@/lib/supabase/server";

export type PublicPageRow = {
  id: string;
  title: string;
  slug: string;
  content: unknown;
  seo_title: string | null;
  seo_description: string | null;
};

export async function fetchPublicPage(
  workspaceSlug: string,
  pageSlug: string
): Promise<PublicPageRow | null> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("get_public_page", {
    p_workspace_slug: workspaceSlug,
    p_page_slug: pageSlug,
  });

  if (error || !data || !Array.isArray(data) || data.length === 0) {
    return null;
  }

  const row = data[0] as PublicPageRow;
  return row;
}

export async function trackPublicPageView(
  workspaceSlug: string,
  pageSlug: string,
  sessionId?: string | null
): Promise<void> {
  const supabase = createClient();
  await supabase.rpc("track_public_page_view", {
    p_workspace_slug: workspaceSlug,
    p_page_slug: pageSlug,
    p_session_id: sessionId ?? null,
  });
}
