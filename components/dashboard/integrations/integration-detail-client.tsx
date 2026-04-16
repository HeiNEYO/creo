"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { useState, useTransition } from "react";

import { IntegrationDetailTitleIcon } from "@/components/dashboard/integrations/integration-card-icon";
import { IntegrationDetailVisual } from "@/components/dashboard/integrations/integration-detail-visual";
import { StripeConnectPanel } from "@/components/dashboard/stripe-connect-panel";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  pingIntegrationWebhookServer,
  updateWorkspaceIntegrationsServer,
} from "@/lib/integrations/actions";
import type { IntegrationCatalogEntry } from "@/lib/integrations/catalog";
import { isPaidPlatformPlan } from "@/lib/workspaces/platform-plan";
import { cn } from "@/lib/utils";

type Props = {
  entry: IntegrationCatalogEntry;
  initialWebhookUrl: string;
  initialMetaPixelId: string;
  initialStripeConnectAccountId: string | null;
  initialStripeConnectChargesEnabled: boolean;
  platformPlan: string;
  connectOAuthClientIdConfigured: boolean;
  stripeSecretConfigured: boolean;
  appUrlConfigured: boolean;
  platformStripePricesConfigured: boolean;
};

export function IntegrationDetailClient({
  entry,
  initialWebhookUrl,
  initialMetaPixelId,
  initialStripeConnectAccountId,
  initialStripeConnectChargesEnabled,
  platformPlan,
  connectOAuthClientIdConfigured,
  stripeSecretConfigured,
  appUrlConfigured,
  platformStripePricesConfigured,
}: Props) {
  const router = useRouter();
  const paid = isPaidPlatformPlan(platformPlan);
  const showBusinessUpsell = entry.requiresPaidPlan && !paid;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <Link
            href="/dashboard/integrations"
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "w-fit shrink-0 gap-2 border-creo-gray-200 dark:border-border"
            )}
          >
            <ArrowLeft className="size-4" aria-hidden />
            Retour
          </Link>
          <div className="flex min-w-0 items-center gap-3">
            <IntegrationDetailTitleIcon id={entry.id} />
            <h1 className="truncate text-creo-xl font-semibold tracking-tight text-creo-black dark:text-foreground">
              {entry.label}
            </h1>
          </div>
        </div>
        <Link
          href={entry.helpHref}
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-creo-gray-200 text-creo-gray-600 transition-colors hover:bg-creo-gray-50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/50"
          aria-label="Documentation"
        >
          <BookOpen className="size-5" />
        </Link>
      </header>

      <div className="border-b border-creo-gray-200 dark:border-border">
        <span className="inline-block border-b-2 border-[#2563eb] pb-3 text-creo-sm font-semibold text-[#2563eb] dark:border-[var(--creo-blue-readable)] dark:text-[var(--creo-blue-readable)]">
          À propos
        </span>
      </div>

      <Card className="overflow-hidden !rounded-xl border !border-creo-gray-200/95 p-0 dark:!border-white/[0.12]">
        <div className="grid gap-0 md:grid-cols-2">
          <div className="space-y-4 p-6 sm:p-8">
            <p className="text-creo-sm leading-relaxed text-creo-gray-600 dark:text-muted-foreground">
              {entry.detailDescription}
            </p>

            {entry.comingSoon ? (
              <p className="rounded-lg border border-dashed border-creo-gray-200 bg-creo-gray-50 p-4 text-creo-sm text-creo-gray-600 dark:border-border dark:bg-muted/30 dark:text-muted-foreground">
                Cette intégration n’est pas encore disponible. Reviens plus tard ou contacte le support
                depuis l’onglet Aide.
              </p>
            ) : null}

            {showBusinessUpsell ? (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-creo-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/35 dark:text-amber-100">
                <span className="font-medium">Forfait supérieur requis</span>
                <span className="text-amber-900/90 dark:text-amber-100/90">
                  Passe sur Creator (ou supérieur) pour activer cette intégration.
                </span>
                <Link
                  href="/dashboard/settings?section=subscription-creo"
                  className="font-semibold text-amber-950 underline underline-offset-2 dark:text-amber-50"
                >
                  Voir les abonnements
                </Link>
              </div>
            ) : null}

            {!entry.comingSoon && entry.id === "webhook" ? (
              <WebhookPanel
                initialWebhookUrl={initialWebhookUrl}
                onSaved={() => router.refresh()}
              />
            ) : null}
            {!entry.comingSoon && entry.id === "meta-pixel" ? (
              <MetaPixelPanel
                initialMetaPixelId={initialMetaPixelId}
                onSaved={() => router.refresh()}
              />
            ) : null}
            {!entry.comingSoon && entry.id === "stripe" ? (
              <StripeConnectPanel
                context="integrations"
                platformPlan={platformPlan}
                connectOAuthClientIdConfigured={connectOAuthClientIdConfigured}
                stripeSecretConfigured={stripeSecretConfigured}
                appUrlConfigured={appUrlConfigured}
                platformStripePricesConfigured={platformStripePricesConfigured}
                showStripePriceCreatorHint
                initialStripeConnectAccountId={initialStripeConnectAccountId}
                initialStripeConnectChargesEnabled={initialStripeConnectChargesEnabled}
                detailLayout
              />
            ) : null}
          </div>
          <IntegrationDetailVisual
            id={entry.id}
            className="min-h-[240px] rounded-none border-t border-blue-100 md:border-l md:border-t-0 dark:border-blue-900/40"
          />
        </div>
      </Card>
    </div>
  );
}

function WebhookPanel({
  initialWebhookUrl,
  onSaved,
}: {
  initialWebhookUrl: string;
  onSaved: () => void;
}) {
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [pingMsg, setPingMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setSaveMsg(null);
    startTransition(async () => {
      const res = await updateWorkspaceIntegrationsServer({
        webhookUrl,
      });
      setSaveMsg(res.ok ? "Enregistré." : res.error);
      if (res.ok) {
        onSaved();
      }
    });
  }

  function ping() {
    setPingMsg(null);
    startTransition(async () => {
      const res = await pingIntegrationWebhookServer();
      if (res.ok) {
        setPingMsg(`Réponse HTTP ${res.status}`);
      } else {
        setPingMsg(res.error);
      }
    });
  }

  return (
    <div className="space-y-4 border-t border-creo-gray-100 pt-4 dark:border-border">
      <h2 className="text-creo-md font-semibold text-creo-black dark:text-foreground">Configuration</h2>
      <p className="text-creo-xs text-creo-gray-500 dark:text-muted-foreground">
        URL appelée pour les tests (événement <code className="text-creo-xs">creo.test</code>).
      </p>
      <div className="space-y-2">
        <Label htmlFor="detail-wh-url">URL HTTPS</Label>
        <Input
          id="detail-wh-url"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
          placeholder="https://…"
          disabled={pending}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={save} disabled={pending}>
          Enregistrer
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={ping} disabled={pending}>
          Tester le webhook
        </Button>
      </div>
      {saveMsg ? <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">{saveMsg}</p> : null}
      {pingMsg ? <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">{pingMsg}</p> : null}
    </div>
  );
}

function MetaPixelPanel({
  initialMetaPixelId,
  onSaved,
}: {
  initialMetaPixelId: string;
  onSaved: () => void;
}) {
  const [metaPixelId, setMetaPixelId] = useState(initialMetaPixelId);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function save() {
    setSaveMsg(null);
    startTransition(async () => {
      const res = await updateWorkspaceIntegrationsServer({
        metaPixelId,
      });
      setSaveMsg(res.ok ? "Enregistré." : res.error);
      if (res.ok) {
        onSaved();
      }
    });
  }

  return (
    <div className="space-y-4 border-t border-creo-gray-100 pt-4 dark:border-border">
      <h2 className="text-creo-md font-semibold text-creo-black dark:text-foreground">Configuration</h2>
      <p className="text-creo-xs text-creo-gray-500 dark:text-muted-foreground">
        Sur les pages publiques <code className="text-creo-xs">/p/…</code>, le pixel ne se charge que si le
        visiteur a accepté tous les cookies dans le bandeau.
      </p>
      <div className="space-y-2">
        <Label htmlFor="detail-px-id">Pixel ID</Label>
        <Input
          id="detail-px-id"
          value={metaPixelId}
          onChange={(e) => setMetaPixelId(e.target.value)}
          placeholder="1234567890"
          disabled={pending}
        />
      </div>
      <Button type="button" size="sm" variant="outline" onClick={save} disabled={pending}>
        Enregistrer
      </Button>
      {saveMsg ? <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">{saveMsg}</p> : null}
    </div>
  );
}
