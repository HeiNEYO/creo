import type { SupabaseClient } from "@supabase/supabase-js";

/** Compte les livraisons broadcast déjà enregistrées ce mois-ci (UTC). */
export async function countBroadcastDeliveriesThisMonth(
  supabase: SupabaseClient,
  workspaceId: string
): Promise<number> {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);

  const { count, error } = await supabase
    .from("email_campaign_events")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("event_type", "delivered")
    .gte("created_at", start.toISOString())
    .contains("metadata", { channel: "broadcast" });

  if (error) {
    return 0;
  }
  return count ?? 0;
}
