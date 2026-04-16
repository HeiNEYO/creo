"use client";

import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createEmailSequenceServer,
  deleteEmailSequenceServer,
  toggleEmailSequenceActiveServer,
} from "@/lib/emails/actions";
import { isPaidPlatformPlan } from "@/lib/workspaces/platform-plan";
import { emailCrmRoutes } from "@/lib/email-crm/routes";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SequenceRow = {
  id: string;
  name: string;
  active: boolean;
  stepCount?: number;
};

type Props = {
  sequences: SequenceRow[];
  /** Plan plateforme — activation des séquences réservée aux plans payants. */
  platformPlan?: string;
};

export function SequencesList({ sequences, platformPlan = "starter" }: Props) {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);
  const canActivateSequences = isPaidPlatformPlan(platformPlan);

  function setActive(id: string, active: boolean) {
    setActionError(null);
    startTransition(async () => {
      const res = await toggleEmailSequenceActiveServer({ sequenceId: id, active });
      if (res.ok) {
        router.refresh();
      } else {
        setActionError(res.error);
      }
    });
  }

  function removeSequence(id: string, sequenceName: string) {
    if (
      !window.confirm(
        `Supprimer la séquence « ${sequenceName} » ? Cette action est définitive.`
      )
    ) {
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const res = await deleteEmailSequenceServer({ sequenceId: id });
      if (res.ok) {
        router.refresh();
      } else {
        setActionError(res.error);
      }
    });
  }

  function openCreate() {
    setName("");
    setError(null);
    setDialogOpen(true);
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createEmailSequenceServer({ name });
      if (res.ok) {
        setDialogOpen(false);
        router.push(emailCrmRoutes.sequenceDetail(res.id));
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Automatisations"
        description="Séquences d’e-mails : ouvre une ligne pour ajouter des étapes (objet, délai, HTML). L’envoi automatique sera relié aux contacts ensuite."
        action={
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            Nouvelle séquence
          </Button>
        }
      />

      {actionError ? (
        <p className="mb-4 text-creo-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
        </p>
      ) : null}

      {!canActivateSequences ? (
        <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-creo-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          Plan Starter : tu peux créer des séquences et des étapes, mais l’activation automatique nécessite un
          abonnement Creator (ou supérieur).{" "}
          <Link
            href="/dashboard/settings?section=subscription-creo"
            className="font-medium text-creo-purple underline"
          >
            Abonnement CRÉO
          </Link>
        </p>
      ) : null}

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
              Nouvelle séquence
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="seq-create-name">Nom *</Label>
                <Input
                  id="seq-create-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Onboarding J+0 → J+7"
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

      {sequences.length === 0 ? (
        <Card className="p-8 text-center text-creo-sm text-creo-gray-500">
          Aucune séquence. Crée-en une avec le bouton ci-dessus.
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-creo-sm">
            <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500 dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)] dark:text-creo-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="w-24 px-4 py-3 text-left">Étapes</th>
                <th className="px-4 py-3 text-left">État</th>
                <th className="w-44 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sequences.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-creo-gray-100 dark:border-[var(--creo-dashboard-border)]"
                >
                  <td className="px-4 py-3 font-medium dark:text-white">
                    <Link
                      href={emailCrmRoutes.sequenceDetail(s.id)}
                      className="text-creo-purple hover:underline"
                    >
                      {s.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-creo-gray-600 dark:text-creo-gray-400">
                    {s.stepCount ?? 0}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={s.active ? "green" : "gray"}>
                        {s.active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={pending || (!canActivateSequences && !s.active)}
                        title={
                          !canActivateSequences && !s.active
                            ? "Abonnement Creator requis pour activer"
                            : undefined
                        }
                        onClick={() => setActive(s.id, !s.active)}
                      >
                        {s.active ? "Désactiver" : "Activer"}
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      disabled={pending}
                      title="Supprimer"
                      aria-label={`Supprimer ${s.name}`}
                      onClick={() => removeSequence(s.id, s.name)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
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
