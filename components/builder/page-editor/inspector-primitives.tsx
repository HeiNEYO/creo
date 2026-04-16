"use client";

import { useState } from "react";
import { Plus, X, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/** Séparateur discret entre groupes (style liste Réglages iOS). */
export const inspectorDivider = "border-0";

export type InspectorSectionIcon = LucideIcon;

/**
 * Section repliable — même vocabulaire visuel que la colonne Structure (clair / sombre via `dark:`).
 */
export function InspectorSection({
  title,
  icon: Icon,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon?: InspectorSectionIcon;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-200/90 pb-6 last:border-0 last:pb-0 dark:border-white/[0.07]">
      <button
        type="button"
        className="group flex w-full items-start gap-2.5 rounded-md py-1.5 text-left transition-colors hover:bg-zinc-200/50 dark:hover:bg-white/[0.03]"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        {Icon ? (
          <Icon
            className="mt-0.5 size-[15px] shrink-0 text-zinc-500 dark:text-zinc-500"
            strokeWidth={2}
            aria-hidden
          />
        ) : null}
        <div className="min-w-0 flex-1 pt-0.5">
          <span className="block text-[13px] font-semibold leading-tight tracking-[-0.02em] text-zinc-900 dark:text-white">
            {title}
          </span>
        </div>
        <span className="mt-0.5 flex shrink-0 items-center" aria-hidden>
          {open ? (
            <X
              className="size-3.5 text-zinc-500 opacity-90 transition-opacity group-hover:opacity-100 dark:text-zinc-400"
              strokeWidth={2}
            />
          ) : (
            <Plus
              className="size-3.5 text-zinc-500 opacity-80 transition-opacity group-hover:opacity-100 dark:text-zinc-600"
              strokeWidth={2}
            />
          )}
        </span>
      </button>
      {open ? <div className="mt-4 space-y-0">{children}</div> : null}
    </div>
  );
}

export function InspectorRow({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-[minmax(5.25rem,40%)_1fr] items-start gap-x-4 gap-y-2 border-b border-zinc-200/80 py-4 first:pt-2 last:border-b-0 dark:border-white/[0.05]",
        className
      )}
    >
      <span className="pt-1.5 text-[12px] font-normal leading-snug tracking-[-0.01em] text-zinc-600 dark:text-zinc-500">
        {label}
      </span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

/** Champs texte / nombre — alignés sur le thème clair/sombre du builder. */
export function inspectorControlCls() {
  return cn(
    "h-8 w-full min-w-0 rounded-md border border-zinc-200 bg-white px-2.5 text-[12px] leading-snug tracking-[-0.01em] text-zinc-900 shadow-none",
    "placeholder:text-zinc-400",
    "dark:border-white/10 dark:bg-[#1a1a1a] dark:text-zinc-100 dark:placeholder:text-zinc-600",
    "transition-[border-color,box-shadow] duration-150",
    "focus-visible:border-creo-blue/55 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-creo-blue/35"
  );
}

export function inspectorSelectCls() {
  return cn(inspectorControlCls(), "cursor-pointer py-0 pr-8");
}

export function inspectorTextareaCls() {
  return cn(
    "min-h-[72px] w-full resize-y rounded-md border border-zinc-200 bg-white px-2.5 py-2 text-[12px] leading-relaxed tracking-[-0.01em] text-zinc-900 shadow-none",
    "placeholder:text-zinc-400",
    "dark:border-white/10 dark:bg-[#1a1a1a] dark:text-zinc-100 dark:placeholder:text-zinc-600",
    "transition-[border-color,box-shadow] duration-150",
    "focus-visible:border-creo-blue/55 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-creo-blue/35"
  );
}

/** Cases à cocher natives dans l’inspecteur. */
export function inspectorCheckboxCls() {
  return cn(
    "rounded border-zinc-300 bg-white text-creo-blue focus:ring-creo-blue/40",
    "dark:border-white/20 dark:bg-[#1a1a1a]"
  );
}
