"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createWorkspaceTagServer(input: {
  name: string;
  colorHex?: string;
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
  const slug = slugify(name);
  if (!slug) {
    return { ok: false, error: "Slug invalide." };
  }

  const { data, error } = await supabase
    .from("workspace_tags")
    .insert({
      workspace_id: workspaceId,
      name,
      slug,
      color_hex: input.colorHex?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  return { ok: true, id: data.id };
}

/** Fusionne un libellé de tag vers un autre sur tous les contacts (text[]). */
export async function mergeContactTagLabelsServer(input: {
  fromLabel: string;
  toLabel: string;
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

  const fromLabel = input.fromLabel.trim();
  const toLabel = input.toLabel.trim();
  if (!fromLabel || !toLabel || fromLabel === toLabel) {
    return { ok: false, error: "Libellés invalides." };
  }

  const { data: contacts, error: fetchErr } = await supabase
    .from("contacts")
    .select("id, tags")
    .eq("workspace_id", workspaceId);

  if (fetchErr) {
    return { ok: false, error: fetchErr.message };
  }

  for (const row of contacts ?? []) {
    const tags = [...((row.tags as string[]) ?? [])];
    if (!tags.includes(fromLabel)) {
      continue;
    }
    const next = tags
      .map((t) => (t === fromLabel ? toLabel : t))
      .filter((t, i, a) => a.indexOf(t) === i);

    const { error } = await supabase
      .from("contacts")
      .update({ tags: next })
      .eq("id", row.id);

    if (error) {
      return { ok: false, error: error.message };
    }
  }

  await supabase
    .from("workspace_tags")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("slug", slugify(fromLabel));

  revalidatePath("/dashboard/email-crm", "layout");
  return { ok: true };
}

/** Supprime le tag workspace et retire ce libellé sur tous les contacts. */
export async function deleteWorkspaceTagServer(input: {
  tagId: string;
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

  const { data: tag, error: tagErr } = await supabase
    .from("workspace_tags")
    .select("id, name, workspace_id")
    .eq("id", input.tagId)
    .maybeSingle();

  if (tagErr || !tag) {
    return { ok: false, error: tagErr?.message ?? "Tag introuvable." };
  }

  if (tag.workspace_id !== workspaceId) {
    return { ok: false, error: "Accès refusé." };
  }

  const label = tag.name.trim();
  const { data: contacts, error: fetchErr } = await supabase
    .from("contacts")
    .select("id, tags")
    .eq("workspace_id", workspaceId);

  if (fetchErr) {
    return { ok: false, error: fetchErr.message };
  }

  for (const row of contacts ?? []) {
    const tags = [...((row.tags as string[]) ?? [])];
    if (!tags.includes(label)) {
      continue;
    }
    const next = tags.filter((t) => t !== label);
    const { error } = await supabase.from("contacts").update({ tags: next }).eq("id", row.id);
    if (error) {
      return { ok: false, error: error.message };
    }
  }

  const { error: delErr } = await supabase.from("workspace_tags").delete().eq("id", input.tagId);

  if (delErr) {
    return { ok: false, error: delErr.message };
  }

  revalidatePath("/dashboard/email-crm", "layout");
  return { ok: true };
}
