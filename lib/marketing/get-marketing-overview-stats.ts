import { createClient } from "@/lib/supabase/server";

import { countDistinctTags } from "@/lib/marketing/aggregate-tags";

export type MarketingOverviewStats = {
  contactCount: number;
  distinctTagCount: number;
  /** Campagnes d’envoi (hors modèles). */
  campaignCount: number;
  /** Modèles d’email réutilisables. */
  templateCount: number;
  sequenceCount: number;
  activeSequenceCount: number;
};

export async function getMarketingOverviewStats(
  workspaceId: string
): Promise<MarketingOverviewStats> {
  const supabase = createClient();
  const [contactsHead, tagRows, campHead, tmplHead, seqRes] = await Promise.all([
    supabase
      .from("contacts")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId),
    supabase.from("contacts").select("tags").eq("workspace_id", workspaceId),
    supabase
      .from("email_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("is_template", false),
    supabase
      .from("email_campaigns")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .eq("is_template", true),
    supabase
      .from("email_sequences")
      .select("id, active")
      .eq("workspace_id", workspaceId),
  ]);

  const sequences = seqRes.data ?? [];
  return {
    contactCount: contactsHead.count ?? 0,
    distinctTagCount: countDistinctTags(tagRows.data ?? []),
    campaignCount: campHead.count ?? 0,
    templateCount: tmplHead.count ?? 0,
    sequenceCount: sequences.length,
    activeSequenceCount: sequences.filter((s) => s.active).length,
  };
}
