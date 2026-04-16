"use client";

import { Sun } from "lucide-react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function ThemeAppearanceSettings() {
  return (
    <div className="space-y-4">
      <div>
        <Label className="text-creo-base">Thème de l’interface</Label>
        <p className="mt-1 text-creo-sm text-creo-gray-500">
          S’applique au dashboard, au builder et aux pages connectées. La page
          d’accueil marketing suit aussi ce réglage.
        </p>
      </div>
      <div
        className={cn(
          "flex flex-col items-center gap-2 rounded-creo-lg border border-creo-purple bg-creo-purple-pale p-4 text-center sm:flex-row sm:text-left",
        )}
        role="status"
        aria-label="Mode clair actif"
      >
        <Sun className="size-5 shrink-0 text-creo-purple" aria-hidden />
        <div>
          <p className="text-creo-sm font-medium text-creo-black">Mode clair</p>
          <p className="mt-0.5 text-creo-xs text-creo-gray-500">
            Le mode sombre est temporairement indisponible ; il sera proposé à
            nouveau dans une prochaine version.
          </p>
        </div>
      </div>
    </div>
  );
}
