import { NextResponse } from "next/server";

import { CRM_CONTACTS_PAGE_SIZE } from "@/lib/config/limits";
import { fetchContactsCrmPage } from "@/lib/contacts/fetch-contacts-crm";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { fetchWorkspacePlan } from "@/lib/workspaces/fetch-workspace-plan";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";
import { isPaidPlatformPlan, PLATFORM_UPGRADE_EXPORT_MESSAGE } from "@/lib/workspaces/platform-plan";

export const dynamic = "force-dynamic";

function csvEscape(s: string): string {
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: Request) {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return NextResponse.json({ error: "Aucun workspace" }, { status: 400 });
  }

  const plan = await fetchWorkspacePlan(supabase, workspaceId);
  if (!isPaidPlatformPlan(plan)) {
    return NextResponse.json({ error: PLATFORM_UPGRADE_EXPORT_MESSAGE }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const sort = searchParams.get("sort") ?? "created_at";
  const dir = searchParams.get("dir") === "asc" ? "asc" : "desc";

  const rows: Awaited<ReturnType<typeof fetchContactsCrmPage>>["rows"] = [];
  let page = 1;
  for (;;) {
    const batch = await fetchContactsCrmPage(supabase, workspaceId, {
      q,
      tag,
      sort,
      dir,
      page,
    });
    rows.push(...batch.rows);
    if (batch.rows.length < CRM_CONTACTS_PAGE_SIZE) {
      break;
    }
    page += 1;
    if (page > 500) {
      break;
    }
  }

  const header = ["email", "first_name", "last_name", "phone", "tags", "source", "subscribed", "created_at"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [
        csvEscape(r.email),
        csvEscape(r.first_name ?? ""),
        csvEscape(r.last_name ?? ""),
        csvEscape(r.phone ?? ""),
        csvEscape((r.tags ?? []).join(";")),
        csvEscape(r.source ?? ""),
        r.subscribed ? "1" : "0",
        csvEscape(r.created_at),
      ].join(",")
    ),
  ];

  return new NextResponse(lines.join("\r\n"), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="contacts-export.csv"',
    },
  });
}
