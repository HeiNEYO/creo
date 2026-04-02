"use client";

import { LayoutTemplate, Sparkles } from "lucide-react";
import { useState } from "react";

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
  const [selected, setSelected] = useState<string | null>("sales");

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
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
            <Input id="page-title" placeholder="Ma super page" />
          </div>
          <p className="text-creo-sm font-medium text-creo-gray-700">Type</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {types.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
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
        </div>
        <div className="mt-8 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button type="button" onClick={onClose}>
            Créer et ouvrir l’éditeur
          </Button>
        </div>
      </div>
    </div>
  );
}
