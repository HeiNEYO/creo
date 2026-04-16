import type { SupabaseClient } from "@supabase/supabase-js";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Envoie un e-mail de bienvenue plateforme une seule fois par compte (colonne profiles.welcome_email_sent_at).
 * Sans effet si RESEND_API_KEY est absent ou si l’e-mail a déjà été envoyé.
 */
export async function sendWelcomePlatformEmailOnce(
  supabase: SupabaseClient,
  user: { id: string; email?: string | null }
): Promise<{ sent: boolean; reason?: string }> {
  const email = user.email?.trim();
  if (!email) {
    return { sent: false, reason: "no_email" };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, reason: "no_resend" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

  const { data: profile, error: readErr } = await supabase
    .from("profiles")
    .select("welcome_email_sent_at, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (readErr) {
    return { sent: false, reason: readErr.message };
  }
  if (profile?.welcome_email_sent_at) {
    return { sent: false, reason: "already_sent" };
  }

  const from = process.env.RESEND_FROM?.trim() || "onboarding@resend.dev";
  const name =
    typeof profile?.full_name === "string" && profile.full_name.trim()
      ? profile.full_name.trim()
      : null;
  const greet = name ? `Bonjour ${escapeHtml(name)},` : "Bonjour,";
  const dashboardUrl = appUrl ? `${appUrl}/dashboard` : "/dashboard";

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const { error: sendErr } = await resend.emails.send({
    from,
    to: email,
    subject: "Bienvenue sur CRÉO",
    html: `
      <p>${greet}</p>
      <p>Ton compte est prêt. Tu peux accéder à ton espace : <a href="${escapeHtml(dashboardUrl)}">ouvrir le tableau de bord</a>.</p>
      <p style="color:#666;font-size:13px;">Si le lien ne fonctionne pas : ${escapeHtml(dashboardUrl)}</p>
      <p style="color:#666;font-size:13px;">— L’équipe CRÉO</p>
    `,
  });

  if (sendErr) {
    return { sent: false, reason: sendErr.message };
  }

  const { error: upErr } = await supabase
    .from("profiles")
    .update({ welcome_email_sent_at: new Date().toISOString() })
    .eq("id", user.id);

  if (upErr) {
    return { sent: true, reason: "sent_but_flag_failed" };
  }

  return { sent: true };
}
