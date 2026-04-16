"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

function slugifyWorkspaceSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export async function updateWorkspaceServer(input: {
  name: string;
  slug: string;
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

  const name = input.name.trim();
  const slug = slugifyWorkspaceSlug(input.slug);
  if (!name) {
    return { ok: false, error: "Le nom est requis." };
  }
  if (!slug) {
    return { ok: false, error: "Le slug est invalide." };
  }

  const { error } = await supabase
    .from("workspaces")
    .update({ name, slug })
    .eq("id", workspaceId);

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "Ce slug est déjà pris. Choisis-en un autre." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  return { ok: true };
}

/** Champs optionnels dans `workspaces.settings` (JSON). */
export type WorkspaceSettingsExtras = {
  favicon_url?: string;
  public_site_title?: string;
  custom_domain_desired?: string;
  paypal_email?: string;
};

export async function updateWorkspaceSettingsExtrasServer(input: {
  faviconUrl?: string;
  publicSiteTitle?: string;
  customDomainDesired?: string;
  paypalEmail?: string;
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

  const prev = (row?.settings as Record<string, unknown> | null) ?? {};
  const next: Record<string, unknown> = { ...prev };

  const apply = (key: string, val: string | undefined) => {
    if (val === undefined) return;
    const t = val.trim();
    if (t.length) next[key] = t;
    else delete next[key];
  };

  if (input.faviconUrl !== undefined) apply("favicon_url", input.faviconUrl);
  if (input.publicSiteTitle !== undefined)
    apply("public_site_title", input.publicSiteTitle);
  if (input.customDomainDesired !== undefined)
    apply("custom_domain_desired", input.customDomainDesired);
  if (input.paypalEmail !== undefined) apply("paypal_email", input.paypalEmail);

  const { error } = await supabase
    .from("workspaces")
    .update({ settings: next })
    .eq("id", workspaceId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  return { ok: true };
}

export async function deleteWorkspaceServer(): Promise<
  { ok: true } | { ok: false; error: string }
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

  const { data: row, error: fetchErr } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (fetchErr || !row) {
    return { ok: false, error: fetchErr?.message ?? "Workspace introuvable." };
  }
  if (row.owner_id !== user.id) {
    return {
      ok: false,
      error: "Seul le propriétaire peut supprimer ce workspace.",
    };
  }

  const { error } = await supabase.from("workspaces").delete().eq("id", workspaceId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  revalidatePath("/builder");
  return { ok: true };
}

export async function removeWorkspaceMemberServer(input: {
  memberUserId: string;
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

  const targetId = input.memberUserId.trim();
  if (!targetId) {
    return { ok: false, error: "Membre invalide." };
  }

  const { data: ws, error: wsErr } = await supabase
    .from("workspaces")
    .select("owner_id")
    .eq("id", workspaceId)
    .maybeSingle();

  if (wsErr || !ws) {
    return { ok: false, error: wsErr?.message ?? "Workspace introuvable." };
  }

  if (targetId === ws.owner_id) {
    return { ok: false, error: "Le propriétaire ne peut pas être retiré de l’équipe." };
  }

  const { data: actorRow } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .maybeSingle();

  const actorRole = actorRow?.role ?? "member";

  const { data: targetRow } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", targetId)
    .maybeSingle();

  if (!targetRow) {
    return { ok: false, error: "Ce membre n’est pas dans l’équipe." };
  }

  const removingSelf = targetId === user.id;

  if (removingSelf) {
    if (user.id === ws.owner_id) {
      return {
        ok: false,
        error:
          "Le propriétaire du workspace ne peut pas quitter l’équipe depuis l’application.",
      };
    }
  } else {
    if (actorRole !== "owner" && actorRole !== "admin") {
      return { ok: false, error: "Droits insuffisants." };
    }
    if (actorRole === "admin" && targetRow.role !== "member") {
      return { ok: false, error: "Seul le propriétaire peut retirer un admin." };
    }
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", targetId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/settings");
  revalidatePath("/dashboard");
  revalidatePath("/builder");
  return { ok: true };
}

/** Désactivé produit : aucun transfert de propriété côté app. */
export async function transferWorkspaceOwnershipServer(input: {
  newOwnerUserId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  void input;
  return {
    ok: false,
    error: "Le transfert de propriété n’est pas disponible.",
  };
}
