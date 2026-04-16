"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createCrmSegmentServer,
  deleteCrmSegmentServer,
} from "@/lib/crm/segments-actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SegmentRow = {
  id: string;
  name: string;
  rules: Record<string, unknown>;
  created_at: string;
};

type Props = {
  segments: SegmentRow[];
};

const exampleRules = `{
  "all": [
    { "field": "tag", "op": "equals", "value": "client" }
  ]
}`;

export function SegmentsCrmView({ segments }: Props) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [rulesJson, setRulesJson] = useState(exampleRules);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      let rules: Record<string, unknown>;
      try {
        rules = JSON.parse(rulesJson) as Record<string, unknown>;
      } catch {
        setError("JSON des règles invalide.");
        return;
      }
      const res = await createCrmSegmentServer({ name, rules });
      if (res.ok) {
        setName("");
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  function removeSegment(id: string, segmentName: string) {
    if (
      !window.confirm(
        `Supprimer le segment « ${segmentName} » ? Cette action est définitive.`
      )
    ) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteCrmSegmentServer({ segmentId: id });
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <>
      <Card className="mb-6 space-y-4 p-6">
        <h2 className="font-semibold text-[#202223] dark:text-white">Nouveau segment</h2>
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="seg-name">Nom</Label>
            <Input
              id="seg-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seg-rules">Règles (JSON)</Label>
            <textarea
              id="seg-rules"
              className="min-h-[160px] w-full rounded-md border border-creo-gray-200 bg-white p-3 font-mono text-creo-xs dark:border-input dark:bg-transparent"
              value={rulesJson}
              onChange={(e) => setRulesJson(e.target.value)}
              disabled={pending}
            />
          </div>
          {error ? (
            <p className="text-sm text-red-600 dark:text-red-400" role="alert">
              {error}
            </p>
          ) : null}
          <Button type="submit" size="sm" disabled={pending}>
            Créer le segment
          </Button>
        </form>
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="border-b border-creo-gray-100 px-4 py-3 dark:border-[var(--creo-dashboard-border)]">
          <p className="text-creo-sm font-medium">Segments enregistrés</p>
        </div>
        {segments.length === 0 ? (
          <p className="p-6 text-creo-sm text-creo-gray-500">Aucun segment pour l’instant.</p>
        ) : (
          <table className="w-full text-creo-sm">
            <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs uppercase text-creo-gray-500 dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)]">
              <tr>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Créé</th>
                <th className="w-28 px-4 py-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {segments.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-creo-gray-100 dark:border-[var(--creo-dashboard-border)]"
                >
                  <td className="px-4 py-3 font-medium dark:text-white">{s.name}</td>
                  <td className="px-4 py-3 text-creo-gray-500">
                    {new Date(s.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      disabled={pending}
                      onClick={() => removeSegment(s.id, s.name)}
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
