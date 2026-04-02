/** État initial des formulaires auth (hors fichier "use server"). */
export type AuthActionState = {
  error: string | null;
  success: string | null;
  /** Si défini, le client doit naviguer (évite redirect() serveur + cookies sur Vercel). */
  redirectTo: string | null;
};

export const emptyState: AuthActionState = {
  error: null,
  success: null,
  redirectTo: null,
};
