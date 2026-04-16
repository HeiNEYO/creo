import { NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/supabase/service-role";

export const dynamic = "force-dynamic";

type Body = {
  pageId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  tags?: string[];
  source?: string;
};

/** Opt-in public : la page fournit l’ID ; le workspace est résolu côté serveur (service role). */
export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "JSON invalide." }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  const pageId = body.pageId?.trim();

  if (!email?.includes("@") || !pageId) {
    return NextResponse.json(
      { ok: false, error: "Paramètres manquants (email, pageId)." },
      { status: 400 }
    );
  }

  const supabase = createServiceRoleClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, error: "SUPABASE_SERVICE_ROLE_KEY manquant côté serveur." },
      { status: 503 }
    );
  }

  const { data: page, error: pageErr } = await supabase
    .from("pages")
    .select("id, workspace_id")
    .eq("id", pageId)
    .maybeSingle();

  if (pageErr || !page) {
    return NextResponse.json({ ok: false, error: "Page introuvable." }, { status: 404 });
  }

  const tags = Array.isArray(body.tags) ? body.tags.map((t) => String(t).trim()).filter(Boolean) : [];

  const { error: upsertErr } = await supabase.from("contacts").upsert(
    {
      workspace_id: page.workspace_id,
      email,
      first_name: body.firstName?.trim() || null,
      last_name: body.lastName?.trim() || null,
      tags,
      subscribed: true,
      source: body.source?.trim() || "optin_page",
    },
    { onConflict: "workspace_id,email" }
  );

  if (upsertErr) {
    return NextResponse.json({ ok: false, error: upsertErr.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
