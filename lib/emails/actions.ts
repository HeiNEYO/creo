"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export async function createEmailCampaignServer(input: {
  name: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return { ok: false, error: "Aucun workspace." };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Le nom est requis." };
  }

  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      workspace_id: workspaceId,
      name,
      subject: "",
      content: {},
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/emails");
  return { ok: true, id: data.id };
}

export async function createEmailSequenceServer(input: {
  name: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return { ok: false, error: "Aucun workspace." };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Le nom est requis." };
  }

  const { data, error } = await supabase
    .from("email_sequences")
    .insert({
      workspace_id: workspaceId,
      name,
      trigger_type: "manual",
      trigger_config: {},
      active: false,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/emails");
  return { ok: true, id: data.id };
}

export async function updateEmailCampaignServer(input: {
  campaignId: string;
  name: string;
  subject: string;
  previewText?: string;
  htmlBody: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const name = input.name.trim();
  if (!name) {
    return { ok: false, error: "Le nom est requis." };
  }

  const content = { html: input.htmlBody };

  const { error } = await supabase
    .from("email_campaigns")
    .update({
      name,
      subject: input.subject.trim(),
      preview_text: input.previewText?.trim() || null,
      content,
    })
    .eq("id", input.campaignId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/emails");
  revalidatePath(`/dashboard/emails/campaigns/${input.campaignId}`);
  return { ok: true };
}

export async function sendEmailCampaignTestServer(input: {
  campaignId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return {
      ok: false,
      error: "RESEND_API_KEY manquant côté serveur.",
    };
  }

  const from =
    process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";

  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user?.email) {
    return { ok: false, error: "Non connecté." };
  }

  const { data: camp, error } = await supabase
    .from("email_campaigns")
    .select("name, subject, content")
    .eq("id", input.campaignId)
    .single();

  if (error || !camp) {
    return { ok: false, error: error?.message ?? "Campagne introuvable." };
  }

  const html =
    typeof (camp.content as { html?: string } | null)?.html === "string"
      ? (camp.content as { html: string }).html
      : "<p>(Contenu vide)</p>";

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);
  const { error: sendErr } = await resend.emails.send({
    from,
    to: user.email,
    subject: `[Test] ${camp.subject || camp.name}`,
    html,
  });

  if (sendErr) {
    return { ok: false, error: sendErr.message ?? "Envoi Resend refusé." };
  }

  return { ok: true };
}
