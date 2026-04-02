"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import {
  pingIntegrationWebhookServer,
  updateWorkspaceIntegrationsServer,
} from "@/lib/integrations/actions";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  initialWebhookUrl: string;
  initialMetaPixelId: string;
};

export function IntegrationsView({
  initialWebhookUrl,
  initialMetaPixelId,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripeMsg = searchParams.get("stripe");
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl);
  const [metaPixelId, setMetaPixelId] = useState(initialMetaPixelId);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);
  const [pingMsg, setPingMsg] = useState<string | null>(null);
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveIntegrations() {
    setSaveMsg(null);
    startTransition(async () => {
      const res = await updateWorkspaceIntegrationsServer({
        webhookUrl,
        metaPixelId,
      });
      setSaveMsg(res.ok ? "Enregistré." : res.error);
      if (res.ok) {
        router.refresh();
      }
    });
  }

  function pingWebhook() {
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

  function startStripeCheckout() {
    setCheckoutMsg(null);
    startTransition(async () => {
      const r = await fetch("/api/stripe/checkout", { method: "POST" });
      if (!r.ok) {
        const j = (await r.json().catch(() => ({}))) as { error?: string };
        setCheckoutMsg(j.error ?? `Erreur ${r.status}`);
        return;
      }
      const j = (await r.json()) as { url?: string };
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      setCheckoutMsg("Pas d’URL de paiement.");
    });
  }

  return (
    <>
      <PageHeader
        title="Intégrations"
        description="Webhook sortant, pixel Meta, abonnement Stripe"
      />

      {stripeMsg === "success" ? (
        <Card className="mb-4 border-green-200 bg-green-50 p-4 text-creo-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
          Paiement Stripe reçu — le plan workspace sera mis à jour après traitement du
          webhook.
        </Card>
      ) : null}
      {stripeMsg === "cancel" ? (
        <Card className="mb-4 p-4 text-creo-sm text-creo-gray-600">
          Paiement annulé.
        </Card>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Card className="p-5 sm:col-span-2 xl:col-span-3">
          <div className="flex size-10 items-center justify-center rounded-creo-md bg-creo-gray-100 text-creo-sm font-medium text-creo-gray-600 dark:text-muted-foreground">
            WH
          </div>
          <h3 className="mt-4 text-creo-md font-semibold">Webhook sortant</h3>
          <p className="mt-1 text-creo-sm text-creo-gray-500">
            URL appelée pour les tests (événement <code className="text-creo-xs">creo.test</code>
            ).
          </p>
          <div className="mt-4 space-y-2">
            <Label htmlFor="wh-url">URL HTTPS</Label>
            <Input
              id="wh-url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://…"
              disabled={pending}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={saveIntegrations} disabled={pending}>
              Enregistrer
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={pingWebhook}
              disabled={pending}
            >
              Tester le webhook
            </Button>
          </div>
          {saveMsg ? (
            <p className="mt-2 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
              {saveMsg}
            </p>
          ) : null}
          {pingMsg ? (
            <p className="mt-2 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
              {pingMsg}
            </p>
          ) : null}
        </Card>

        <Card className="p-5">
          <div className="flex size-10 items-center justify-center rounded-creo-md bg-creo-gray-100 text-creo-sm font-medium text-creo-gray-600">
            Me
          </div>
          <h3 className="mt-4 text-creo-md font-semibold">Meta Pixel</h3>
          <p className="mt-1 text-creo-sm text-creo-gray-500">
            ID stocké pour usage futur (injection script).
          </p>
          <div className="mt-4 space-y-2">
            <Label htmlFor="px-id">Pixel ID</Label>
            <Input
              id="px-id"
              value={metaPixelId}
              onChange={(e) => setMetaPixelId(e.target.value)}
              placeholder="1234567890"
              disabled={pending}
            />
          </div>
          <Button
            type="button"
            className="mt-4"
            size="sm"
            variant="outline"
            onClick={saveIntegrations}
            disabled={pending}
          >
            Enregistrer
          </Button>
        </Card>

        <Card className="p-5">
          <div className="flex size-10 items-center justify-center rounded-creo-md bg-creo-gray-100 text-creo-sm font-medium text-creo-gray-600">
            St
          </div>
          <h3 className="mt-4 text-creo-md font-semibold">Stripe</h3>
          <p className="mt-1 text-creo-sm text-creo-gray-500">
            Abonnement Creator (prix défini par{" "}
            <code className="text-creo-xs">STRIPE_PRICE_CREATOR</code>).
          </p>
          <div className="mt-4 flex items-center justify-between gap-2">
            <Badge variant="gray">À connecter</Badge>
            <Button type="button" size="sm" onClick={startStripeCheckout} disabled={pending}>
              Ouvrir Checkout
            </Button>
          </div>
          {checkoutMsg ? (
            <p className="mt-2 text-creo-sm text-red-600 dark:text-red-400">{checkoutMsg}</p>
          ) : null}
        </Card>
      </div>
    </>
  );
}
