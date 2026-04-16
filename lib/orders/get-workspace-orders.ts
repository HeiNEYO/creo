import type { SupabaseClient } from "@supabase/supabase-js";

export type WorkspaceOrderRow = {
  id: string;
  createdAt: string;
  status: string;
  amount: number;
  currency: string;
  productType: string;
  productId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  productLabel: string;
};

function contactDisplayName(
  email: string | null,
  first: string | null,
  last: string | null
): { name: string | null; email: string | null } {
  const parts = [first?.trim(), last?.trim()].filter(Boolean);
  const name = parts.length ? parts.join(" ") : null;
  return { name, email: email?.trim() || null };
}

export async function getWorkspaceOrdersEnriched(
  supabase: SupabaseClient,
  workspaceId: string,
  limit = 500
): Promise<WorkspaceOrderRow[]> {
  const { data: orderRows, error } = await supabase
    .from("orders")
    .select(
      "id, amount, currency, status, product_type, product_id, created_at, contact_id"
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !orderRows?.length) {
    return [];
  }

  const contactIds = Array.from(
    new Set(
      orderRows
        .map((r) => r.contact_id as string | null)
        .filter((id): id is string => Boolean(id))
    )
  );

  const contactById = new Map<
    string,
    { email: string | null; first_name: string | null; last_name: string | null }
  >();

  if (contactIds.length > 0) {
    const { data: contacts } = await supabase
      .from("contacts")
      .select("id, email, first_name, last_name")
      .eq("workspace_id", workspaceId)
      .in("id", contactIds);

    for (const c of contacts ?? []) {
      contactById.set(c.id as string, {
        email: (c.email as string) ?? null,
        first_name: (c.first_name as string) ?? null,
        last_name: (c.last_name as string) ?? null,
      });
    }
  }

  const courseIds = Array.from(
    new Set(
      orderRows
        .filter((r) => r.product_type === "course" && r.product_id)
        .map((r) => r.product_id as string)
    )
  );
  const pageIds = Array.from(
    new Set(
      orderRows
        .filter((r) => r.product_type === "page" && r.product_id)
        .map((r) => r.product_id as string)
    )
  );

  const courseTitleById = new Map<string, string>();
  if (courseIds.length > 0) {
    const { data: courses } = await supabase
      .from("courses")
      .select("id, title")
      .eq("workspace_id", workspaceId)
      .in("id", courseIds);
    for (const row of courses ?? []) {
      const t = (row.title as string)?.trim();
      courseTitleById.set(row.id as string, t || "Formation");
    }
  }

  const pageTitleById = new Map<string, string>();
  if (pageIds.length > 0) {
    const { data: pages } = await supabase
      .from("pages")
      .select("id, title")
      .eq("workspace_id", workspaceId)
      .in("id", pageIds);
    for (const row of pages ?? []) {
      const t = (row.title as string)?.trim();
      pageTitleById.set(row.id as string, t || "Page");
    }
  }

  const typeFallback: Record<string, string> = {
    page: "Page",
    course: "Formation",
    membership: "Abonnement",
  };

  return orderRows.map((r) => {
    const cid = r.contact_id as string | null;
    const c = cid ? contactById.get(cid) : undefined;
    const { name, email } = c
      ? contactDisplayName(c.email, c.first_name, c.last_name)
      : { name: null, email: null };

    const pt = r.product_type as string;
    const pid = r.product_id as string | null;
    let productLabel = typeFallback[pt] ?? pt;
    if (pt === "course" && pid) {
      productLabel = courseTitleById.get(pid) ?? productLabel;
    } else if (pt === "page" && pid) {
      productLabel = pageTitleById.get(pid) ?? productLabel;
    }

    return {
      id: r.id as string,
      createdAt: r.created_at as string,
      status: r.status as string,
      amount: Number(r.amount ?? 0),
      currency: String(r.currency ?? "eur").toLowerCase(),
      productType: pt,
      productId: pid,
      customerEmail: email,
      customerName: name,
      productLabel,
    };
  });
}
