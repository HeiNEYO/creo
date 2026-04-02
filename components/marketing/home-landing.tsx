"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export function HomeLanding() {
  return (
    <div className="bg-creo-white text-creo-black">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <span className="text-lg font-semibold text-creo-purple">CRÉO</span>
        <div className="flex items-center gap-3">
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
          <span className="inline-flex items-center gap-2 rounded-full border border-creo-gray-200 bg-creo-gray-50 px-3 py-1 text-creo-xs font-medium text-creo-gray-700">
            <Sparkles className="size-3.5 text-creo-purple" />
            Nouveau — Tunnels adaptatifs avec IA
          </span>
          <h1 className="mt-8 max-w-3xl text-balance text-4xl font-semibold leading-tight tracking-tight md:text-5xl md:leading-tight">
            La plateforme qui vend et enseigne à votre place
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-creo-gray-600 md:text-xl">
            Crée, vends et gère tes formations en ligne. Tout ce dont tu as
            besoin, enfin réuni.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "gap-2 px-6")}
            >
              Commencer gratuitement
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/login"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              Voir la démo
            </Link>
          </div>
          <p className="mt-8 text-creo-sm text-creo-gray-500">
            Rejoint par 2 400+ infopreneurs
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl rounded-creo-xl border border-creo-gray-200 bg-creo-gray-50 p-2 shadow-creo-card">
          <div className="aspect-[16/9] rounded-lg bg-gradient-to-br from-creo-purple-pale to-white" />
          <p className="py-3 text-center text-creo-xs text-creo-gray-400">
            Aperçu du cockpit — données fictives
          </p>
        </div>
      </section>

      <section className="border-t border-creo-gray-100 bg-creo-gray-50 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-creo-2xl font-semibold">
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
                className="rounded-creo-lg border border-creo-gray-200 bg-creo-white p-6"
              >
                <p className="text-lg text-creo-danger">✕</p>
                <h3 className="mt-2 text-creo-md font-semibold">{t}</h3>
                <p className="mt-2 text-creo-sm text-creo-gray-500">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 text-center">
          <h2 className="text-creo-2xl font-semibold">
            Avec CRÉO, tout est connecté
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-creo-base text-creo-gray-500">
            Pages, formations, emails, analytics — un seul abonnement, une seule
            vérité sur ton business.
          </p>
        </div>
      </section>

      <section className="border-t border-creo-gray-100 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="text-center text-creo-2xl font-semibold">Tarifs</h2>
          <p className="mt-2 text-center text-creo-sm text-creo-gray-500">
            Mensuel · Annuel -20% (à configurer)
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              ["Starter", "19 €", "Pour tester"],
              ["Creator", "49 €", "Le plus populaire"],
              ["Pro", "99 €", "Équipes"],
            ].map(([name, price, badge], i) => (
              <div
                key={name}
                className={cn(
                  "rounded-creo-xl border border-creo-gray-200 bg-creo-white p-6",
                  i === 1
                    ? "border-creo-purple shadow-creo"
                    : "border-creo-gray-200"
                )}
              >
                {i === 1 ? (
                  <span className="text-creo-xs font-medium text-creo-purple">
                    {badge}
                  </span>
                ) : (
                  <span className="text-creo-xs text-creo-gray-400">{badge}</span>
                )}
                <h3 className="mt-2 text-creo-lg font-semibold">{name}</h3>
                <p className="mt-4 text-3xl font-semibold">{price}</p>
                <p className="text-creo-sm text-creo-gray-500">/ mois</p>
                <Link
                  href="/register"
                  className={buttonVariants({
                    variant: i === 1 ? "default" : "outline",
                    className: "mt-6 w-full",
                  })}
                >
                  Choisir
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-creo-gray-200 py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <span className="font-semibold text-creo-purple">CRÉO</span>
          <div className="flex gap-6 text-creo-sm text-creo-gray-500">
            <Link href="/login" className="hover:text-creo-purple">
              Connexion
            </Link>
            <span>Mentions légales</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
