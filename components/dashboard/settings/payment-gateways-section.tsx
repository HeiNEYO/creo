"use client";

import Link from "next/link";

import { StripeConnectPanel } from "@/components/dashboard/stripe-connect-panel";
import { PayPalWordmark } from "@/components/dashboard/payment-brand-logos";
import { WorkspacePaypalPrefsForm } from "@/components/dashboard/settings/workspace-paypal-prefs-form";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Props = {
  platformPlan: string;
  connectOAuthClientIdConfigured: boolean;
  stripeSecretConfigured: boolean;
  appUrlConfigured: boolean;
  platformStripePricesConfigured: boolean;
  initialStripeConnectAccountId: string | null;
  initialStripeConnectChargesEnabled: boolean;
  paypalEmail: string;
  workspaceReady: boolean;
};

export function PaymentGatewaysSection({
  platformPlan,
  connectOAuthClientIdConfigured,
  stripeSecretConfigured,
  appUrlConfigured,
  platformStripePricesConfigured,
  initialStripeConnectAccountId,
  initialStripeConnectChargesEnabled,
  paypalEmail,
  workspaceReady,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-creo-md font-semibold">Passerelles de paiement</h2>
          <p className="mt-1 text-creo-sm text-creo-gray-500">
            Connecte Stripe et PayPal pour encaisser sur tes pages.
          </p>
        </div>
        <Link
          href="/dashboard/payment-gateway-guide"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "shrink-0 self-start")}
        >
          Guide pas à pas
        </Link>
      </div>

      {!workspaceReady ? (
        <Card className="p-6 text-creo-sm text-creo-gray-500">Workspace introuvable.</Card>
      ) : (
        <>
          <StripeConnectPanel
            context="payment-gateways"
            platformPlan={platformPlan}
            connectOAuthClientIdConfigured={connectOAuthClientIdConfigured}
            stripeSecretConfigured={stripeSecretConfigured}
            appUrlConfigured={appUrlConfigured}
            platformStripePricesConfigured={platformStripePricesConfigured}
            showStripePriceCreatorHint={false}
            initialStripeConnectAccountId={initialStripeConnectAccountId}
            initialStripeConnectChargesEnabled={initialStripeConnectChargesEnabled}
          />

          <Card className="overflow-hidden border-creo-gray-200 p-0 dark:border-border">
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <PayPalWordmark />
                  <span className="rounded-full bg-creo-gray-100 px-2 py-0.5 text-creo-xs font-medium text-creo-gray-600 dark:bg-white/10 dark:text-muted-foreground">
                    Bientôt
                  </span>
                </div>
                <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
                  Enregistre ton identifiant PayPal pour la suite.
                </p>
              </div>
            </div>
            <div className="border-t border-creo-gray-100 px-5 py-4 dark:border-border">
              <WorkspacePaypalPrefsForm initialPaypalEmail={paypalEmail} submitVariant="paypal" compact />
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
