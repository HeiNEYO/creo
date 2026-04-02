"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

function parseTags(raw: string | undefined): string[] {
  if (!raw?.trim()) {
    return [];
  }
  return raw
    .split(/[,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createContactServer(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  tags?: string;
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

  const email = input.email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Email invalide." };
  }

  const tags = parseTags(input.tags);

  const { error } = await supabase.from("contacts").insert({
    workspace_id: workspaceId,
    email,
    first_name: input.firstName?.trim() || null,
    last_name: input.lastName?.trim() || null,
    tags,
    subscribed: true,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ce contact existe déjà." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/contacts");
  return { ok: true };
}

export async function updateContactTagsServer(input: {
  contactId: string;
  tags: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const tags = parseTags(input.tags);

  const { error } = await supabase
    .from("contacts")
    .update({ tags })
    .eq("id", input.contactId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/contacts");
  return { ok: true };
}

/** CSV avec en-têtes : email (obligatoire), first_name, last_name, tags (séparés par ; ou ,) */
export async function importContactsCsvServer(
  csvText: string
): Promise<
  | { ok: true; imported: number; skipped: number }
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

  const lines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) {
    return { ok: false, error: "Fichier vide ou sans en-têtes." };
  }

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const emailIdx = header.findIndex((h) => h === "email" || h === "e-mail");
  if (emailIdx < 0) {
    return { ok: false, error: 'Colonne "email" introuvable.' };
  }
  const fnIdx = header.findIndex((h) => h === "first_name" || h === "prenom");
  const lnIdx = header.findIndex((h) => h === "last_name" || h === "nom");
  const tagsIdx = header.findIndex((h) => h === "tags" || h === "tag");

  let imported = 0;
  let skipped = 0;

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const email = (cells[emailIdx] ?? "").toLowerCase();
    if (!email.includes("@")) {
      skipped += 1;
      continue;
    }
    const first_name = fnIdx >= 0 ? cells[fnIdx] || null : null;
    const last_name = lnIdx >= 0 ? cells[lnIdx] || null : null;
    const tagStr = tagsIdx >= 0 ? cells[tagsIdx] : "";
    const tags = parseTags(tagStr);

    const { error } = await supabase.from("contacts").insert({
      workspace_id: workspaceId,
      email,
      first_name,
      last_name,
      tags,
      subscribed: true,
      source: "csv",
    });

    if (error) {
      if (error.code === "23505") {
        skipped += 1;
      } else {
        return { ok: false, error: error.message };
      }
    } else {
      imported += 1;
    }
  }

  revalidatePath("/dashboard/contacts");
  return { ok: true, imported, skipped };
}

