"use server";

import { revalidatePath } from "next/cache";

import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import type { DbPageType } from "@/lib/pages/page-types";
import { makeUniquePageSlug } from "@/lib/pages/slug";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

const typeKeyToDb: Record<string, DbPageType> = {
  landing: "landing",
  sales: "sales",
  custom: "custom",
  optin: "optin",
  thankyou: "thankyou",
  checkout: "checkout",
  upsell: "upsell",
  webinar: "webinar",
  blog: "blog",
  membership: "membership",
};

/** Nouvelle page : canvas vide (blocs + sections ajoutés dans l’éditeur). Gabarits / thèmes plus tard. */
function defaultContentForDbType(dbType: DbPageType): Record<string, unknown> {
  const base = {
    id: "",
    editorVersion: 1,
    meta: {} as Record<string, unknown>,
    blocks: [] as unknown[],
  };
  if (dbType === "checkout") {
    return {
      ...base,
      checkout: {
        price_cents: 500,
        currency: "eur",
        product_name: "Offre",
        button_label: "Payer maintenant",
      },
    };
  }
  return base;
}

export async function createPageServer(input: {
  title: string;
  typeKey: string;
}): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);

  if (!workspaceId) {
    return { ok: false, error: "Aucun workspace. Déconnecte-toi puis reconnecte-toi." };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Le titre est requis." };
  }

  const dbType = typeKeyToDb[input.typeKey] ?? "custom";
  const slug = makeUniquePageSlug(title);

  const initialContent = defaultContentForDbType(dbType);

  const { data, error } = await supabase
    .from("pages")
    .insert({
      workspace_id: workspaceId,
      title,
      slug,
      type: dbType,
      published: false,
      content: initialContent,
    })
    .select("id")
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/pages");
  return { ok: true, id: data.id };
}

export async function updatePageServer(input: {
  pageId: string;
  title: string;
  content: unknown;
  /** Si défini, met à jour le statut publié en même temps que le reste. */
  published?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const title = input.title.trim();
  if (!title) {
    return { ok: false, error: "Le titre est requis." };
  }

  let contentJson: object;
  if (input.content !== null && typeof input.content === "object") {
    contentJson = input.content as object;
  } else {
    contentJson = { id: "", blocks: [] };
  }

  const patch: { title: string; content: object; published?: boolean } = {
    title,
    content: contentJson,
  };
  if (typeof input.published === "boolean") {
    patch.published = input.published;
  }

  const { data, error } = await supabase.from("pages").update(patch).eq("id", input.pageId).select("id");

  if (error) {
    return { ok: false, error: error.message || "Erreur lors de l’enregistrement." };
  }
  if (!data?.length) {
    return {
      ok: false,
      error: "Aucune page mise à jour (page introuvable ou droits insuffisants).",
    };
  }

  revalidatePath("/dashboard/pages");
  revalidatePath(`/builder/${input.pageId}`);
  return { ok: true };
}

export async function deletePageServer(input: {
  pageId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    return { ok: false, error: "Non connecté." };
  }

  const { error } = await supabase.from("pages").delete().eq("id", input.pageId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/pages");
  return { ok: true };
}
