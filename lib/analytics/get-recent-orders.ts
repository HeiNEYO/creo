import type { SupabaseClient } from "@supabase/supabase-js";

import { COCKPIT_RECENT_ORDERS_LIMIT } from "@/lib/config/limits";

export type CockpitOrderRow = {
  id: string;
  amount: number;
  currency: string;
  product_type: string;
  created_at: string;
};

export async function getCockpitRecentOrders(
  supabase: SupabaseClient,
  workspaceId: string,
  limit = COCKPIT_RECENT_ORDERS_LIMIT
): Promise<CockpitOrderRow[]> {
  const { data, error } = await supabase
    .from("orders")
    .select("id, amount, currency, product_type, created_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "paid")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !Array.isArray(data)) {
    return [];
  }
  return data as CockpitOrderRow[];
}
