/**
 * Emails autorisés à voir les vues admin CRÉO (liste des réponses questionnaire, etc.).
 * Variable d’environnement : CREO_ADMIN_EMAILS=toi@domain.com,autre@domain.com
 */
export function isCreoAdminEmail(email: string | undefined | null): boolean {
  if (!email?.trim()) {
    return false;
  }
  const raw = process.env.CREO_ADMIN_EMAILS?.trim();
  if (!raw) {
    return false;
  }
  const allowed = raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}
