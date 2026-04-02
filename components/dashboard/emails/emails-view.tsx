"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createEmailCampaignServer,
  createEmailSequenceServer,
} from "@/lib/emails/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type CampaignRow = {
  id: string;
  name: string;
  status: string;
  subject: string;
};

export type SequenceRow = {
  id: string;
  name: string;
  active: boolean;
};

type EmailsViewProps = {
  campaigns: CampaignRow[];
  sequences: SequenceRow[];
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  scheduled: "Planifiée",
  sent: "Envoyée",
};

export function EmailsView({ campaigns, sequences }: EmailsViewProps) {
  const router = useRouter();
  const [tab, setTab] = useState<"campaigns" | "sequences">("campaigns");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function openCreate() {
    setName("");
    setError(null);
    setDialogOpen(true);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      if (tab === "campaigns") {
        const res = await createEmailCampaignServer({ name });
        if (res.ok) {
          setDialogOpen(false);
          router.refresh();
        } else {
          setError(res.error);
        }
      } else {
        const res = await createEmailSequenceServer({ name });
        if (res.ok) {
          setDialogOpen(false);
          router.refresh();
        } else {
          setError(res.error);
        }
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Email marketing"
        description="Campagnes & séquences"
        action={
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            {tab === "campaigns" ? "Nouvelle campagne" : "Nouvelle séquence"}
          </Button>
        }
      />

      {dialogOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            aria-label="Fermer"
            onClick={() => setDialogOpen(false)}
          />
          <Card className="relative z-10 w-full max-w-md space-y-4 p-6">
            <h2 className="text-lg font-semibold text-[#202223] dark:text-white">
              {tab === "campaigns" ? "Nouvelle campagne" : "Nouvelle séquence"}
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="em-name">Nom *</Label>
                <Input
                  id="em-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={
                    tab === "campaigns"
                      ? "Ex. Lancement printemps"
                      : "Ex. Onboarding J+0 → J+7"
                  }
                  disabled={pending}
                />
              </div>
              {error ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                  disabled={pending}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Création…" : "Créer"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}

      <div className="mb-6 flex w-fit gap-1 rounded-creo-md border border-creo-gray-200 p-1 dark:border-[#2a2a2a]">
        <button
          type="button"
          onClick={() => setTab("campaigns")}
          className={`rounded-md px-4 py-2 text-creo-sm font-medium ${
            tab === "campaigns"
              ? "bg-creo-purple-pale text-creo-purple dark:bg-[#1f1f3a] dark:text-[#6688ff]"
              : "text-creo-gray-500 dark:text-[#a3a3a3]"
          }`}
        >
          Campagnes
        </button>
        <button
          type="button"
          onClick={() => setTab("sequences")}
          className={`rounded-md px-4 py-2 text-creo-sm font-medium ${
            tab === "sequences"
              ? "bg-creo-purple-pale text-creo-purple dark:bg-[#1f1f3a] dark:text-[#6688ff]"
              : "text-creo-gray-500 dark:text-[#a3a3a3]"
          }`}
        >
          Séquences
        </button>
      </div>

      {tab === "campaigns" ? (
        campaigns.length === 0 ? (
          <Card className="p-8 text-center text-creo-sm text-creo-gray-500">
            Aucune campagne. Crée-en une avec le bouton ci-dessus.
          </Card>
        ) : (
          <Card className="overflow-hidden p-0">
            <table className="w-full text-creo-sm">
              <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#a3a3a3]">
                <tr>
                  <th className="px-4 py-3 text-left">Nom</th>
                  <th className="px-4 py-3 text-left">Statut</th>
                  <th className="px-4 py-3 text-left">Objet</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-creo-gray-100 dark:border-[#2a2a2a]"
                  >
                    <td className="px-4 py-3 font-medium dark:text-white">
                      {c.name}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          c.status === "sent"
                            ? "green"
                            : c.status === "scheduled"
                              ? "blue"
                              : "gray"
                        }
                      >
                        {statusLabels[c.status] ?? c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-creo-gray-600 dark:text-[#a3a3a3]">
                      {c.subject?.trim() ? c.subject : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )
      ) : sequences.length === 0 ? (
        <Card className="p-8 text-center text-creo-sm text-creo-gray-500">
          Aucune séquence. Crée-en une avec le bouton ci-dessus.
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-creo-sm">
            <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500 dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#a3a3a3]">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">État</th>
              </tr>
            </thead>
            <tbody>
              {sequences.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-creo-gray-100 dark:border-[#2a2a2a]"
                >
                  <td className="px-4 py-3 font-medium dark:text-white">
                    {s.name}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={s.active ? "green" : "gray"}>
                      {s.active ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </>
  );
}
