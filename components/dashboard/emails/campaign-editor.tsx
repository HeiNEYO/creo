"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import {
  sendEmailCampaignTestServer,
  updateEmailCampaignServer,
} from "@/lib/emails/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { buttonVariants } from "@/components/ui/button-variants";

type Props = {
  campaignId: string;
  initialName: string;
  initialSubject: string;
  initialPreviewText: string;
  initialHtml: string;
  status: string;
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  scheduled: "Planifiée",
  sent: "Envoyée",
};

export function CampaignEditor({
  campaignId,
  initialName,
  initialSubject,
  initialPreviewText,
  initialHtml,
  status,
}: Props) {
  const [name, setName] = useState(initialName);
  const [subject, setSubject] = useState(initialSubject);
  const [previewText, setPreviewText] = useState(initialPreviewText);
  const [htmlBody, setHtmlBody] = useState(initialHtml);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setMsg(null);
    startTransition(async () => {
      const res = await updateEmailCampaignServer({
        campaignId,
        name,
        subject,
        previewText,
        htmlBody,
      });
      setMsg(res.ok ? "Enregistré." : res.error);
    });
  }

  function sendTest() {
    setMsg(null);
    startTransition(async () => {
      const saveRes = await updateEmailCampaignServer({
        campaignId,
        name,
        subject,
        previewText,
        htmlBody,
      });
      if (!saveRes.ok) {
        setMsg(saveRes.error);
        return;
      }
      const res = await sendEmailCampaignTestServer({ campaignId });
      setMsg(res.ok ? "Email de test envoyé sur ton adresse de compte." : res.error);
    });
  }

  return (
    <>
      <PageHeader
        title={name || "Campagne"}
        description="Objet, aperçu et corps HTML"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                status === "sent" ? "green" : status === "scheduled" ? "blue" : "gray"
              }
            >
              {statusLabels[status] ?? status}
            </Badge>
            <Link
              href="/dashboard/emails"
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Retour
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="camp-name">Nom interne</Label>
            <Input
              id="camp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="camp-subject">Objet</Label>
            <Input
              id="camp-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="camp-preview">Texte d&apos;aperçu (preheader)</Label>
            <Input
              id="camp-preview"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              disabled={pending}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" onClick={save} disabled={pending}>
              Enregistrer
            </Button>
            <Button type="button" variant="secondary" onClick={sendTest} disabled={pending}>
              Enregistrer & envoyer test
            </Button>
          </div>
          {msg ? (
            <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground" role="status">
              {msg}
            </p>
          ) : null}
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="border-b border-creo-gray-100 px-4 py-3 dark:border-border">
            <p className="text-creo-sm font-medium">Corps HTML</p>
          </div>
          <textarea
            className="min-h-[420px] w-full resize-y border-0 bg-transparent p-4 font-mono text-creo-sm focus:outline-none focus:ring-0 dark:text-white"
            value={htmlBody}
            onChange={(e) => setHtmlBody(e.target.value)}
            disabled={pending}
            spellCheck={false}
            placeholder="<p>Bonjour …</p>"
          />
        </Card>
      </div>
    </>
  );
}
