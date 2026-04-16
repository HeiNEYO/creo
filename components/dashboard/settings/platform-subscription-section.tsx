"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { CurrentPlanOutline } from "@/components/dashboard/settings/current-plan-outline";
import { PlatformSubscriptionComparisonHero } from "@/components/dashboard/settings/platform-subscription-comparison";
import { Button } from "@/components/ui/button";
import type { PlatformSubscriptionInterval, PlatformSubscriptionPlanKey } from "@/lib/stripe/platform-subscription-prices";
import { cn } from "@/lib/utils";

type Props = {
  initialStripeCustomerId: string | null;
  platformStripePricesConfigured: boolean;
  /** Noms exacts des variables absentes (vide si tout est OK). */
  missingPlatformStripeEnvKeys: string[];
  planLabel: string;
};

export function PlatformSubscriptionSection({
  initialStripeCustomerId,
  platformStripePricesConfigured,
  missingPlatformStripeEnvKeys,
  planLabel,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const stripeMsg = searchParams.get("stripe");
  const [checkoutMsg, setCheckoutMsg] = useState<string | null>(null);
  const [portalMsg, setPortalMsg] = useState<string | null>(null);
  const [billingInterval, setBillingInterval] =
    useState<PlatformSubscriptionInterval>("month");
  const [pending, startTransition] = useTransition();

  function startStripeCheckout(plan: PlatformSubscriptionPlanKey) {
    setCheckoutMsg(null);
    startTransition(async () => {
      const r = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval: billingInterval }),
      });
      const raw = await r.text();
      let j: { error?: string; url?: string } = {};
      try {
        j = raw ? (JSON.parse(raw) as { error?: string; url?: string }) : {};
      } catch {
        j = {};
      }
      if (!r.ok) {
        setCheckoutMsg(j.error?.trim() || raw.slice(0, 200) || `Erreur ${r.status}`);
        return;
      }
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      setCheckoutMsg("Pas d’URL de paiement.");
    });
  }

  function openStripeCustomerPortal() {
    setPortalMsg(null);
    startTransition(async () => {
      const r = await fetch("/api/stripe/customer-portal", { method: "POST" });
      const raw = await r.text();
      let j: { error?: string; url?: string } = {};
      try {
        j = raw ? (JSON.parse(raw) as { error?: string; url?: string }) : {};
      } catch {
        j = {};
      }
      if (!r.ok) {
        setPortalMsg(j.error?.trim() || raw.slice(0, 200) || `Erreur ${r.status}`);
        return;
      }
      if (j.url) {
        window.location.href = j.url;
        return;
      }
      setPortalMsg("Pas d’URL de portail.");
    });
  }

  return (
    <div className="w-full min-w-0 space-y-10">
      {stripeMsg === "success" ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-creo-sm",
            "border-emerald-200/90 bg-emerald-50 text-emerald-900",
            "dark:border-emerald-500/25 dark:bg-emerald-950/45 dark:text-emerald-100",
          )}
        >
          Paiement Stripe reçu — le plan est synchronisé via les webhooks (
          <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-creo-xs text-emerald-900 dark:bg-black/25 dark:text-emerald-50">
            checkout.session.completed
          </code>
          ,{" "}
          <code className="rounded bg-white/70 px-1 py-0.5 font-mono text-creo-xs text-emerald-900 dark:bg-black/25 dark:text-emerald-50">
            customer.subscription.*
          </code>
          ).{" "}
          <button
            type="button"
            className="font-medium text-emerald-800 underline underline-offset-2 transition-colors hover:text-emerald-950 dark:text-emerald-200 dark:hover:text-white"
            onClick={() => router.refresh()}
          >
            Recharger
          </button>{" "}
          si besoin.
        </div>
      ) : null}
      {stripeMsg === "cancel" ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-creo-sm text-muted-foreground",
            "border-border bg-muted/40 dark:bg-muted/25",
          )}
        >
          Paiement annulé.
        </div>
      ) : null}

      <CurrentPlanOutline planLabel={planLabel} />

      {!platformStripePricesConfigured ? (
        <div
          className={cn(
            "rounded-lg border px-4 py-3 text-creo-sm",
            "border-amber-200 bg-amber-50 text-amber-950",
            "dark:border-amber-500/35 dark:bg-amber-950/40 dark:text-amber-50",
          )}
          role="status"
        >
          <p>
            <strong className="font-medium">Configuration incomplète :</strong> le serveur ne voit pas toutes les
            variables d’environnement (ou elles sont vides). Vérifie sur Vercel que chaque nom est exact et affecté à
            l’environnement <strong className="font-medium">Production</strong> (pas seulement Preview), puis
            redéploie.
          </p>
          {missingPlatformStripeEnvKeys.length > 0 ? (
            <ul className="mt-2 list-inside list-disc space-y-1 font-mono text-creo-xs">
              {missingPlatformStripeEnvKeys.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <section className="w-full min-w-0" aria-labelledby="creo-compare-heading">
        <h2 id="creo-compare-heading" className="sr-only">
          Comparer les offres et souscrire
        </h2>
        <PlatformSubscriptionComparisonHero
          billingInterval={billingInterval}
          onBillingIntervalChange={setBillingInterval}
          onSelectPlan={startStripeCheckout}
          pending={pending}
          checkoutDisabled={!platformStripePricesConfigured}
          activePlanLabel={planLabel}
        />
      </section>

      <div className="space-y-4 border-t border-border pt-8" aria-labelledby="creo-pricing-heading">
        <h3 id="creo-pricing-heading" className="text-creo-sm font-semibold text-foreground">
          Paiement & facturation
        </h3>
        <p className="text-creo-sm text-muted-foreground">
          Carte bancaire, factures et résiliation :{" "}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-creo-base text-creo-purple dark:text-creo-blue-readable"
            onClick={openStripeCustomerPortal}
            disabled={pending}
          >
            portail Stripe
          </Button>
          .
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline" onClick={openStripeCustomerPortal} disabled={pending}>
            Factures et abonnement
          </Button>
        </div>

        {initialStripeCustomerId ? (
          <p className="text-creo-xs text-muted-foreground">
            Client Stripe lié — le portail est prêt. Sinon, passe par un paiement ci-dessus une première fois.
          </p>
        ) : null}
        {checkoutMsg ? (
          <p className="text-creo-sm text-destructive dark:text-red-300" role="alert">
            {checkoutMsg}
          </p>
        ) : null}
        {portalMsg ? (
          <p className="text-creo-sm text-destructive dark:text-red-300" role="alert">
            {portalMsg}
          </p>
        ) : null}
      </div>
    </div>
  );
}
