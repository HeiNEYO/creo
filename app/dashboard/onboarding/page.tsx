"use client";

import { Check, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const steps = ["Profil", "Premier produit", "C’est parti !"];

const activities = [
  "Formation en ligne",
  "Coaching",
  "Agence",
  "Freelance",
  "E-commerce",
  "Autre",
];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-10 flex items-center justify-between gap-2">
        {steps.map((label, i) => (
          <div key={label} className="flex flex-1 items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-creo-xs font-semibold",
                i <= step
                  ? "bg-creo-purple text-white"
                  : "bg-creo-gray-100 text-creo-gray-400"
              )}
            >
              {i < step ? <Check className="size-4" /> : i + 1}
            </div>
            <span
              className={cn(
                "hidden text-creo-sm font-medium sm:inline",
                i === step ? "text-creo-purple" : "text-creo-gray-400"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 ? (
              <ChevronRight className="size-4 shrink-0 text-creo-gray-300" />
            ) : null}
          </div>
        ))}
      </div>

      {step === 0 && (
        <Card className="space-y-6 p-6">
          <div>
            <h1 className="text-creo-xl font-semibold">Parle-nous de toi</h1>
            <p className="mt-1 text-creo-sm text-creo-gray-500">
              Quelle est ton activité principale ?
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {activities.map((a) => (
              <button
                key={a}
                type="button"
                className="rounded-creo-lg border border-creo-gray-200 px-4 py-3 text-left text-creo-sm font-medium hover:border-creo-purple/40 hover:bg-creo-purple-pale/30"
              >
                {a}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <Label>Nom du business</Label>
            <Input placeholder="Studio Lumière" />
          </div>
          <div className="space-y-2">
            <Label>Site web (optionnel)</Label>
            <Input placeholder="https://…" />
          </div>
          <Button type="button" onClick={() => setStep(1)}>
            Continuer
          </Button>
        </Card>
      )}

      {step === 1 && (
        <Card className="space-y-6 p-6">
          <h1 className="text-creo-xl font-semibold">Ton premier produit</h1>
          <div className="space-y-3">
            <Link
              href="/dashboard/courses/new"
              className="block w-full rounded-creo-lg border border-creo-gray-200 p-4 text-left transition-colors hover:border-creo-purple/40 hover:bg-creo-purple-pale/20"
            >
              <p className="font-medium text-creo-black">Créer ma première formation</p>
              <p className="mt-1 text-creo-sm text-creo-gray-500">
                Ouvre le formulaire dans Formations pour créer un brouillon et
                l’éditer.
              </p>
            </Link>
            <Link
              href="/dashboard/pages"
              className="block w-full rounded-creo-lg border border-creo-gray-200 p-4 text-left transition-colors hover:border-creo-purple/40 hover:bg-creo-purple-pale/20"
            >
              <p className="font-medium text-creo-black">
                Créer ma première page de vente
              </p>
              <p className="mt-1 text-creo-sm text-creo-gray-500">
                Va dans Pages puis « Nouvelle page » pour ouvrir le builder.
              </p>
            </Link>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full text-creo-sm text-creo-gray-500 hover:text-creo-purple"
            >
              Explorer d’abord →
            </button>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setStep(0)}>
              Retour
            </Button>
            <Button type="button" onClick={() => setStep(2)}>
              Continuer
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="space-y-6 p-6 text-center">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-creo-success-pale text-creo-success">
            <Check className="size-8" strokeWidth={2.5} />
          </div>
          <h1 className="text-creo-xl font-semibold">Tu es prêt !</h1>
          <p className="text-creo-sm text-creo-gray-500">
            Ton workspace est configuré. Accède au cockpit pour la suite.
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
              Accéder au dashboard
            </Link>
            <Button type="button" variant="outline">
              Voir une démo vidéo
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
