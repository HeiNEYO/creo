"use client";

import { Copy, LayoutTemplate, Mail, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  createEmailCampaignServer,
  deleteEmailCampaignServer,
  duplicateEmailCampaignServer,
} from "@/lib/emails/actions";
import { emailCrmRoutes } from "@/lib/email-crm/routes";
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

export type CampaignsListMode = "campaigns" | "templates";

type Props = {
  /** Campagnes d’envoi vs bibliothèque de modèles (filtre serveur + création). */
  mode?: CampaignsListMode;
  campaigns: CampaignRow[];
  pageTitle?: string;
  pageDescription?: string;
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  scheduled: "Planifiée",
  sending: "En cours",
  sent: "Envoyée",
  paused: "En pause",
};

export function CampaignsList({
  mode = "campaigns",
  campaigns,
  pageTitle = "Campagnes",
  pageDescription = "Envoi ponctuel — rédaction, HTML et tests.",
}: Props) {
  const isTemplates = mode === "templates";
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const canDelete = (status: string) =>
    status === "draft" || status === "paused" || status === "scheduled";

  function duplicateCampaign(id: string) {
    setActionError(null);
    startTransition(async () => {
      const res = await duplicateEmailCampaignServer({ campaignId: id });
      if (res.ok) {
        router.push(emailCrmRoutes.campaignHtml(res.id));
      } else {
        setActionError(res.error);
      }
    });
  }

  function duplicateTemplateAsCampaign(id: string) {
    setActionError(null);
    startTransition(async () => {
      const res = await duplicateEmailCampaignServer({
        campaignId: id,
        targetIsTemplate: false,
      });
      if (res.ok) {
        router.push(emailCrmRoutes.campaignHtml(res.id));
      } else {
        setActionError(res.error);
      }
    });
  }

  function removeCampaign(id: string, campaignName: string, status: string) {
    if (!canDelete(status)) {
      return;
    }
    if (
      !window.confirm(
        isTemplates
          ? `Supprimer le modèle « ${campaignName} » ? Cette action est définitive.`
          : `Supprimer la campagne « ${campaignName} » ? Cette action est définitive.`
      )
    ) {
      return;
    }
    setActionError(null);
    startTransition(async () => {
      const res = await deleteEmailCampaignServer({ campaignId: id });
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
      const res = await createEmailCampaignServer({
        name,
        isTemplate: isTemplates,
      });
      if (res.ok) {
        setDialogOpen(false);
        router.push(emailCrmRoutes.campaignHtml(res.id));
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <>
      <PageHeader
        title={pageTitle}
        description={pageDescription}
        action={
          <Button type="button" size="sm" onClick={openCreate}>
            <Plus className="size-4" />
            {isTemplates ? "Nouveau modèle" : "Nouvelle campagne"}
          </Button>
        }
      />

      {actionError ? (
        <p className="mb-4 text-creo-sm text-red-600 dark:text-red-400" role="alert">
          {actionError}
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
              {isTemplates ? "Nouveau modèle" : "Nouvelle campagne"}
            </h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="camp-create-name">Nom *</Label>
                <Input
                  id="camp-create-name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex. Lancement printemps"
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

      {campaigns.length === 0 ? (
        <Card className="p-8 text-center text-creo-sm text-creo-gray-500">
          {isTemplates
            ? "Aucun modèle. Crée-en un pour réutiliser la mise en page dans tes campagnes."
            : "Aucune campagne. Crée-en une avec le bouton ci-dessus."}
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-creo-sm">
            <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500 dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)] dark:text-creo-gray-500">
              <tr>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Statut</th>
                <th className="px-4 py-3 text-left">Objet</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">Éditeur</th>
                <th className="w-36 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-creo-gray-100 dark:border-[var(--creo-dashboard-border)]"
                >
                  <td className="px-4 py-3 font-medium dark:text-white">
                    <Link
                      href={emailCrmRoutes.campaignHtml(c.id)}
                      className="hover:underline"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        c.status === "sent"
                          ? "green"
                          : c.status === "scheduled"
                            ? "blue"
                            : c.status === "sending"
                              ? "purple"
                              : "gray"
                      }
                    >
                      {statusLabels[c.status] ?? c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-creo-gray-600 dark:text-creo-gray-500">
                    {c.subject?.trim() ? c.subject : "—"}
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <Link
                      href={emailCrmRoutes.campaignDesign(c.id)}
                      className="inline-flex items-center gap-1 text-creo-purple hover:underline"
                    >
                      <LayoutTemplate className="size-4" />
                      Visuel
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-wrap items-center justify-end gap-1">
                      {isTemplates ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 px-2 text-creo-purple"
                          disabled={pending}
                          title="Dupliquer en campagne d’envoi"
                          onClick={(e) => {
                            e.preventDefault();
                            duplicateTemplateAsCampaign(c.id);
                          }}
                        >
                          <Mail className="size-4" />
                          <span className="hidden sm:inline">Campagne</span>
                        </Button>
                      ) : null}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        disabled={pending}
                        title={isTemplates ? "Dupliquer le modèle" : "Dupliquer"}
                        onClick={(e) => {
                          e.preventDefault();
                          duplicateCampaign(c.id);
                        }}
                      >
                        <Copy className="size-4" />
                        <span className="sr-only">
                          {isTemplates ? "Dupliquer le modèle" : "Dupliquer"}
                        </span>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                        disabled={pending || !canDelete(c.status)}
                        title={
                          canDelete(c.status)
                            ? "Supprimer"
                            : "Seules les campagnes non envoyées peuvent être supprimées"
                        }
                        onClick={(e) => {
                          e.preventDefault();
                          removeCampaign(c.id, c.name, c.status);
                        }}
                      >
                        <Trash2 className="size-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
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
