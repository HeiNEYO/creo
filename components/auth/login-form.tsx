"use client";

import Link from "next/link";
import { useState } from "react";

import { signInSchema } from "@/lib/auth/validation";
import { setRememberPreferenceCookie } from "@/lib/supabase/auth-session-preference";
import { createClient } from "@/lib/supabase/client";
import { ensureDefaultWorkspaceFromBrowser } from "@/lib/workspaces/ensure-default-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function safeInternalRedirect(raw: string | undefined): string {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//")) {
    return "/dashboard";
  }
  return raw;
}

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const target = safeInternalRedirect(redirectTo);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    const parsed = signInSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Données invalides.");
      setPending(false);
      return;
    }

    const remember =
      formData.get("remember") === "on" || formData.get("remember") === "true";
    setRememberPreferenceCookie(remember);
    /* Laisser le navigateur enregistrer le cookie avant de créer le client (durée des cookies session). */
    await new Promise<void>((r) => queueMicrotask(() => r()));

    const supabase = createClient();
    const signInResult = await supabase.auth.signInWithPassword(parsed.data);
    if (!signInResult) {
      setError("Connexion impossible : réponse invalide du serveur.");
      setPending(false);
      return;
    }
    if (signInResult.error) {
      setError(signInResult.error.message);
      setPending(false);
      return;
    }

    const { data: sessionData, error: sessionErr } =
      await supabase.auth.getSession();
    if (sessionErr) {
      setError(sessionErr.message);
      setPending(false);
      return;
    }
    if (!sessionData?.session) {
      setError("Session non établie. Réessaie.");
      setPending(false);
      return;
    }

    let workspace: { error: string | null };
    try {
      workspace = await ensureDefaultWorkspaceFromBrowser(supabase);
    } catch {
      setError("Erreur réseau lors de la préparation du workspace. Réessaie.");
      setPending(false);
      return;
    }
    if (workspace.error) {
      setError(workspace.error);
      setPending(false);
      return;
    }

    window.location.assign(target);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="toi@exemple.com"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mot de passe</Label>
          <Link
            href="/forgot-password"
            className="text-xs font-medium text-primary hover:underline"
          >
            Mot de passe oublié ?
          </Link>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-creo-sm text-creo-gray-700 dark:text-muted-foreground">
        <input
          type="checkbox"
          name="remember"
          defaultChecked
          className="size-4 rounded border-creo-gray-300 text-creo-purple focus:ring-creo-purple"
        />
        Se souvenir de moi sur cet appareil
      </label>
      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Connexion…" : "Se connecter"}
      </Button>
    </form>
  );
}
