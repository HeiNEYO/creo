"use server";

import { createClient } from "@/lib/supabase/server";
import type { AuthActionState } from "@/lib/auth/form-state";
import { forgotPasswordSchema } from "@/lib/auth/validation";
import { ensureDefaultWorkspace } from "@/lib/workspaces/ensure-default";

/** Appelé après connexion/inscription côté navigateur (cookies de session déjà posés). */
export async function ensureDefaultWorkspaceAction(): Promise<{
  error: string | null;
}> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Session introuvable. Réessaie dans un instant." };
  }
  try {
    await ensureDefaultWorkspace(supabase);
    return { error: null };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur workspace.";
    return { error: message };
  }
}

export async function forgotPasswordAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      error: first?.message ?? "Données invalides.",
      success: null,
      redirectTo: null,
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    return {
      error: "NEXT_PUBLIC_APP_URL doit être défini pour la réinitialisation.",
      success: null,
      redirectTo: null,
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    parsed.data.email,
    {
      redirectTo: `${baseUrl.replace(/\/$/, "")}/auth/callback?next=/reset-password`,
    }
  );

  if (error) {
    return { error: error.message, success: null, redirectTo: null };
  }

  return {
    error: null,
    success: "Si un compte existe pour cet email, tu recevras un lien de réinitialisation.",
    redirectTo: null,
  };
}

export async function magicLinkAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      error: first?.message ?? "Données invalides.",
      success: null,
      redirectTo: null,
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    return {
      error: "NEXT_PUBLIC_APP_URL doit être défini pour le lien magique.",
      success: null,
      redirectTo: null,
    };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${baseUrl.replace(/\/$/, "")}/auth/callback?next=/dashboard`,
    },
  });

  if (error) {
    return { error: error.message, success: null, redirectTo: null };
  }

  return {
    error: null,
    success: "Vérifie ta boîte mail : un lien de connexion t’y a été envoyé.",
    redirectTo: null,
  };
}
