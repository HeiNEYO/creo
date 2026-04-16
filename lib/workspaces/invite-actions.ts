"use server";

import { randomBytes } from "crypto";

import { revalidatePath } from "next/cache";

import { sendWelcomePlatformEmailOnce } from "@/lib/emails/welcome-platform";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export async function createWorkspaceInviteServer(input: {
  email: string;
  role: "member" | "admin";
}): Promise<
  | { ok: true; inviteUrl: string; emailed: boolean }
  | { ok: false; error: string }
> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return { ok: false, error: "Aucun workspace." };
  }

  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Email invalide." };
  }

  if (user.email && normalizeEmail(user.email) === email) {
    return { ok: false, error: "Tu es déjà membre avec ce compte." };
  }

  const role = input.role === "admin" ? "admin" : "member";
  const token = randomBytes(32).toString("base64url");

  const { data: ws, error: wsErr } = await supabase
    .from("workspaces")
    .select("name")
    .eq("id", workspaceId)
    .maybeSingle();

  if (wsErr || !ws) {
    return { ok: false, error: wsErr?.message ?? "Workspace introuvable." };
  }

  const { error: insErr } = await supabase.from("workspace_invites").insert({
    workspace_id: workspaceId,
    email,
    role,
    token,
    invited_by: user.id,
  });

  if (insErr) {
    if (insErr.code === "23505") {
      return {
        ok: false,
        error: "Une invitation est déjà en cours pour cet email.",
      };
    }
    return { ok: false, error: insErr.message };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
  const invitePath = `/invite/${token}`;
  const inviteUrl = appUrl ? `${appUrl}${invitePath}` : invitePath;

  let emailed = false;
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";
  if (apiKey) {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const inviter =
      typeof user.user_metadata?.full_name === "string" &&
      user.user_metadata.full_name.trim()
        ? user.user_metadata.full_name.trim()
        : user.email ?? "Un membre de l’équipe";

    const { error: sendErr } = await resend.emails.send({
      from,
      to: email,
      subject: `Invitation à rejoindre « ${ws.name} » sur CRÉO`,
      html: `
        <p>Bonjour,</p>
        <p><strong>${escapeHtml(inviter)}</strong> t’invite à rejoindre le workspace <strong>${escapeHtml(ws.name)}</strong> sur CRÉO.</p>
        <p><a href="${escapeHtml(inviteUrl)}">Accepter l’invitation</a></p>
        <p style="color:#666;font-size:13px;">Si le lien ne fonctionne pas, copie-colle cette adresse dans ton navigateur :<br/>${escapeHtml(inviteUrl)}</p>
        <p style="color:#666;font-size:13px;">Ce lien expire sous 14 jours.</p>
      `,
    });
    emailed = !sendErr;
  }

  revalidatePath("/dashboard/settings");
  return { ok: true, inviteUrl, emailed };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function revokeWorkspaceInviteServer(input: {
  inviteId: string;
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

  const { error } = await supabase
    .from("workspace_invites")
    .delete()
    .eq("id", input.inviteId)
    .eq("workspace_id", workspaceId)
    .is("accepted_at", null);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function acceptWorkspaceInviteServer(input: {
  token: string;
}): Promise<
  | { ok: true; alreadyMember: boolean }
  | { ok: false; error: string }
> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const token = input.token?.trim();
  if (!token) {
    return { ok: false, error: "Lien invalide." };
  }

  const { data, error } = await supabase.rpc("accept_workspace_invite", {
    p_token: token,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  let row: Record<string, unknown> | null = null;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    row = data as Record<string, unknown>;
  } else if (typeof data === "string") {
    try {
      const p = JSON.parse(data) as unknown;
      if (p && typeof p === "object" && !Array.isArray(p)) row = p as Record<string, unknown>;
    } catch {
      row = null;
    }
  }
  if (!row) {
    return { ok: false, error: "Réponse serveur invalide." };
  }

  if (row.ok === false && typeof row.error === "string") {
    return { ok: false, error: row.error };
  }
  if (row.ok === true) {
    revalidatePath("/", "layout");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    void sendWelcomePlatformEmailOnce(supabase, {
      id: user.id,
      email: user.email,
    }).catch(() => {});
    return { ok: true, alreadyMember: !!row.already_member };
  }

  return { ok: false, error: "Impossible d’accepter l’invitation." };
}
