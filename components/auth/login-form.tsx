"use client";

import Link from "next/link";
import { useFormState } from "react-dom";

import { signInAction } from "@/lib/auth/actions";
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

type LoginFormProps = {
  redirectTo?: string;
};

export function LoginForm({ redirectTo }: LoginFormProps) {
  const [state, formAction] = useFormState(signInAction, emptyState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {redirectTo ? (
        <input type="hidden" name="redirect" value={redirectTo} />
      ) : null}
      <FormMessage state={state} />
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
      <FormSubmit label="Se connecter" />
    </form>
  );
}
