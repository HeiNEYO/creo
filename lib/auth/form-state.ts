/** État initial des formulaires auth (hors fichier "use server"). */
export type AuthActionState = {
  error: string | null;
  success: string | null;
};

export const emptyState: AuthActionState = { error: null, success: null };
