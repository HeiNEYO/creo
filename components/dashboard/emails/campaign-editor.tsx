"use client";

import Link from "next/link";
import { LayoutTemplate } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { EMAIL_BROADCAST_MAX_CONTACTS } from "@/lib/config/limits";
import { isPaidPlatformPlan } from "@/lib/workspaces/platform-plan";
import {
  sendEmailCampaignBroadcastServer,
  sendEmailCampaignTestServer,
  updateEmailCampaignServer,
} from "@/lib/emails/actions";
import { emailCrmRoutes } from "@/lib/email-crm/routes";
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
  /** Liste des modèles (pas d’envoi de masse). */
  isTemplate?: boolean;
  /** Lien « Retour » vers campagnes ou modèles. */
  listBackHref?: string;
  /** Plan plateforme du workspace (starter = pas d’envoi de masse). */
  platformPlan?: string;
  /** Quota mensuel d’envois broadcast (0 = non affiché / illimité). Calculé côté serveur. */
  monthlyBroadcastCap?: number;
};

const statusLabels: Record<string, string> = {
  draft: "Brouillon",
  scheduled: "Planifiée",
  sending: "En cours",
  sent: "Envoyée",
  paused: "En pause",
};

export function CampaignEditor({
  campaignId,
  initialName,
  initialSubject,
  initialPreviewText,
  initialHtml,
  status,
  isTemplate = false,
  platformPlan = "starter",
  monthlyBroadcastCap = 0,
  listBackHref = emailCrmRoutes.campaigns,
}: Props) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [subject, setSubject] = useState(initialSubject);
  const [previewText, setPreviewText] = useState(initialPreviewText);
  const [htmlBody, setHtmlBody] = useState(initialHtml);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const canEdit = status !== "sent" && status !== "sending";
  const canBroadcast =
    !isTemplate &&
    (status === "draft" || status === "scheduled" || status === "paused");
  const paidForBroadcast = isPaidPlatformPlan(platformPlan);
  const canSendBroadcast = canBroadcast && paidForBroadcast;

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

  function sendBroadcast() {
    if (
      !window.confirm(
        `Envoyer cette campagne à tous les contacts abonnés de l’espace ?\n\n` +
          `Maximum ${EMAIL_BROADCAST_MAX_CONTACTS} envois par exécution (plafond technique).`
      )
    ) {
      return;
    }
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
      const res = await sendEmailCampaignBroadcastServer({ campaignId });
      if (!res.ok) {
        setMsg(res.error);
        return;
      }
      const cap =
        res.capped && res.totalSubscribers > EMAIL_BROADCAST_MAX_CONTACTS
          ? ` (plafond : ${EMAIL_BROADCAST_MAX_CONTACTS} sur ${res.totalSubscribers} abonnés — relance une nouvelle campagne pour le reste)`
          : "";
      setMsg(
        `Envoi terminé : ${res.sent} réussi(s), ${res.failed} échec(s).${cap}`
      );
      router.refresh();
    });
  }

  return (
    <>
      <PageHeader
        title={name || (isTemplate ? "Modèle" : "Campagne")}
        description={
          isTemplate
            ? "Modèle réutilisable — pas d’envoi de masse. Duplique en campagne depuis la liste des modèles."
            : "Objet, aperçu et corps HTML"
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                status === "sent"
                  ? "green"
                  : status === "scheduled"
                    ? "blue"
                    : status === "sending"
                      ? "purple"
                      : "gray"
              }
            >
              {statusLabels[status] ?? status}
            </Badge>
            <Link
              href={emailCrmRoutes.campaignDesign(campaignId)}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <LayoutTemplate className="size-4" />
              Éditeur visuel
            </Link>
            <Link
              href={listBackHref}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Retour
            </Link>
          </div>
        }
      />

      {isTemplate ? (
        <Card className="mb-6 border-sky-200 bg-sky-50/80 p-4 text-creo-sm text-sky-950 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100">
          Mode <strong>modèle</strong> : contenu pour réutilisation. Pour envoyer à tes abonnés,
          utilise « Campagne » depuis la liste des modèles ou crée une campagne dans l’onglet
          Campagnes.
        </Card>
      ) : null}

      {!canEdit && !isTemplate ? (
        <Card className="mb-6 border-amber-200 bg-amber-50/80 p-4 text-creo-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          Cette campagne est verrouillée après envoi. Tu peux la dupliquer depuis la liste des
          campagnes pour créer une nouvelle version modifiable.
        </Card>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-4 p-6">
          <div className="space-y-2">
            <Label htmlFor="camp-name">Nom interne</Label>
            <Input
              id="camp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={pending || !canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="camp-subject">Objet</Label>
            <Input
              id="camp-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={pending || !canEdit}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="camp-preview">Texte d&apos;aperçu (preheader)</Label>
            <Input
              id="camp-preview"
              value={previewText}
              onChange={(e) => setPreviewText(e.target.value)}
              disabled={pending || !canEdit}
            />
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="button" onClick={save} disabled={pending || !canEdit}>
              Enregistrer
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={sendTest}
              disabled={pending || !canEdit}
            >
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
            disabled={pending || !canEdit}
            spellCheck={false}
            placeholder="<p>Bonjour {{first_name}},</p>"
          />
        </Card>
      </div>

      {isTemplate ? (
        <Card className="mt-6 space-y-2 p-6 text-creo-sm text-creo-gray-600 dark:text-creo-gray-400">
          <h2 className="font-semibold text-[#202223] dark:text-white">Envoi aux abonnés</h2>
          <p>
            Les modèles ne sont pas diffusés en masse. Depuis la liste des modèles, clique sur{" "}
            <strong>Campagne</strong> pour créer une vraie campagne avec ce contenu.
          </p>
        </Card>
      ) : (
        <Card className="mt-6 space-y-4 p-6">
          <div>
            <h2 className="font-semibold text-[#202223] dark:text-white">Envoi réel (abonnés)</h2>
            <p className="mt-1 text-creo-sm text-creo-gray-500">
              Envoie à tous les contacts avec{" "}
              <code className="rounded bg-creo-gray-100 px-1 dark:bg-white/10">subscribed = true</code>
              . Variables dans l’objet et le HTML :{" "}
              <code className="rounded bg-creo-gray-100 px-1 dark:bg-white/10">{"{{first_name}}"}</code>
              ,{" "}
              <code className="rounded bg-creo-gray-100 px-1 dark:bg-white/10">{"{{last_name}}"}</code>
              ,{" "}
              <code className="rounded bg-creo-gray-100 px-1 dark:bg-white/10">{"{{email}}"}</code>.
              Plafond par exécution : {EMAIL_BROADCAST_MAX_CONTACTS} envois (Resend / quotas).
              {monthlyBroadcastCap > 0 ? (
                <> Quota mensuel (plateforme) : {monthlyBroadcastCap} envois.</>
              ) : null}
            </p>
          </div>
          {canBroadcast && !paidForBroadcast ? (
            <div
              className="rounded-lg border border-amber-200 bg-amber-50/80 px-3 py-2 text-creo-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
              role="status"
            >
              <strong className="font-medium">Abonnement Creator requis</strong> pour l’envoi de
              masse. Les e-mails de test depuis ce formulaire restent disponibles.
              <div className="mt-2 flex flex-wrap gap-2">
                <Link
                  href="/dashboard/settings?section=subscription-creo"
                  className={buttonVariants({ size: "sm", className: "inline-flex" })}
                >
                  Abonnement CRÉO
                </Link>
              </div>
            </div>
          ) : null}
          <Button
            type="button"
            variant="default"
            disabled={pending || !canSendBroadcast}
            onClick={sendBroadcast}
          >
            {!canBroadcast
              ? "Envoi indisponible (déjà envoyée)"
              : !paidForBroadcast
                ? "Envoi de masse — abonnement requis"
                : "Envoyer la campagne maintenant"}
          </Button>
        </Card>
      )}
    </>
  );
}
