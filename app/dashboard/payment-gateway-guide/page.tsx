import Link from "next/link";

import { PayPalWordmark, StripeWordmark } from "@/components/dashboard/payment-brand-logos";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

const stepClass = "flex gap-4 rounded-xl border border-creo-gray-200 bg-white p-4 dark:border-border dark:bg-card";

export default function PaymentGatewayGuidePage() {
  return (
    <>
      <div className="mb-6 flex flex-wrap gap-3">
        <Link
          href="/dashboard/settings?section=payment-gateways"
          className={cn(buttonVariants({ variant: "default", size: "sm" }))}
        >
          ← Passerelles de paiement
        </Link>
      </div>

      <div className="space-y-8">
        <Card className="space-y-3 p-6">
          <h2 className="text-creo-md font-semibold">À savoir avant de commencer</h2>
          <ul className="list-inside list-disc space-y-2 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
            <li>
              <strong className="font-medium text-foreground">Encaissement clients</strong> : l’argent de tes acheteurs
              va sur <strong className="font-medium text-foreground">ton</strong> Stripe / PayPal (comptes que tu lies
              ici).
            </li>
            <li>
              <strong className="font-medium text-foreground">Abonnement CRÉO</strong> : ce que tu paies pour utiliser
              la plateforme se gère à part (
              <Link href="/dashboard/settings?section=subscription-creo" className="text-creo-purple underline">
                Abonnement CRÉO
              </Link>
              ).
            </li>
          </ul>
        </Card>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <StripeWordmark />
            <span className="text-creo-sm font-medium text-foreground">Stripe (recommandé)</span>
          </div>

          <ol className="space-y-3">
            <li className={stepClass}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#635BFF] text-sm font-bold text-white">
                1
              </span>
              <div>
                <p className="font-medium text-foreground">Ouvre les passerelles</p>
                <p className="mt-1 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
                  Va dans{" "}
                  <Link
                    href="/dashboard/settings?section=payment-gateways"
                    className="text-creo-purple underline underline-offset-2"
                  >
                    Paramètres → Passerelles de paiement
                  </Link>
                  .
                </p>
              </div>
            </li>
            <li className={stepClass}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#635BFF] text-sm font-bold text-white">
                2
              </span>
              <div>
                <p className="font-medium text-foreground">Choisis comment lier ton compte</p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
                  <li>
                    <strong className="text-foreground">Connecter avec Stripe Express</strong> : idéal si tu n’as pas
                    encore de compte ou tu préfères l’assistant Stripe.
                  </li>
                  <li>
                    <strong className="text-foreground">J’ai déjà un compte Stripe</strong> : tu te connectes avec ton
                    compte Standard existant (OAuth). Nécessite la config OAuth côté plateforme (
                    <code className="text-creo-xs">NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID</code>).
                  </li>
                </ul>
              </div>
            </li>
            <li className={stepClass}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#635BFF] text-sm font-bold text-white">
                3
              </span>
              <div>
                <p className="font-medium text-foreground">Suis Stripe à l’écran</p>
                <p className="mt-1 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
                  Adresse, type d’entreprise, identité : Stripe collecte ces infos pour activer les paiements et limiter
                  la fraude. À la fin, autorise l’accès au compte si Stripe le demande.
                </p>
              </div>
            </li>
            <li className={stepClass}>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#635BFF] text-sm font-bold text-white">
                4
              </span>
              <div>
                <p className="font-medium text-foreground">Reviens sur CRÉO</p>
                <p className="mt-1 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
                  Tu es renvoyé vers les passerelles. Le badge passe à « encaissement OK » quand Stripe a validé le
                  compte (quelques secondes via webhook).
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <PayPalWordmark />
            <span className="text-creo-sm font-medium text-foreground">PayPal (préparation)</span>
          </div>

          <Card className="p-6 text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
            <p>
              Indique l’e-mail ou l’identifiant PayPal qui recevra les paiements. L’intégration complète des paiements
              PayPal sur les pages sera activée dans une prochaine version ; en attendant, tu peux déjà enregistrer ton
              compte pour préparer la suite.
            </p>
          </Card>
        </section>
      </div>
    </>
  );
}
