import { createServiceRoleClient } from "@/lib/supabase/service";

/**
 * Crée une notification pour un utilisateur (jobs CRÉO, webhooks, etc.).
 * Nécessite `SUPABASE_SERVICE_ROLE_KEY` côté serveur.
 */
export async function notifyUser(
  userId: string,
  payload: { title: string; body?: string; link?: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = createServiceRoleClient();
  if (!admin) {
    return { ok: false, error: "Service role non configuré." };
  }

  const { error } = await admin.from("user_notifications").insert({
    user_id: userId,
    title: payload.title,
    body: payload.body ?? null,
    link: payload.link ?? null,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true };
}
