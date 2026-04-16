"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceSettingsExtrasServer } from "@/lib/workspaces/actions";

type Props = {
  initialPaypalEmail: string;
  /** Bouton aux couleurs PayPal (#0070BA). */
  submitVariant?: "default" | "paypal";
  /** Libellés courts (carte passerelles). */
  compact?: boolean;
};

export function WorkspacePaypalPrefsForm({
  initialPaypalEmail,
  submitVariant = "default",
  compact = false,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paypalEmail, setPaypalEmail] = useState(initialPaypalEmail);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateWorkspaceSettingsExtrasServer({
        paypalEmail,
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="paypal-email">{compact ? "Email PayPal" : "Email ou identifiant PayPal (préparation)"}</Label>
        <Input
          id="paypal-email"
          type="email"
          value={paypalEmail}
          onChange={(e) => setPaypalEmail(e.target.value)}
          placeholder="paiements@exemple.com"
          disabled={pending}
        />
        {!compact ? (
          <p className="text-creo-xs text-creo-gray-500">
            Paiement PayPal sur les pages : à venir. Stripe reste actif sur le checkout.
          </p>
        ) : null}
      </div>
      {error ? (
        <p className="text-creo-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant={submitVariant === "paypal" ? "paypal" : "outline"}
        disabled={pending}
        className={submitVariant === "paypal" ? "min-w-[12rem]" : undefined}
      >
        {pending ? "Enregistrement…" : compact ? "Enregistrer" : "Enregistrer (préparation PayPal)"}
      </Button>
    </form>
  );
}
