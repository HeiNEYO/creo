"use client";

import { useFormState } from "react-dom";

import { signUpAction } from "@/lib/auth/actions";
import {
  emptyState,
  type AuthActionState,
} from "@/lib/auth/form-state";
import { FormSubmit } from "@/components/auth/form-submit";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FormMessage({ state }: { state: AuthActionState }) {
  if (state.error) {
    return (
      <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
        {state.error}
      </p>
    );
  }
  if (state.success) {
    return (
      <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
        {state.success}
      </p>
    );
  }
  return null;
}

export function RegisterForm() {
  const [state, formAction] = useFormState(signUpAction, emptyState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <FormMessage state={state} />
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
      <FormSubmit label="Créer mon compte" pendingLabel="Création…" />
    </form>
  );
}
