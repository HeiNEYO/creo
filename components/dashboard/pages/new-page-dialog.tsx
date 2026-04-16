"use client";

import {
  BookOpen,
  BookText,
  GraduationCap,
  LayoutTemplate,
  PartyPopper,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Video,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { createPageServer } from "@/lib/pages/actions";
import { PAGE_TYPE_CHOICES } from "@/lib/pages/page-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ICONS: Record<string, typeof LayoutTemplate> = {
  landing: LayoutTemplate,
  sales: TrendingUp,
  checkout: ShoppingCart,
  upsell: Sparkles,
  thankyou: PartyPopper,
  webinar: Video,
  blog: BookText,
  membership: GraduationCap,
  custom: BookOpen,
};

type NewPageDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function NewPageDialog({ open, onClose }: NewPageDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | null>(PAGE_TYPE_CHOICES[0]?.createKey ?? "custom");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) {
      setError("Choisis un type de page.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await createPageServer({
        title,
        typeKey: selected,
      });
      if (res.ok) {
        setTitle("");
        onClose();
        router.push(`/builder/${res.id}`);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label="Fermer"
        onClick={onClose}
      />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-creo-xl bg-creo-white p-6 shadow-creo-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-page-title"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="new-page-title" className="text-creo-lg font-semibold">
              Nouvelle page
            </h2>
            <p className="mt-1 text-creo-sm text-creo-gray-500">
              Le type pilote les règles et le panneau de réglages dans l’éditeur. Tu pars d’un canvas vide ; les
              gabarits thématiques arriveront plus tard.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-creo-md p-1 text-creo-gray-500 hover:bg-creo-gray-100"
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="page-title">Titre de la page</Label>
            <Input
              id="page-title"
              name="title"
              placeholder="Ma super page"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={pending}
            />
          </div>
          <p className="text-creo-sm font-medium text-creo-gray-700">Type de page</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PAGE_TYPE_CHOICES.map(({ createKey, label, description }) => {
              const Icon = ICONS[createKey] ?? LayoutTemplate;
              const active = selected === createKey;
              return (
                <button
                  key={createKey}
                  type="button"
                  disabled={pending}
                  onClick={() => setSelected(createKey)}
                  className={cn(
                    "rounded-creo-lg border p-4 text-left transition-colors",
                    active
                      ? "border-creo-purple bg-creo-purple-pale ring-2 ring-creo-purple/20"
                      : "border-creo-gray-200 hover:border-creo-gray-300"
                  )}
                >
                  <Icon className="size-5 text-creo-purple" aria-hidden />
                  <p className="mt-2 text-creo-sm font-semibold text-creo-gray-900">{label}</p>
                  <p className="mt-1 text-creo-xs leading-snug text-creo-gray-500">{description}</p>
                </button>
              );
            })}
          </div>
          {error ? (
            <p className="text-creo-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="mt-8 flex flex-wrap justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Annuler
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? "Création…" : "Créer et ouvrir l’éditeur"}
          </Button>
        </div>
      </form>
    </div>
  );
}
