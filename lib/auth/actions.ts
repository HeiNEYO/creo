"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { forgotPasswordSchema, signInSchema, signUpSchema } from "@/lib/auth/validation";
import { ensureDefaultWorkspace } from "@/lib/workspaces/ensure-default";

export type AuthActionState = {
  error: string | null;
  success: string | null;
};

const emptyState: AuthActionState = { error: null, success: null };

function safeInternalPath(raw: FormDataEntryValue | null): string {
  if (typeof raw !== "string" || raw.length === 0) {
    return "/dashboard";
  }
  if (!raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

export async function signInAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signInSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Données invalides.", success: null };
  }

  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: error.message, success: null };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await ensureDefaultWorkspace(supabase, user);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur workspace.";
      return { error: message, success: null };
    }
  }

  redirect(safeInternalPath(formData.get("redirect")));
}

export async function signUpAction(
  _prev: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName") || undefined,
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Données invalides.", success: null };
  }

  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName ?? "",
      },
    },
  });

  if (error) {
    return { error: error.message, success: null };
  }

  if (data.session && data.user) {
    try {
      await ensureDefaultWorkspace(supabase, data.user);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Erreur workspace.";
      return { error: message, success: null };
    }
    redirect("/dashboard");
  }

  return {
    error: null,
    success:
      "Compte créé. Si la confirmation par email est activée, vérifie ta boîte de réception pour te connecter.",
  };
}

export async function signOutAction(): Promise<void> {
  const supabase = createClient();
  await supabase.auth.signOut();
  redirect("/login");
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
    return { error: first?.message ?? "Données invalides.", success: null };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    return {
      error: "NEXT_PUBLIC_APP_URL doit être défini pour la réinitialisation.",
      success: null,
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
    return { error: error.message, success: null };
  }

  return {
    error: null,
    success: "Si un compte existe pour cet email, tu recevras un lien de réinitialisation.",
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
    return { error: first?.message ?? "Données invalides.", success: null };
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) {
    return {
      error: "NEXT_PUBLIC_APP_URL doit être défini pour le lien magique.",
      success: null,
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
    return { error: error.message, success: null };
  }

  return {
    error: null,
    success: "Vérifie ta boîte mail : un lien de connexion t’y a été envoyé.",
  };
}

export { emptyState };
