"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { saveWorkspaceEmailSettingsServer } from "@/lib/crm/workspace-email-settings-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type PageOption = { id: string; title: string; slug: string };

type Props = {
  initialFromName: string;
  initialFromEmail: string;
  initialReplyTo: string;
  initialDoubleOptIn: boolean;
  initialDoubleOptInSubject: string;
  initialDoubleOptInHtml: string;
  initialUnsubPageId: string;
  initialConfirmPageId: string;
  pages: PageOption[];
};

export function WorkspaceEmailCrmSettingsForm({
  initialFromName,
  initialFromEmail,
  initialReplyTo,
  initialDoubleOptIn,
  initialDoubleOptInSubject,
  initialDoubleOptInHtml,
  initialUnsubPageId,
  initialConfirmPageId,
  pages,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [fromName, setFromName] = useState(initialFromName);
  const [fromEmail, setFromEmail] = useState(initialFromEmail);
  const [replyTo, setReplyTo] = useState(initialReplyTo);
  const [doubleOptIn, setDoubleOptIn] = useState(initialDoubleOptIn);
  const [doubleOptInSubject, setDoubleOptInSubject] = useState(
    initialDoubleOptInSubject
  );
  const [doubleOptInHtml, setDoubleOptInHtml] = useState(initialDoubleOptInHtml);
  const [unsubPageId, setUnsubPageId] = useState(initialUnsubPageId);
  const [confirmPageId, setConfirmPageId] = useState(initialConfirmPageId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveWorkspaceEmailSettingsServer({
        fromName,
        fromEmail,
        replyTo: replyTo || undefined,
        doubleOptIn,
        doubleOptInSubject: doubleOptInSubject || undefined,
        doubleOptInHtml: doubleOptInHtml || undefined,
        unsubPageId: unsubPageId || null,
        confirmPageId: confirmPageId || null,
      });
      if (res.ok) {
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="crm-from-name">Nom d’expéditeur</Label>
          <Input
            id="crm-from-name"
            value={fromName}
            onChange={(e) => setFromName(e.target.value)}
            placeholder="Ma marque"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="crm-from-email">Email d’expéditeur *</Label>
          <Input
            id="crm-from-email"
            type="email"
            required
            value={fromEmail}
            onChange={(e) => setFromEmail(e.target.value)}
            placeholder="contact@domaine.com"
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="crm-reply">Réponse (reply-to)</Label>
        <Input
          id="crm-reply"
          type="email"
          value={replyTo}
          onChange={(e) => setReplyTo(e.target.value)}
          placeholder="support@domaine.com"
          disabled={pending}
        />
        <p className="text-creo-xs text-creo-gray-500">
          Laisse vide pour utiliser l’email d’expéditeur.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-creo-gray-200 p-4 dark:border-[var(--creo-dashboard-border)]">
        <input
          id="crm-doi"
          type="checkbox"
          className="mt-1 size-4 rounded border-creo-gray-300"
          checked={doubleOptIn}
          onChange={(e) => setDoubleOptIn(e.target.checked)}
          disabled={pending}
        />
        <div className="min-w-0 flex-1">
          <Label htmlFor="crm-doi" className="cursor-pointer font-medium">
            Double opt-in
          </Label>
          <p className="text-creo-xs text-creo-gray-500">
            L’inscrit doit confirmer par email avant d’être actif (contenu des mails ci-dessous si
            activé).
          </p>
        </div>
      </div>

      {doubleOptIn ? (
        <div className="space-y-4 rounded-lg border border-dashed border-creo-gray-200 p-4 dark:border-[var(--creo-dashboard-border)]">
          <div className="space-y-2">
            <Label htmlFor="crm-doi-subj">Objet du mail de confirmation</Label>
            <Input
              id="crm-doi-subj"
              value={doubleOptInSubject}
              onChange={(e) => setDoubleOptInSubject(e.target.value)}
              placeholder="Confirme ton inscription"
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="crm-doi-html">Corps HTML (confirmation)</Label>
            <textarea
              id="crm-doi-html"
              className="min-h-[120px] w-full rounded-md border border-creo-gray-200 bg-white p-3 font-mono text-creo-xs dark:border-input dark:bg-transparent"
              value={doubleOptInHtml}
              onChange={(e) => setDoubleOptInHtml(e.target.value)}
              placeholder="<p>Clique pour confirmer…</p>"
              disabled={pending}
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="crm-unsub">Page désabonnement</Label>
          <select
            id="crm-unsub"
            className="flex h-10 w-full rounded-md border border-creo-gray-200 bg-white px-3 text-creo-sm dark:border-input dark:bg-transparent"
            value={unsubPageId}
            onChange={(e) => setUnsubPageId(e.target.value)}
            disabled={pending}
          >
            <option value="">— Aucune —</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title?.trim() || p.slug} ({p.slug})
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="crm-confirm">Page confirmation (après opt-in)</Label>
          <select
            id="crm-confirm"
            className="flex h-10 w-full rounded-md border border-creo-gray-200 bg-white px-3 text-creo-sm dark:border-input dark:bg-transparent"
            value={confirmPageId}
            onChange={(e) => setConfirmPageId(e.target.value)}
            disabled={pending}
          >
            <option value="">— Aucune —</option>
            {pages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title?.trim() || p.slug} ({p.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <p className="text-creo-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Enregistrement…" : "Enregistrer les paramètres"}
      </Button>
    </form>
  );
}
