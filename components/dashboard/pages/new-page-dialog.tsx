"use client";

import { LayoutTemplate, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import { createPageServer } from "@/lib/pages/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const types = [
  { id: "sales", label: "Page de vente", icon: LayoutTemplate },
  { id: "landing", label: "Landing page", icon: LayoutTemplate },
  { id: "custom", label: "Page libre", icon: Sparkles },
];

type NewPageDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function NewPageDialog({ open, onClose }: NewPageDialogProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<string | null>("sales");
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
        className="relative z-10 w-full max-w-lg rounded-creo-xl bg-creo-white p-6 shadow-creo-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-page-title"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="new-page-title" className="text-creo-lg font-semibold">
            Créer une nouvelle page
          </h2>
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
          <p className="text-creo-sm font-medium text-creo-gray-700">Type</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {types.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                disabled={pending}
                onClick={() => setSelected(id)}
                className={`rounded-creo-lg border p-3 text-left transition-colors ${
                  selected === id
                    ? "border-creo-purple bg-creo-purple-pale"
                    : "border-creo-gray-200 hover:border-creo-gray-300"
                }`}
              >
                <Icon className="size-4 text-creo-purple" />
                <p className="mt-2 text-creo-sm font-medium">{label}</p>
              </button>
            ))}
          </div>
          {error ? (
            <p className="text-creo-sm text-red-600" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <div className="mt-8 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
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
