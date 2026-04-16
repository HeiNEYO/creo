"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { CreoPricingBillingToggle, CreoPricingCards } from "@/components/pricing/creo-pricing-cards";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import type { PlatformSubscriptionInterval } from "@/lib/stripe/platform-subscription-prices";

export function HomeLanding() {
  const [billingInterval, setBillingInterval] = useState<PlatformSubscriptionInterval>("month");

  return (
    <div className="min-h-screen bg-white text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="text-lg font-medium text-violet-600 dark:text-violet-400">
          CRÉO
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/aides"
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "text-zinc-600 dark:text-zinc-400",
            )}
          >
            Aide
          </Link>
          <Link
            href="/login"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Connexion
          </Link>
          <Link href="/register" className={buttonVariants({ size: "sm" })}>
            Commencer
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 pb-20 pt-12 text-center md:pt-20">
        <div className="flex flex-col items-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-creo-xs font-medium text-zinc-700 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
            <Sparkles className="size-3.5 text-violet-600 dark:text-violet-400" />
            Bêta publique — le produit s’enrichit chaque semaine
          </span>
          <h1 className="mt-8 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl md:leading-tight">
            Pages, formations et paiements dans une seule app
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 md:text-xl">
            Conçu pour lancer une offre en ligne sérieusement : cockpit, pages publiques, Stripe pour
            l’abonnement plateforme et pour encaisser tes ventes.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6")}
            >
              Créer un compte
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Se connecter
            </Link>
          </div>
          <p className="mt-8 text-creo-sm text-zinc-500 dark:text-zinc-500">
            Pas de promesse de chiffre : on privilégie la clarté et la facturation propre en bêta.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl rounded-creo-xl border border-zinc-200 bg-zinc-50 p-2 shadow-sm dark:border-white/10 dark:bg-zinc-900/80">
          <div className="aspect-[16/9] rounded-lg bg-gradient-to-br from-violet-100 to-white dark:from-violet-950/50 dark:to-zinc-900" />
          <p className="py-3 text-center text-creo-xs text-zinc-400 dark:text-zinc-500">
            Aperçu du cockpit — données fictives
          </p>
        </div>
      </section>

      <section className="border-t border-zinc-100 bg-zinc-50 py-20 dark:border-white/10 dark:bg-zinc-900/50">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-creo-2xl font-semibold text-zinc-900 dark:text-white">
            Vous en avez assez de tout assembler ?
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              ["5 outils à connecter", "Zapier partout, zéro vision globale."],
              ["Données éparpillées", "Analytics Meta ≠ revenus réels."],
              ["Élèves qui n’avancent pas", "Pas de suivi de complétion clair."],
            ].map(([t, d]) => (
              <div
                key={t}
                className="rounded-creo-lg border border-zinc-200 bg-white p-6 dark:border-white/10 dark:bg-zinc-950/80"
              >
                <p className="text-lg text-red-600 dark:text-red-400">✕</p>
                <h3 className="mt-2 text-creo-md font-semibold">{t}</h3>
                <p className="mt-2 text-creo-sm text-zinc-500 dark:text-zinc-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-creo-2xl font-semibold text-zinc-900 dark:text-white">
            Avec CRÉO, tout est connecté
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-creo-base text-zinc-500 dark:text-zinc-400">
            Pages, formations, emails, analytics — un seul abonnement, une seule
            vérité sur ton business.
          </p>
        </div>
      </section>

      <section className="relative border-t border-zinc-100 py-20 dark:border-white/10">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-zinc-50 via-white to-zinc-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-black" />
        <div className="relative mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
              Tarifs plateforme
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-4xl">
              Des offres claires, sans surprise
            </h2>
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">
              Montants indicatifs en € TTC — la souscription se fait dans l’app (Stripe). Bascule mensuel / annuel pour
              voir l’économie.
            </p>
          </div>

          <div className="mt-10 flex justify-center">
            <CreoPricingBillingToggle
              billingInterval={billingInterval}
              onBillingIntervalChange={setBillingInterval}
            />
          </div>

          <div className="mt-12">
            <CreoPricingCards variant="landing" billingInterval={billingInterval} />
          </div>
        </div>
      </section>

      <footer className="border-t border-zinc-200 py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span className="font-medium text-violet-600 dark:text-violet-400">CRÉO</span>
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-creo-sm text-zinc-500 dark:text-zinc-400">
            <Link href="/aides" className="hover:text-violet-600 dark:hover:text-violet-400">
              Aide
            </Link>
            <Link href="/login" className="hover:text-violet-600 dark:hover:text-violet-400">
              Connexion
            </Link>
            <Link href="/legal/conditions" className="hover:text-violet-600 dark:hover:text-violet-400">
              CGU
            </Link>
            <Link href="/legal/confidentialite" className="hover:text-violet-600 dark:hover:text-violet-400">
              Confidentialité
            </Link>
            <Link href="/legal/mentions" className="hover:text-violet-600 dark:hover:text-violet-400">
              Mentions légales
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
