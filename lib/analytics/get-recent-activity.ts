import type { SupabaseClient } from "@supabase/supabase-js";

import {
  COCKPIT_ACTIVITY_CONTACTS_FETCH,
  COCKPIT_ACTIVITY_MERGED_LIMIT,
  COCKPIT_ACTIVITY_VIEWS_FETCH,
} from "@/lib/config/limits";

export type CockpitActivityItem = {
  id: string;
  headline: string;
  detail: string;
  when: string;
};

function formatRelativeFr(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return "—";
  const diffMs = Date.now() - t;
  const m = Math.floor(diffMs / 60000);
  if (m < 1) return "à l’instant";
  if (m < 60) return `il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `il y a ${h} h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `il y a ${d} j`;
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "short" }).format(new Date(iso));
}

function contactLabel(c: {
  email: string;
  first_name: string | null;
  last_name: string | null;
}): string {
  const n = [c.first_name, c.last_name].filter(Boolean).join(" ").trim();
  if (n) return n;
  return c.email.split("@")[0] || c.email;
}

/**
 * Fil d’activité léger pour le cockpit (contacts récents + vues analytics).
 */
export async function getCockpitRecentActivity(
  supabase: SupabaseClient,
  workspaceId: string,
  limit = COCKPIT_ACTIVITY_MERGED_LIMIT
): Promise<CockpitActivityItem[]> {
  const [contactsRes, eventsRes] = await Promise.all([
    supabase
      .from("contacts")
      .select("id, email, first_name, last_name, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(COCKPIT_ACTIVITY_CONTACTS_FETCH),
    supabase
      .from("analytics_events")
      .select("id, created_at, page_id, event_type")
      .eq("workspace_id", workspaceId)
      .eq("event_type", "view")
      .order("created_at", { ascending: false })
      .limit(COCKPIT_ACTIVITY_VIEWS_FETCH),
  ]);

  const contacts = contactsRes.data ?? [];
  const events = eventsRes.data ?? [];

  const pageIds = Array.from(
    new Set(
      events
        .map((e) => e.page_id)
        .filter((id): id is string => typeof id === "string")
    )
  );

  const titleByPageId = new Map<string, string>();
  if (pageIds.length > 0) {
    const { data: pages } = await supabase
      .from("pages")
      .select("id, title")
      .in("id", pageIds);
    for (const p of pages ?? []) {
      titleByPageId.set(p.id, (p.title || "Page").trim() || "Page");
    }
  }

  type Raw = { sort: number; item: CockpitActivityItem };
  const raw: Raw[] = [];

  for (const c of contacts) {
    const created = c.created_at as string;
    raw.push({
      sort: new Date(created).getTime(),
      item: {
        id: `c-${c.id}`,
        headline: contactLabel(c),
        detail: "Nouveau contact",
        when: formatRelativeFr(created),
      },
    });
  }

  for (const e of events) {
    const created = e.created_at as string;
    const title = e.page_id ? titleByPageId.get(e.page_id) ?? "Page publique" : "Page publique";
    raw.push({
      sort: new Date(created).getTime(),
      item: {
        id: `v-${e.id}`,
        headline: title,
        detail: "Vue enregistrée",
        when: formatRelativeFr(created),
      },
    });
  }

  raw.sort((a, b) => b.sort - a.sort);
  return raw.slice(0, limit).map((r) => r.item);
}
