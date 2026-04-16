"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createWorkspaceTagServer,
  deleteWorkspaceTagServer,
  mergeContactTagLabelsServer,
} from "@/lib/crm/workspace-tags-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type WorkspaceTagRow = {
  id: string;
  name: string;
  slug: string;
  color_hex: string | null;
  contactCount?: number;
};

type Props = {
  tags: WorkspaceTagRow[];
};

export function TagsCrmView({ tags }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [fromLabel, setFromLabel] = useState("");
  const [toLabel, setToLabel] = useState("");
  const [createMsg, setCreateMsg] = useState<string | null>(null);
  const [mergeMsg, setMergeMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function createTag(e: React.FormEvent) {
    e.preventDefault();
    setCreateMsg(null);
    startTransition(async () => {
      const res = await createWorkspaceTagServer({ name });
      if (res.ok) {
        setName("");
        setCreateMsg("Tag créé.");
        router.refresh();
      } else {
        setCreateMsg(res.error);
      }
    });
  }

  function mergeTags(e: React.FormEvent) {
    e.preventDefault();
    setMergeMsg(null);
    startTransition(async () => {
      const res = await mergeContactTagLabelsServer({
        fromLabel,
        toLabel,
      });
      setMergeMsg(res.ok ? "Fusion effectuée sur les contacts." : res.error);
      if (res.ok) {
        setFromLabel("");
        setToLabel("");
        router.refresh();
      }
    });
  }

  function removeTag(tagId: string, tagName: string) {
    if (
      !window.confirm(
        `Supprimer le tag « ${tagName} » ? Il sera retiré de tous les contacts qui l’ont.`
      )
    ) {
      return;
    }
    setCreateMsg(null);
    setMergeMsg(null);
    startTransition(async () => {
      const res = await deleteWorkspaceTagServer({ tagId });
      if (res.ok) {
        router.refresh();
      } else {
        setCreateMsg(res.error);
      }
    });
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <h2 className="font-semibold text-[#202223] dark:text-white">Nouveau tag</h2>
          <form onSubmit={createTag} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="tag-name">Nom</Label>
              <Input
                id="tag-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="newsletter"
                disabled={pending}
              />
            </div>
            <Button type="submit" size="sm" disabled={pending}>
              Créer
            </Button>
            {createMsg ? (
              <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground" role="status">
                {createMsg}
              </p>
            ) : null}
          </form>
        </Card>

        <Card className="space-y-4 p-6">
          <h2 className="font-semibold text-[#202223] dark:text-white">Fusionner des tags</h2>
          <p className="text-creo-sm text-creo-gray-500">
            Remplace le libellé source par la cible sur tous les contacts (insensible à la casse
            des slugs en base).
          </p>
          <form onSubmit={mergeTags} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="from-l">Libellé source</Label>
              <Input
                id="from-l"
                value={fromLabel}
                onChange={(e) => setFromLabel(e.target.value)}
                disabled={pending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-l">Libellé cible</Label>
              <Input
                id="to-l"
                value={toLabel}
                onChange={(e) => setToLabel(e.target.value)}
                disabled={pending}
              />
            </div>
            <Button type="submit" size="sm" variant="secondary" disabled={pending}>
              Fusionner
            </Button>
            {mergeMsg ? (
              <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground" role="status">
                {mergeMsg}
              </p>
            ) : null}
          </form>
        </Card>
      </div>

      <Card className="mt-6 overflow-hidden p-0">
        <div className="border-b border-creo-gray-100 px-4 py-3 dark:border-[var(--creo-dashboard-border)]">
          <p className="text-creo-sm font-medium">Tags enregistrés</p>
        </div>
        {tags.length === 0 ? (
          <p className="p-6 text-creo-sm text-creo-gray-500">
            Aucun tag enregistré. Crée-en un avec le formulaire ci-dessus.
          </p>
        ) : (
          <table className="w-full text-creo-sm">
            <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs uppercase text-creo-gray-500 dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)]">
              <tr>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Contacts</th>
                <th className="px-4 py-2 text-left">Slug</th>
                <th className="w-28 px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {tags.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-creo-gray-100 dark:border-[var(--creo-dashboard-border)]"
                >
                  <td className="px-4 py-3 font-medium dark:text-white">{t.name}</td>
                  <td className="px-4 py-3 text-creo-gray-600 dark:text-creo-gray-500">
                    {t.contactCount ?? 0}
                  </td>
                  <td className="px-4 py-3 text-creo-gray-500">{t.slug}</td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      disabled={pending}
                      onClick={() => removeTag(t.id, t.name)}
                    >
                      Supprimer
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}
