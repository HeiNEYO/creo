"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

function normalizeEmail(s: string | undefined): string | null {
  const t = s?.trim().toLowerCase();
  if (!t) {
    return null;
  }
  if (!t.includes("@")) {
    return null;
  }
  return t;
}

async function assertPageInWorkspace(
  supabase: ReturnType<typeof createClient>,
  pageId: string,
  workspaceId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("pages")
    .select("id")
    .eq("id", pageId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return !!data;
}

export async function saveWorkspaceEmailSettingsServer(input: {
  fromName: string;
  fromEmail: string;
  replyTo?: string;
  doubleOptIn: boolean;
  doubleOptInSubject?: string;
  doubleOptInHtml?: string;
  unsubPageId?: string | null;
  confirmPageId?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return { ok: false, error: "Aucun workspace." };
  }

  const fromEmail = normalizeEmail(input.fromEmail);
  if (!fromEmail) {
    return { ok: false, error: "Email expéditeur invalide." };
  }

  const replyTo = normalizeEmail(input.replyTo ?? undefined);

  const unsub = input.unsubPageId?.trim() || null;
  const confirm = input.confirmPageId?.trim() || null;

  if (unsub && !(await assertPageInWorkspace(supabase, unsub, workspaceId))) {
    return { ok: false, error: "Page de désabonnement invalide." };
  }
  if (confirm && !(await assertPageInWorkspace(supabase, confirm, workspaceId))) {
    return { ok: false, error: "Page de confirmation invalide." };
  }

  const { error } = await supabase.from("workspace_email_settings").upsert(
    {
      workspace_id: workspaceId,
      from_name: input.fromName.trim() || null,
      from_email: fromEmail,
      reply_to: replyTo,
      double_opt_in: input.doubleOptIn,
      double_opt_in_subject: input.doubleOptInSubject?.trim() || null,
      double_opt_in_html: input.doubleOptInHtml?.trim() || null,
      unsub_page_id: unsub,
      confirm_page_id: confirm,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "workspace_id" }
  );

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  revalidatePath("/dashboard/email-crm/settings");
  return { ok: true };
}
