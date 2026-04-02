"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const options = [
  { id: "light" as const, label: "Clair", icon: Sun },
  { id: "dark" as const, label: "Sombre", icon: Moon },
  { id: "system" as const, label: "Système", icon: Monitor },
];

export function ThemeAppearanceSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-creo-base">Thème de l’interface</Label>
        <p className="mt-1 text-creo-sm text-creo-gray-500">
          S’applique au dashboard, au builder et aux pages connectées. La page
          d’accueil marketing suit aussi ce réglage.
        </p>
      </div>
      {!mounted ? (
        <div className="grid gap-2 sm:grid-cols-3">
          {options.map((o) => (
            <div
              key={o.id}
              className="h-[72px] animate-pulse rounded-creo-lg bg-creo-gray-100 dark:bg-muted"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Thème">
          {options.map(({ id, label, icon: Icon }) => {
            const active = theme === id;
            return (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setTheme(id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-creo-lg border p-4 text-center transition-colors",
                  active
                    ? "border-creo-purple bg-creo-purple-pale text-creo-purple dark:border-primary dark:bg-accent dark:text-accent-foreground"
                    : "border-creo-gray-200 hover:border-creo-gray-300 dark:border-border dark:hover:border-muted-foreground/30"
                )}
              >
                <Icon className="size-5 shrink-0 opacity-90" aria-hidden />
                <span className="text-creo-sm font-medium text-creo-black dark:text-foreground">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      )}
      {mounted && resolvedTheme ? (
        <p className="text-creo-xs text-creo-gray-400">
          Rendu actuel :{" "}
          {resolvedTheme === "dark" ? "mode sombre" : "mode clair"}
          {theme === "system" ? " (selon l’appareil)" : ""}
        </p>
      ) : null}
    </div>
  );
}
