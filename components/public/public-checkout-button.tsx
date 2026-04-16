"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  workspaceSlug: string;
  pageSlug: string;
  label: string;
  disabled?: boolean;
  disabledReason?: string;
};

export function PublicCheckoutButton({
  workspaceSlug,
  pageSlug,
  label,
  disabled,
  disabledReason,
}: Props) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function pay() {
    setError(null);
    setPending(true);
    try {
      const r = await fetch("/api/stripe/page-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceSlug, pageSlug }),
      });
      const j = (await r.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!r.ok) {
        setError(j.error ?? `Erreur ${r.status}`);
        setPending(false);
        return;
      }
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      setError("Réponse Stripe invalide.");
    } catch {
      setError("Erreur réseau.");
    }
    setPending(false);
  }

  return (
    <div className="mt-8 rounded-xl border border-zinc-200 bg-zinc-50 p-6 dark:border-zinc-700 dark:bg-zinc-900/40">
      {disabledReason ? (
        <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">{disabledReason}</p>
      ) : null}
      <Button
        type="button"
        size="lg"
        variant="default"
        className={cn(
          "creo-public-accent-fill w-full border-0 shadow-sm sm:w-auto",
          "hover:brightness-105 focus-visible:ring-2 focus-visible:ring-[color:var(--creo-page-accent,#2563eb)]"
        )}
        disabled={disabled || pending}
        onClick={() => void pay()}
      >
        {pending ? "Redirection…" : label}
      </Button>
      {error ? (
        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>
      ) : null}
    </div>
  );
}
