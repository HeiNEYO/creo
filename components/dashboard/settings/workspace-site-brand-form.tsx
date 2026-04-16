"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceSettingsExtrasServer } from "@/lib/workspaces/actions";

type Props = {
  initialFaviconUrl: string;
  initialPublicSiteTitle: string;
};

export function WorkspaceSiteBrandForm({
  initialFaviconUrl,
  initialPublicSiteTitle,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [faviconUrl, setFaviconUrl] = useState(initialFaviconUrl);
  const [publicSiteTitle, setPublicSiteTitle] = useState(initialPublicSiteTitle);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateWorkspaceSettingsExtrasServer({
        faviconUrl,
        publicSiteTitle,
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
        <Label htmlFor="site-title">Titre public du site (optionnel)</Label>
        <Input
          id="site-title"
          value={publicSiteTitle}
          onChange={(e) => setPublicSiteTitle(e.target.value)}
          placeholder="Ma marque"
          disabled={pending}
        />
        <p className="text-creo-xs text-creo-gray-500">
          Pour les métadonnées des pages publiques — utilisation progressive dans le produit.
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="favicon-url">URL du favicon</Label>
        <Input
          id="favicon-url"
          type="url"
          value={faviconUrl}
          onChange={(e) => setFaviconUrl(e.target.value)}
          placeholder="https://…/favicon.ico"
          disabled={pending}
        />
        <p className="text-creo-xs text-creo-gray-500">
          Lien HTTPS vers une image carrée (ico, png). Affichage sur les pages publiques à brancher côté rendu.
        </p>
      </div>
      {error ? (
        <p className="text-creo-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
