"use server";

import { revalidatePath } from "next/cache";

import {
  EMAIL_BROADCAST_MAX_CONTACTS,
  getEmailMonthlyBroadcastCap,
} from "@/lib/config/limits";
import { countBroadcastDeliveriesThisMonth } from "@/lib/emails/broadcast-quota";
import { personalizeEmailText } from "@/lib/email/personalize-template";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";
import { fetchWorkspacePlan } from "@/lib/workspaces/fetch-workspace-plan";
import {
  isPaidPlatformPlan,
  PLATFORM_UPGRADE_BROADCAST_MESSAGE,
  PLATFORM_UPGRADE_SEQUENCE_ACTIVE_MESSAGE,
} from "@/lib/workspaces/platform-plan";

export async function createEmailCampaignServer(input: {
  name: string;
  /** true = modèle réutilisable (pas d’envoi de masse). */
  isTemplate?: boolean;
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

  const isTemplate = Boolean(input.isTemplate);

  const { data, error } = await supabase
    .from("email_campaigns")
    .insert({
      workspace_id: workspaceId,
      name,
      subject: "",
      content: {},
      status: "draft",
      is_template: isTemplate,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
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

  revalidatePath("/dashboard/email-crm", "layout");
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

  const { data: existing } = await supabase
    .from("email_campaigns")
    .select("content, status")
    .eq("id", input.campaignId)
    .maybeSingle();

  if (!existing) {
    return { ok: false, error: "Campagne introuvable." };
  }

  if (existing.status === "sent" || existing.status === "sending") {
    return { ok: false, error: "Campagne déjà envoyée — duplique-la pour créer une nouvelle version." };
  }

  const prev =
    existing.content && typeof existing.content === "object" && !Array.isArray(existing.content)
      ? (existing.content as Record<string, unknown>)
      : {};

  const content = { ...prev, html: input.htmlBody };

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

  revalidatePath("/dashboard/email-crm", "layout");
  revalidatePath(`/dashboard/email-crm/campaigns/${input.campaignId}/html`);
  revalidatePath(`/dashboard/email-crm/campaigns/${input.campaignId}/design`);
  return { ok: true };
}

export async function saveEmailCampaignDesignServer(input: {
  campaignId: string;
  document: unknown;
  htmlBody: string;
  editorVersion?: 2 | 3;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const { data: row } = await supabase
    .from("email_campaigns")
    .select("status")
    .eq("id", input.campaignId)
    .maybeSingle();

  if (!row) {
    return { ok: false, error: "Campagne introuvable." };
  }

  if (row.status === "sent" || row.status === "sending") {
    return { ok: false, error: "Campagne déjà envoyée — duplique-la pour modifier le design." };
  }

  const content = {
    html: input.htmlBody,
    document: input.document,
    editorVersion: input.editorVersion ?? 2,
  };

  const { error } = await supabase
    .from("email_campaigns")
    .update({ content })
    .eq("id", input.campaignId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  revalidatePath(`/dashboard/email-crm/campaigns/${input.campaignId}/html`);
  revalidatePath(`/dashboard/email-crm/campaigns/${input.campaignId}/design`);
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
    .select("name, subject, content, status")
    .eq("id", input.campaignId)
    .single();

  if (error || !camp) {
    return { ok: false, error: error?.message ?? "Campagne introuvable." };
  }

  if (camp.status === "sent" || camp.status === "sending") {
    return { ok: false, error: "Campagne déjà envoyée — impossible d’envoyer un test sur cette version." };
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

export async function deleteEmailCampaignServer(input: {
  campaignId: string;
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

  const { data: row, error: fetchErr } = await supabase
    .from("email_campaigns")
    .select("status, workspace_id")
    .eq("id", input.campaignId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, error: fetchErr?.message ?? "Campagne introuvable." };
  }

  if (row.workspace_id !== workspaceId) {
    return { ok: false, error: "Accès refusé." };
  }

  const deletable = ["draft", "paused", "scheduled"].includes(row.status);
  if (!deletable) {
    return {
      ok: false,
      error:
        "Seules les campagnes non envoyées (brouillon, planifiée, en pause) peuvent être supprimées. Duplique une campagne envoyée pour la réutiliser.",
    };
  }

  const { error } = await supabase.from("email_campaigns").delete().eq("id", input.campaignId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  return { ok: true };
}

export async function duplicateEmailCampaignServer(input: {
  campaignId: string;
  /** Si défini, force le type (ex. dupliquer un modèle en vraie campagne). */
  targetIsTemplate?: boolean;
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

  const { data: row, error: fetchErr } = await supabase
    .from("email_campaigns")
    .select("workspace_id, name, subject, preview_text, content, is_template")
    .eq("id", input.campaignId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, error: fetchErr?.message ?? "Campagne introuvable." };
  }

  if (row.workspace_id !== workspaceId) {
    return { ok: false, error: "Accès refusé." };
  }

  const nextIsTemplate =
    input.targetIsTemplate !== undefined
      ? input.targetIsTemplate
      : Boolean(row.is_template);

  const { data: created, error } = await supabase
    .from("email_campaigns")
    .insert({
      workspace_id: row.workspace_id,
      name: `Copie de ${row.name}`,
      subject: row.subject ?? "",
      preview_text: row.preview_text,
      content: row.content ?? {},
      status: "draft",
      is_template: nextIsTemplate,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { ok: false, error: error?.message ?? "Duplication impossible." };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  return { ok: true, id: created.id };
}

export async function sendEmailCampaignBroadcastServer(input: {
  campaignId: string;
}): Promise<
  | { ok: true; sent: number; failed: number; capped: boolean; totalSubscribers: number }
  | { ok: false; error: string }
> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { ok: false, error: "RESEND_API_KEY manquant côté serveur." };
  }

  const from = process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";

  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return { ok: false, error: "Aucun workspace." };
  }

  const { data: wsRow } = await supabase
    .from("workspaces")
    .select("plan")
    .eq("id", workspaceId)
    .maybeSingle();

  if (!isPaidPlatformPlan(wsRow?.plan as string | undefined)) {
    return { ok: false, error: PLATFORM_UPGRADE_BROADCAST_MESSAGE };
  }

  const { data: camp, error: campErr } = await supabase
    .from("email_campaigns")
    .select("id, workspace_id, name, subject, content, status, is_template")
    .eq("id", input.campaignId)
    .maybeSingle();

  if (campErr || !camp) {
    return { ok: false, error: campErr?.message ?? "Campagne introuvable." };
  }

  if (camp.workspace_id !== workspaceId) {
    return { ok: false, error: "Accès refusé." };
  }

  if (camp.is_template) {
    return {
      ok: false,
      error:
        "Les modèles ne peuvent pas être envoyés en masse. Duplique en campagne depuis la liste des modèles.",
    };
  }

  if (camp.status === "sent" || camp.status === "sending") {
    return { ok: false, error: "Cette campagne a déjà été envoyée ou est en cours." };
  }

  const htmlTemplate =
    typeof (camp.content as { html?: string } | null)?.html === "string"
      ? (camp.content as { html: string }).html
      : "<p>(Contenu vide)</p>";

  const subjectTemplate = (camp.subject as string)?.trim() || camp.name;

  const { count: totalSubscribers } = await supabase
    .from("contacts")
    .select("id", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .eq("subscribed", true);

  const total = totalSubscribers ?? 0;

  const { data: contacts, error: contactsErr } = await supabase
    .from("contacts")
    .select("id, email, first_name, last_name")
    .eq("workspace_id", workspaceId)
    .eq("subscribed", true)
    .order("created_at", { ascending: false })
    .limit(EMAIL_BROADCAST_MAX_CONTACTS);

  if (contactsErr) {
    return { ok: false, error: contactsErr.message };
  }

  const list = contacts ?? [];
  if (list.length === 0) {
    return { ok: false, error: "Aucun contact abonné dans cet espace." };
  }

  const monthlyCap = getEmailMonthlyBroadcastCap();
  if (monthlyCap > 0) {
    const used = await countBroadcastDeliveriesThisMonth(supabase, workspaceId);
    if (used + list.length > monthlyCap) {
      return {
        ok: false,
        error: `Quota mensuel d’envois plateforme atteint (${used}/${monthlyCap} ce mois-ci, ${list.length} requis pour cette campagne). Réessaie le mois prochain ou augmente la limite (EMAIL_MONTHLY_BROADCAST_CAP).`,
      };
    }
  }

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  let sent = 0;
  let failed = 0;

  for (const c of list) {
    const html = personalizeEmailText(htmlTemplate, c);
    const subj = personalizeEmailText(subjectTemplate, c);
    const { error: sendErr } = await resend.emails.send({
      from,
      to: c.email,
      subject: subj,
      html,
    });

    if (sendErr) {
      failed += 1;
    } else {
      sent += 1;
      await supabase.from("email_campaign_events").insert({
        workspace_id: workspaceId,
        campaign_id: camp.id,
        contact_id: c.id,
        event_type: "delivered",
        metadata: { channel: "broadcast" },
      });

      await supabase.from("contact_email_deliveries").upsert(
        {
          workspace_id: workspaceId,
          contact_id: c.id,
          campaign_id: camp.id,
          status: "sent",
        },
        { onConflict: "contact_id,campaign_id" }
      );
    }
  }

  const capped = total > EMAIL_BROADCAST_MAX_CONTACTS;

  const stats = {
    sent,
    failed,
    total_attempted: list.length,
    total_subscribers: total,
    capped,
    limit: EMAIL_BROADCAST_MAX_CONTACTS,
  };

  await supabase
    .from("email_campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      stats,
    })
    .eq("id", input.campaignId);

  revalidatePath("/dashboard/email-crm", "layout");
  revalidatePath(`/dashboard/email-crm/campaigns/${input.campaignId}/html`);
  revalidatePath(`/dashboard/email-crm/campaigns/${input.campaignId}/design`);
  revalidatePath("/dashboard/email-crm/statistics");

  return { ok: true, sent, failed, capped, totalSubscribers: total };
}

export async function deleteEmailSequenceServer(input: {
  sequenceId: string;
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

  const { data: seq, error: fetchErr } = await supabase
    .from("email_sequences")
    .select("workspace_id")
    .eq("id", input.sequenceId)
    .maybeSingle();

  if (fetchErr || !seq) {
    return { ok: false, error: fetchErr?.message ?? "Séquence introuvable." };
  }

  if (seq.workspace_id !== workspaceId) {
    return { ok: false, error: "Accès refusé." };
  }

  const { error } = await supabase.from("email_sequences").delete().eq("id", input.sequenceId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  return { ok: true };
}

export async function toggleEmailSequenceActiveServer(input: {
  sequenceId: string;
  active: boolean;
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

  const { data: seq, error: fetchErr } = await supabase
    .from("email_sequences")
    .select("workspace_id")
    .eq("id", input.sequenceId)
    .maybeSingle();

  if (fetchErr || !seq) {
    return { ok: false, error: fetchErr?.message ?? "Séquence introuvable." };
  }

  if (seq.workspace_id !== workspaceId) {
    return { ok: false, error: "Accès refusé." };
  }

  if (input.active) {
    const plan = await fetchWorkspacePlan(supabase, workspaceId);
    if (!isPaidPlatformPlan(plan)) {
      return { ok: false, error: PLATFORM_UPGRADE_SEQUENCE_ACTIVE_MESSAGE };
    }
  }

  const { error } = await supabase
    .from("email_sequences")
    .update({ active: input.active })
    .eq("id", input.sequenceId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  revalidatePath(`/dashboard/email-crm/sequences/${input.sequenceId}`);
  return { ok: true };
}

async function assertSequenceInWorkspace(
  supabase: ReturnType<typeof createClient>,
  sequenceId: string,
  workspaceId: string
): Promise<boolean> {
  const { data } = await supabase
    .from("email_sequences")
    .select("id")
    .eq("id", sequenceId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();
  return !!data;
}

export async function addEmailSequenceStepServer(input: {
  sequenceId: string;
  subject: string;
  delayDays: number;
  delayHours: number;
  htmlBody: string;
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

  const okSeq = await assertSequenceInWorkspace(
    supabase,
    input.sequenceId,
    workspaceId
  );
  if (!okSeq) {
    return { ok: false, error: "Séquence introuvable." };
  }

  const delayDays = Math.max(0, Math.floor(input.delayDays));
  const delayHours = Math.max(0, Math.min(23, Math.floor(input.delayHours)));

  const { data: maxRow } = await supabase
    .from("email_sequence_steps")
    .select("position")
    .eq("sequence_id", input.sequenceId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = (maxRow?.position ?? -1) + 1;

  const { data: created, error } = await supabase
    .from("email_sequence_steps")
    .insert({
      sequence_id: input.sequenceId,
      subject: input.subject.trim() || "Sans objet",
      content: { html: input.htmlBody },
      delay_days: delayDays,
      delay_hours: delayHours,
      position,
    })
    .select("id")
    .single();

  if (error || !created) {
    return { ok: false, error: error?.message ?? "Étape impossible." };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  revalidatePath(`/dashboard/email-crm/sequences/${input.sequenceId}`);
  return { ok: true, id: created.id };
}

export async function updateEmailSequenceStepServer(input: {
  stepId: string;
  subject: string;
  delayDays: number;
  delayHours: number;
  htmlBody: string;
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

  const { data: step, error: stepErr } = await supabase
    .from("email_sequence_steps")
    .select("id, sequence_id")
    .eq("id", input.stepId)
    .maybeSingle();

  if (stepErr || !step) {
    return { ok: false, error: stepErr?.message ?? "Étape introuvable." };
  }

  const seqOk = await assertSequenceInWorkspace(
    supabase,
    step.sequence_id,
    workspaceId
  );
  if (!seqOk) {
    return { ok: false, error: "Accès refusé." };
  }

  const delayDays = Math.max(0, Math.floor(input.delayDays));
  const delayHours = Math.max(0, Math.min(23, Math.floor(input.delayHours)));

  const { error } = await supabase
    .from("email_sequence_steps")
    .update({
      subject: input.subject.trim() || "Sans objet",
      content: { html: input.htmlBody },
      delay_days: delayDays,
      delay_hours: delayHours,
    })
    .eq("id", input.stepId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  revalidatePath(`/dashboard/email-crm/sequences/${step.sequence_id}`);
  return { ok: true };
}

export async function deleteEmailSequenceStepServer(input: {
  stepId: string;
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

  const { data: step, error: stepErr } = await supabase
    .from("email_sequence_steps")
    .select("id, sequence_id")
    .eq("id", input.stepId)
    .maybeSingle();

  if (stepErr || !step) {
    return { ok: false, error: stepErr?.message ?? "Étape introuvable." };
  }

  const seqOk = await assertSequenceInWorkspace(
    supabase,
    step.sequence_id,
    workspaceId
  );
  if (!seqOk) {
    return { ok: false, error: "Accès refusé." };
  }

  const sequenceId = step.sequence_id;

  const { error: delErr } = await supabase
    .from("email_sequence_steps")
    .delete()
    .eq("id", input.stepId);

  if (delErr) {
    return { ok: false, error: delErr.message };
  }

  const { data: remaining } = await supabase
    .from("email_sequence_steps")
    .select("id")
    .eq("sequence_id", sequenceId)
    .order("position", { ascending: true });

  for (let i = 0; i < (remaining?.length ?? 0); i++) {
    await supabase
      .from("email_sequence_steps")
      .update({ position: i })
      .eq("id", remaining![i].id);
  }

  revalidatePath("/dashboard/email-crm", "layout");
  revalidatePath(`/dashboard/email-crm/sequences/${sequenceId}`);
  return { ok: true };
}

export async function moveEmailSequenceStepServer(input: {
  stepId: string;
  direction: "up" | "down";
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

  const { data: curr, error: stepErr } = await supabase
    .from("email_sequence_steps")
    .select("id, sequence_id, position")
    .eq("id", input.stepId)
    .maybeSingle();

  if (stepErr || !curr) {
    return { ok: false, error: stepErr?.message ?? "Étape introuvable." };
  }

  const seqOk = await assertSequenceInWorkspace(
    supabase,
    curr.sequence_id,
    workspaceId
  );
  if (!seqOk) {
    return { ok: false, error: "Accès refusé." };
  }

  const adjPos = input.direction === "up" ? curr.position - 1 : curr.position + 1;
  if (adjPos < 0) {
    return { ok: false, error: "Déjà en tête de liste." };
  }

  const { data: adj } = await supabase
    .from("email_sequence_steps")
    .select("id, position")
    .eq("sequence_id", curr.sequence_id)
    .eq("position", adjPos)
    .maybeSingle();

  if (!adj) {
    return {
      ok: false,
      error:
        input.direction === "up"
          ? "Déjà en tête de liste."
          : "Déjà en fin de liste.",
    };
  }

  const pCurr = curr.position;
  const pAdj = adj.position;

  const { error: e1 } = await supabase
    .from("email_sequence_steps")
    .update({ position: -1 })
    .eq("id", curr.id);
  if (e1) {
    return { ok: false, error: e1.message };
  }

  const { error: e2 } = await supabase
    .from("email_sequence_steps")
    .update({ position: pCurr })
    .eq("id", adj.id);
  if (e2) {
    await supabase
      .from("email_sequence_steps")
      .update({ position: pCurr })
      .eq("id", curr.id);
    return { ok: false, error: e2.message };
  }

  const { error: e3 } = await supabase
    .from("email_sequence_steps")
    .update({ position: pAdj })
    .eq("id", curr.id);
  if (e3) {
    return { ok: false, error: e3.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  revalidatePath(`/dashboard/email-crm/sequences/${curr.sequence_id}`);
  return { ok: true };
}
