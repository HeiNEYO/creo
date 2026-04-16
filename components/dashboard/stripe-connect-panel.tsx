"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { isPaidPlatformPlan } from "@/lib/workspaces/platform-plan";
import { CreoIntegrationMark } from "@/components/dashboard/integrations/creo-integration-mark";
import { StripeWordmark } from "@/components/dashboard/payment-brand-logos";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StripeConnectPanelContext = "integrations" | "payment-gateways";

type Props = {
  context: StripeConnectPanelContext;
  platformPlan: string;
  connectOAuthClientIdConfigured: boolean;
  stripeSecretConfigured: boolean;
  appUrlConfigured: boolean;
  /** Les 6 prix plateforme (Creator / Pro / Agency × mensuel / annuel) sont définis. */
  platformStripePricesConfigured: boolean;
  showStripePriceCreatorHint?: boolean;
  initialStripeConnectAccountId: string | null;
  initialStripeConnectChargesEnabled: boolean;
  /** Page détail intégration : évite le titre/marketing redondant au-dessus des actions. */
  detailLayout?: boolean;
};

export function StripeConnectPanel({
  context,
  platformPlan,
  connectOAuthClientIdConfigured,
  stripeSecretConfigured,
  appUrlConfigured,
  platformStripePricesConfigured,
  showStripePriceCreatorHint = true,
  initialStripeConnectAccountId,
  initialStripeConnectChargesEnabled,
  detailLayout = false,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [connectMsg, setConnectMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const connectRequiresPaid = !isPaidPlatformPlan(platformPlan);

  function startStripeConnectOAuth() {
    setConnectMsg(null);
    const q = context === "payment-gateways" ? "?return=settings" : "";
    window.location.href = `/api/stripe/connect/oauth/start${q}`;
  }

  function startStripeConnectOnboarding() {
    setConnectMsg(null);
    startTransition(async () => {
      const body =
        context === "payment-gateways" ? JSON.stringify({ returnTo: "payment-gateways" }) : "{}";
      const r = await fetch("/api/stripe/connect/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });
      const raw = await r.text();
      let j: { error?: string; url?: string } = {};
      try {
        j = raw ? (JSON.parse(raw) as { error?: string; url?: string }) : {};
      } catch {
        j = {};
      }
      if (!r.ok) {
        setConnectMsg(j.error?.trim() || raw.slice(0, 200) || `Erreur ${r.status}`);
        return;
      }
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      setConnectMsg("Pas d’URL de liaison Stripe.");
    });
  }

  const isGateways = context === "payment-gateways";

  return (
    <>
      {!stripeSecretConfigured || !appUrlConfigured ? (
        <Card className="mb-4 border-amber-200 bg-amber-50 p-4 text-creo-sm text-amber-950 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-100">
          <p className="font-semibold">Configuration Stripe manquante</p>
          <p className="mt-2 text-creo-xs text-amber-900/90 dark:text-amber-100/90">
            Ajoute <code className="rounded bg-amber-100/80 px-1 dark:bg-black/30">STRIPE_SECRET_KEY</code> et{" "}
            <code className="rounded bg-amber-100/80 px-1 dark:bg-black/30">NEXT_PUBLIC_APP_URL</code> sur ton hébergeur,
            puis redéploie.
          </p>
        </Card>
      ) : showStripePriceCreatorHint && !platformStripePricesConfigured ? (
        <Card className="mb-4 border-creo-gray-200 bg-creo-gray-50 p-4 text-creo-sm text-creo-gray-800 dark:border-border dark:bg-muted/40 dark:text-muted-foreground">
          <p>
            <strong className="font-medium text-foreground">Abonnement plateforme :</strong> ajoute les 6 variables{" "}
            <code className="rounded bg-white px-1 dark:bg-black/40">STRIPE_PRICE_*_MONTHLY</code> et{" "}
            <code className="rounded bg-white px-1 dark:bg-black/40">STRIPE_PRICE_*_YEARLY</code> (Creator, Pro,
            Agency). La liaison vendeur Stripe fonctionne sans ces variables.
          </p>
        </Card>
      ) : null}

      {searchParams.get("stripe_connect") === "return" ? (
        <Card className="mb-4 border-blue-200 bg-blue-50 p-4 text-creo-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
          Retour Stripe enregistré. Recharge si le statut ne change pas (webhook <code className="text-creo-xs">account.updated</code>).
        </Card>
      ) : null}
      {searchParams.get("stripe_connect") === "refresh" ? (
        <Card className="mb-4 p-4 text-creo-sm text-creo-gray-600">Lien expiré — relance la connexion ci-dessous.</Card>
      ) : null}
      {searchParams.get("stripe_connect_oauth") === "success" ? (
        <Card className="mb-4 border-green-200 bg-green-50 p-4 text-creo-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">
          Compte Stripe connecté. Recharge si le badge reste inchangé.
        </Card>
      ) : null}
      {searchParams.get("stripe_connect_oauth") === "error" ? (
        <Card className="mb-4 border-red-200 bg-red-50 p-4 text-creo-sm text-red-900 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
          {searchParams.get("stripe_connect_oauth_msg")?.trim() ||
            "OAuth Stripe impossible — réessaie ou passe par Express."}
        </Card>
      ) : null}

      <Card
        className={
          isGateways
            ? "overflow-hidden border-creo-gray-200 p-0 dark:border-border"
            : detailLayout
              ? "border-0 bg-transparent p-0 shadow-none dark:border-0 dark:bg-transparent"
              : "border-creo-gray-200 p-5 dark:border-border"
        }
      >
        {isGateways ? (
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <StripeWordmark />
                <Badge variant={initialStripeConnectChargesEnabled ? "green" : "gray"}>
                  {initialStripeConnectChargesEnabled
                    ? "Actif"
                    : initialStripeConnectAccountId
                      ? "À finaliser"
                      : "Non connecté"}
                </Badge>
              </div>
              <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
                Encaissement de tes clients sur ton compte Stripe (Connect).
              </p>
              {!connectOAuthClientIdConfigured ? (
                <p className="text-creo-xs text-creo-gray-500">
                  OAuth « compte existant » : variable{" "}
                  <code className="rounded bg-muted px-1">NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID</code> + redirect OAuth
                  dans Stripe.
                </p>
              ) : null}
              {connectRequiresPaid ? (
                <p className="text-creo-xs text-amber-800 dark:text-amber-200">
                  Plan Starter : souscris d’abord à CRÉO (Intégrations).
                </p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              {connectOAuthClientIdConfigured ? (
                <Button
                  type="button"
                  size="sm"
                  variant="stripeOutline"
                  className="w-full min-w-[14rem] sm:w-auto"
                  onClick={startStripeConnectOAuth}
                  disabled={pending || connectRequiresPaid}
                >
                  J’ai déjà un compte Stripe
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="stripe"
                className="w-full min-w-[14rem] sm:w-auto"
                onClick={startStripeConnectOnboarding}
                disabled={pending || connectRequiresPaid}
              >
                {initialStripeConnectAccountId ? "Poursuivre Express" : "Connecter avec Stripe Express"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {!detailLayout ? (
              <>
                <CreoIntegrationMark />
                <h3 className="mt-4 text-creo-md font-semibold">Lier ton Stripe pour encaisser</h3>
              </>
            ) : null}
            <div className={cn(detailLayout ? "" : "mt-3", "flex flex-wrap items-center gap-3")}>
              {!detailLayout ? <StripeWordmark className="!text-[1.15rem]" /> : null}
              <Badge variant={initialStripeConnectChargesEnabled ? "green" : "gray"}>
                {initialStripeConnectChargesEnabled
                  ? "Stripe lié — encaissement OK"
                  : initialStripeConnectAccountId
                    ? "Finalise sur Stripe"
                    : "Stripe non lié"}
              </Badge>
            </div>
            {!detailLayout ? (
              <p className="mt-3 text-creo-sm text-creo-gray-500">
                Paiements clients → ton Stripe (Connect). Abonnement CRÉO → Intégrations.
              </p>
            ) : null}
            {!connectOAuthClientIdConfigured ? (
              <p className="mt-2 text-creo-xs text-creo-gray-500">
                OAuth : <code className="rounded bg-muted px-1">NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID</code> + callback
                dans Stripe Connect.
              </p>
            ) : null}
            {connectRequiresPaid ? (
              <p className="mt-2 text-creo-xs text-amber-800 dark:text-amber-200">
                Starter : abonnement plateforme requis (Intégrations).
              </p>
            ) : null}
            <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
              {connectOAuthClientIdConfigured ? (
                <Button
                  type="button"
                  size="sm"
                  variant="stripeOutline"
                  onClick={startStripeConnectOAuth}
                  disabled={pending || connectRequiresPaid}
                >
                  J’ai déjà un compte Stripe
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                variant="stripe"
                onClick={startStripeConnectOnboarding}
                disabled={pending || connectRequiresPaid}
              >
                {initialStripeConnectAccountId ? "Poursuivre (Express)" : "Lier avec Stripe Express"}
              </Button>
            </div>
          </>
        )}
        {connectMsg ? (
          <p
            className={
              isGateways
                ? "border-t border-creo-gray-100 px-5 py-3 text-creo-sm text-red-600 dark:border-border dark:text-red-400"
                : "mt-2 text-creo-sm text-red-600 dark:text-red-400"
            }
          >
            {connectMsg}
          </p>
        ) : null}
        {isGateways ? (
          <p className="border-t border-creo-gray-100 px-5 py-3 text-creo-xs text-creo-gray-500 dark:border-border">
            Webhook et pixel :{" "}
            <button
              type="button"
              className="text-creo-purple underline underline-offset-2"
              onClick={() => router.push("/dashboard/integrations")}
            >
              Intégrations
            </button>
            . Abonnement plateforme :{" "}
            <button
              type="button"
              className="text-creo-purple underline underline-offset-2"
              onClick={() => router.push("/dashboard/settings?section=subscription-creo")}
            >
              Paramètres → Abonnement CRÉO
            </button>
          </p>
        ) : null}
      </Card>
    </>
  );
}
