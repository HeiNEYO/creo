"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export type WorkspaceIntegrationSettings = {
  webhook_url?: string;
  meta_pixel_id?: string;
};

export async function updateWorkspaceIntegrationsServer(input: {
  webhookUrl?: string;
  metaPixelId?: string;
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
    .from("workspaces")
    .select("settings")
    .eq("id", workspaceId)
    .single();

  if (fetchErr) {
    return { ok: false, error: fetchErr.message };
  }

  const prev =
    (row?.settings as WorkspaceIntegrationSettings | null | undefined) ?? {};
  const next: Record<string, unknown> = { ...prev };
  if (input.webhookUrl !== undefined) {
    const u = input.webhookUrl.trim();
    if (u.length) {
      next.webhook_url = u;
    } else {
      delete next.webhook_url;
    }
  }
  if (input.metaPixelId !== undefined) {
    const m = input.metaPixelId.trim();
    if (m.length) {
      next.meta_pixel_id = m;
    } else {
      delete next.meta_pixel_id;
    }
  }

  const { error } = await supabase
    .from("workspaces")
    .update({ settings: next })
    .eq("id", workspaceId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/integrations", "layout");
  return { ok: true };
}

export async function pingIntegrationWebhookServer(): Promise<
  { ok: true; status: number } | { ok: false; error: string }
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

  const { data: row, error } = await supabase
    .from("workspaces")
    .select("settings")
    .eq("id", workspaceId)
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  const url = (row?.settings as WorkspaceIntegrationSettings | null)?.webhook_url?.trim();
  if (!url) {
    return { ok: false, error: "Aucune URL webhook enregistrée." };
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "creo.test",
        sent_at: new Date().toISOString(),
      }),
    });
    return { ok: true, status: res.status };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Échec réseau";
    return { ok: false, error: msg };
  }
}
