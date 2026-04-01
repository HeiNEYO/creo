"use client";

import { useEffect } from "react";
import { useFormState } from "react-dom";
import { toast } from "sonner";

import { forgotPasswordAction } from "@/lib/auth/actions";
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

export function ForgotPasswordForm() {
  const [state, formAction] = useFormState(forgotPasswordAction, emptyState);

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state.success, state.error]);

  return (
    <form action={formAction} className="flex flex-col gap-4">
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
      <FormSubmit label="Envoyer le lien" pendingLabel="Envoi…" />
    </form>
  );
}
