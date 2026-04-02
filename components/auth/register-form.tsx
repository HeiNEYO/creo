"use client";

import { useState } from "react";

import { signUpSchema } from "@/lib/auth/validation";
import { setRememberPreferenceCookie } from "@/lib/supabase/auth-session-preference";
import { createClient } from "@/lib/supabase/client";
import { ensureDefaultWorkspaceFromBrowser } from "@/lib/workspaces/ensure-default-browser";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const rawName = formData.get("fullName");
    const parsed = signUpSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      fullName:
        typeof rawName === "string" && rawName.trim() !== ""
          ? rawName
          : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Données invalides.");
      setPending(false);
      return;
    }

    const remember =
      formData.get("remember") === "on" || formData.get("remember") === "true";
    setRememberPreferenceCookie(remember);
    await new Promise<void>((r) => queueMicrotask(() => r()));

    const supabase = createClient();
    const signUpResult = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        data: {
          full_name: parsed.data.fullName ?? "",
        },
      },
    });

    if (!signUpResult) {
      setError("Inscription impossible : réponse invalide du serveur.");
      setPending(false);
      return;
    }
    if (signUpResult.error) {
      setError(signUpResult.error.message);
      setPending(false);
      return;
    }

    const { data } = signUpResult;
    if (data.session && data.user) {
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
      window.location.assign("/dashboard");
      return;
    }

    setSuccess(
      "Compte créé. Si la confirmation par email est activée, vérifie ta boîte de réception pour te connecter."
    );
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
          {success}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="fullName">Nom (optionnel)</Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          placeholder="Marie Dupont"
        />
      </div>
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
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">Au moins 8 caractères.</p>
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
        {pending ? "Création…" : "Créer mon compte"}
      </Button>
    </form>
  );
}
