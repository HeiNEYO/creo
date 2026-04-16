"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import { passwordSchema } from "@/lib/auth/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm() {
  const router = useRouter();
  const [sessionOk, setSessionOk] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getSession().then(({ data }) => {
      setSessionOk(!!data.session);
    });
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFeedback(null);
    const form = e.currentTarget;
    const password = String(new FormData(form).get("password") ?? "");
    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      setFeedback({
        type: "error",
        text: parsed.error.issues[0]?.message ?? "Mot de passe invalide.",
      });
      return;
    }
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: parsed.data,
    });
    setSubmitting(false);
    if (error) {
      setFeedback({ type: "error", text: error.message });
      return;
    }
    setFeedback({ type: "success", text: "Mot de passe mis à jour." });
    router.push("/dashboard");
    router.refresh();
  }

  if (sessionOk === null) {
    return (
      <p className="text-center text-sm text-muted-foreground">Vérification du lien…</p>
    );
  }

  if (!sessionOk) {
    return (
      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-center text-sm text-destructive">
        Lien invalide ou expiré. Demande un nouveau lien depuis la page de connexion.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {feedback ? (
        <p
          className={
            feedback.type === "error"
              ? "rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive"
              : "rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400"
          }
        >
          {feedback.text}
        </p>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="password">Nouveau mot de passe</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
        />
        <p className="text-xs text-muted-foreground">Au moins 8 caractères.</p>
      </div>
      <Button type="submit" className="w-full" size="lg" disabled={submitting}>
        {submitting ? "Enregistrement…" : "Enregistrer le mot de passe"}
      </Button>
    </form>
  );
}
