"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceSettingsExtrasServer } from "@/lib/workspaces/actions";

type Props = {
  initialCustomDomainDesired: string;
};

export function WorkspaceDomainPrefsForm({ initialCustomDomainDesired }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState(initialCustomDomainDesired);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateWorkspaceSettingsExtrasServer({
        customDomainDesired: customDomain,
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
        <Label htmlFor="custom-domain">Domaine personnalisé souhaité</Label>
        <Input
          id="custom-domain"
          value={customDomain}
          onChange={(e) => setCustomDomain(e.target.value)}
          placeholder="boutique.tondomaine.com"
          disabled={pending}
          autoComplete="off"
        />
        <p className="text-creo-xs text-creo-gray-500">
          Objectif produit : lier ce domaine à ton site CRÉO. La vérification DNS et le provisioning seront
          automatisés dans une prochaine itération ; la valeur est enregistrée sur le workspace.
        </p>
      </div>
      {error ? (
        <p className="text-creo-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer le domaine"}
      </Button>
    </form>
  );
}
