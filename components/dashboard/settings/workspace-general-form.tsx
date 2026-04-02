"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceServer } from "@/lib/workspaces/actions";

type WorkspaceGeneralFormProps = {
  initialName: string;
  initialSlug: string;
};

export function WorkspaceGeneralForm({
  initialName,
  initialSlug,
}: WorkspaceGeneralFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await updateWorkspaceServer({ name, slug });
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
        <Label htmlFor="ws-name">Nom du workspace</Label>
        <Input
          id="ws-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ws-slug">Slug (URL)</Label>
        <Input
          id="ws-slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          required
          disabled={pending}
          autoComplete="off"
        />
        <p className="text-creo-xs text-creo-gray-500">
          Lettres minuscules, chiffres et tirets. Doit être unique.
        </p>
      </div>
      {error ? (
        <p className="text-creo-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer"}
      </Button>
    </form>
  );
}
