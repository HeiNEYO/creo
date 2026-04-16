"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

function SvgShell({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-4 shrink-0", className)}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/** Ligne verticale à gauche + pilule horizontale */
export function IconAlignTextLeft({ className }: { className?: string }) {
  return (
    <SvgShell className={className}>
      <line x1="2.5" y1="3.5" x2="2.5" y2="12.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <rect x="4.25" y="6.875" width="9.5" height="2.25" rx="1.125" fill="currentColor" />
    </SvgShell>
  );
}

/** Ligne verticale au centre traversant la pilule */
export function IconAlignTextCenter({ className }: { className?: string }) {
  return (
    <SvgShell className={className}>
      <rect x="3.5" y="6.875" width="9" height="2.25" rx="1.125" fill="currentColor" />
      <line x1="8" y1="3.5" x2="8" y2="12.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </SvgShell>
  );
}

/** Pilule horizontale + ligne verticale à droite */
export function IconAlignTextRight({ className }: { className?: string }) {
  return (
    <SvgShell className={className}>
      <rect x="2.25" y="6.875" width="10.25" height="2.25" rx="1.125" fill="currentColor" />
      <line x1="13.5" y1="3.5" x2="13.5" y2="12.5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </SvgShell>
  );
}

/** Justifier : barres horizontales type paragraphe */
export function IconAlignTextJustify({ className }: { className?: string }) {
  return (
    <SvgShell className={className}>
      <rect x="2" y="4" width="12" height="1.75" rx="0.875" fill="currentColor" />
      <rect x="2" y="6.375" width="12" height="1.75" rx="0.875" fill="currentColor" />
      <rect x="2" y="8.75" width="12" height="1.75" rx="0.875" fill="currentColor" />
      <rect x="2" y="11.125" width="7" height="1.75" rx="0.875" fill="currentColor" />
    </SvgShell>
  );
}

/** Ligne horizontale en haut + pilule verticale en dessous */
export function IconAlignColumnTop({ className }: { className?: string }) {
  return (
    <SvgShell className={className}>
      <line x1="3" y1="2.75" x2="13" y2="2.75" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
      <rect x="6.875" y="4.25" width="2.25" height="9" rx="1.125" fill="currentColor" />
    </SvgShell>
  );
}

/** Ligne horizontale au milieu traversant la pilule */
export function IconAlignColumnCenter({ className }: { className?: string }) {
  return (
    <SvgShell className={className}>
      <rect x="6.875" y="3.5" width="2.25" height="9" rx="1.125" fill="currentColor" />
      <line x1="3" y1="8" x2="13" y2="8" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </SvgShell>
  );
}

/** Pilule verticale + ligne horizontale en bas */
export function IconAlignColumnBottom({ className }: { className?: string }) {
  return (
    <SvgShell className={className}>
      <rect x="6.875" y="2.5" width="2.25" height="9" rx="1.125" fill="currentColor" />
      <line x1="3" y1="13.25" x2="13" y2="13.25" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </SvgShell>
  );
}
