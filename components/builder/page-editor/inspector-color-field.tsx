"use client";

import { forwardRef, type ChangeEvent, type ComponentPropsWithoutRef } from "react";

import { cn } from "@/lib/utils";
import { InspectorFillPair } from "@/components/builder/page-editor/inspector-fill-field";

const swatchShell =
  "relative h-8 w-9 shrink-0 overflow-hidden rounded-md border border-zinc-200 bg-zinc-100 shadow-none transition-[box-shadow,ring] hover:border-zinc-300 focus-within:border-creo-blue/50 focus-within:ring-1 focus-within:ring-creo-blue/35 dark:border-white/12 dark:bg-[#1a1a1a] dark:hover:border-white/18";

const swatchInput =
  "absolute inset-0 h-[200%] w-[200%] max-h-none max-w-none -translate-x-1/4 -translate-y-1/4 cursor-pointer border-0 bg-transparent p-0 [color-scheme:light] dark:[color-scheme:dark]";

function toHex6(v: string, fallback: string): string {
  const t = v?.trim() ?? "";
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  return fallback;
}

/** @deprecated Préférer InspectorFillPair ; conservé pour champs bouton (plusieurs pastilles). */
export const InspectorFormColorField = forwardRef<
  HTMLButtonElement,
  Omit<ComponentPropsWithoutRef<"input">, "type"> & { value?: string; name?: string }
>(function InspectorFormColorField({ value, onChange, onBlur, name }, ref) {
  return (
    <InspectorFillPair
      ref={ref}
      value={String(value ?? "").trim() === "" ? "transparent" : String(value ?? "")}
      onChange={(v) => {
        const ev = { target: { value: v, name: name ?? "" } } as ChangeEvent<HTMLInputElement>;
        (onChange as ((e: ChangeEvent<HTMLInputElement>) => void) | undefined)?.(ev);
      }}
      onBlur={onBlur}
      fallbackHex="#ffffff"
      title="Couleur"
    />
  );
});

type SwatchProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "onChange"> & {
  value: string;
  onChange: (hex: string) => void;
  fallbackHex?: string;
};

/** Nuancier seul (lignes avec plusieurs couleurs). */
export function InspectorColorSwatch({ value, onChange, fallbackHex = "#000000", className, ...props }: SwatchProps) {
  const hex = toHex6(value, fallbackHex);
  return (
    <div className={cn(swatchShell, className)}>
      <input
        type="color"
        className={swatchInput}
        value={hex}
        onChange={(e) => onChange(e.target.value)}
        {...props}
      />
    </div>
  );
}

type LegacyPairProps = {
  colorValue: string;
  onColorChange: (hex: string) => void;
  textValue: string;
  onTextChange: (v: string) => void;
  textPlaceholder?: string;
  fallbackHex?: string;
  textClassName?: string;
};

/** Rangée type « Fill » : aperçu + HEX + panneau (uni, dégradés, image, opacité). */
export function InspectorColorPair({
  textValue,
  onTextChange,
  colorValue,
  textPlaceholder,
  fallbackHex = "#000000",
}: LegacyPairProps) {
  const display =
    textValue === "" && textPlaceholder === "transparent"
      ? "transparent"
      : (textValue || colorValue || "").trim() || "transparent";

  return (
    <InspectorFillPair
      value={display}
      onChange={(v) => {
        if (!v.trim() && textPlaceholder === "transparent") {
          onTextChange("");
        } else {
          onTextChange(v);
        }
      }}
      fallbackHex={fallbackHex}
      title="Remplissage"
    />
  );
}
