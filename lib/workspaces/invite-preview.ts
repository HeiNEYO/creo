import { createServiceRoleClient } from "@/lib/supabase/service";

export type InvitePreviewOk = {
  ok: true;
  workspaceName: string;
  inviteEmail: string;
  expiresAt: string;
};

export type InvitePreviewErr = {
  ok: false;
  reason: "not_found" | "expired" | "used" | "config";
};

export type InvitePreviewResult = InvitePreviewOk | InvitePreviewErr;

/**
 * Aperçu public d’une invitation (service role — appelé uniquement depuis le serveur).
 */
export async function getWorkspaceInvitePreview(
  token: string
): Promise<InvitePreviewResult> {
  const t = token?.trim();
  if (!t || t.length < 10) {
    return { ok: false, reason: "not_found" };
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    return { ok: false, reason: "config" };
  }

  const { data: inv, error: invErr } = await admin
    .from("workspace_invites")
    .select("workspace_id, email, expires_at, accepted_at")
    .eq("token", t)
    .maybeSingle();

  if (invErr || !inv) {
    return { ok: false, reason: "not_found" };
  }

  if (inv.accepted_at) {
    return { ok: false, reason: "used" };
  }

  const exp = new Date(inv.expires_at);
  if (Number.isNaN(exp.getTime()) || exp.getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  const { data: ws } = await admin
    .from("workspaces")
    .select("name")
    .eq("id", inv.workspace_id)
    .maybeSingle();

  const workspaceName = ws?.name?.trim() || "Workspace";
  return {
    ok: true,
    workspaceName,
    inviteEmail: String(inv.email).trim(),
    expiresAt: inv.expires_at,
  };
}
