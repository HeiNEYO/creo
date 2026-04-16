import type { SupabaseClient } from "@supabase/supabase-js";

import { CRM_CONTACTS_PAGE_SIZE } from "@/lib/config/limits";

export type ContactsCrmFetchResult = {
  rows: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    tags: string[];
    source: string | null;
    subscribed: boolean;
    created_at: string;
  }[];
  total: number;
};

export async function fetchContactsCrmPage(
  supabase: SupabaseClient,
  workspaceId: string,
  opts: {
    q?: string;
    tag?: string;
    sort?: string;
    dir?: "asc" | "desc";
    page?: number;
  }
): Promise<ContactsCrmFetchResult> {
  const pageSize = CRM_CONTACTS_PAGE_SIZE;
  const page = Math.max(1, opts.page ?? 1);
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("contacts")
    .select(
      "id, email, first_name, last_name, phone, tags, source, subscribed, created_at",
      { count: "exact" }
    )
    .eq("workspace_id", workspaceId);

  const q = opts.q?.trim();
  if (q) {
    const esc = q.replace(/%/g, "\\%").replace(/_/g, "\\_");
    query = query.or(
      `email.ilike.%${esc}%,first_name.ilike.%${esc}%,last_name.ilike.%${esc}%`
    );
  }

  const tag = opts.tag?.trim();
  if (tag) {
    query = query.contains("tags", [tag]);
  }

  const sortCol =
    opts.sort === "email"
      ? "email"
      : opts.sort === "name" || opts.sort === "last_name"
        ? "last_name"
        : "created_at";
  const ascending = opts.dir === "asc";

  query = query.order(sortCol, { ascending });

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    rows: (data ?? []) as ContactsCrmFetchResult["rows"],
    total: count ?? 0,
  };
}
