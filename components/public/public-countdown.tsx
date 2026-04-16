"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

function splitRemaining(ms: number) {
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return { d, h, m, s };
}

function UnitCard({
  value,
  label,
  muted,
}: {
  value: string;
  label: string;
  muted?: boolean;
}) {
  return (
    <div
      className={cn(
        "min-w-[4.25rem] rounded-2xl border px-3 py-3 text-center shadow-sm backdrop-blur-sm transition-colors sm:min-w-[4.75rem] sm:px-4 sm:py-3.5",
        muted
          ? "border-zinc-200/50 bg-white/40 dark:border-zinc-700/40 dark:bg-zinc-900/30"
          : "border-zinc-200/70 bg-white/95 dark:border-zinc-600/60 dark:bg-zinc-900/70"
      )}
    >
      <div
        className={cn(
          "text-2xl font-semibold tabular-nums sm:text-3xl",
          muted ? "text-zinc-300 dark:text-zinc-600" : "text-zinc-900 dark:text-zinc-50"
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "mt-1.5 text-[9px] font-semibold uppercase tracking-[0.12em]",
          muted ? "text-zinc-400 dark:text-zinc-500" : "text-zinc-500 dark:text-zinc-400"
        )}
      >
        {label}
      </div>
      {!muted ? (
        <div
          className="mx-auto mt-2 h-0.5 w-6 rounded-full bg-[color:var(--creo-blue)] opacity-90"
          aria-hidden
        />
      ) : null}
    </div>
  );
}

export function PublicCountdown({ endAt }: { endAt: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const endMs = new Date(endAt).getTime();
  const valid = Boolean(endAt?.trim()) && Number.isFinite(endMs);

  if (!valid) {
    return (
      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Compte à rebours — définis une date de fin dans l’éditeur.
      </p>
    );
  }

  const endLabel = new Date(endAt).toLocaleString("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  });

  const units = (opts: { d: number; h: number; m: number; s: number }) =>
    [
      { key: "d", value: String(opts.d), label: opts.d === 1 ? "jour" : "jours" },
      { key: "h", value: String(opts.h).padStart(2, "0"), label: "heures" },
      { key: "m", value: String(opts.m).padStart(2, "0"), label: "minutes" },
      { key: "s", value: String(opts.s).padStart(2, "0"), label: "secondes" },
    ] as const;

  if (now === null) {
    return (
      <div className="space-y-4" aria-busy="true">
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {units({ d: 0, h: 0, m: 0, s: 0 }).map((u) => (
            <UnitCard key={u.key} value="—" label={u.label} muted />
          ))}
        </div>
      </div>
    );
  }

  const diff = endMs - now;
  if (diff <= 0) {
    return (
      <div className="space-y-2 text-center">
        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Temps écoulé</p>
        <p className="text-creo-xs text-zinc-500 dark:text-zinc-400">La date du {endLabel} est passée.</p>
      </div>
    );
  }

  const { d, h, m, s } = splitRemaining(diff);

  return (
    <div className="space-y-4">
      <div
        className="flex flex-wrap justify-center gap-2.5 sm:gap-3"
        role="timer"
        aria-label={`Temps restant avant le ${endLabel}`}
      >
        {units({ d, h, m, s }).map((u) => (
          <UnitCard key={u.key} value={u.value} label={u.label} />
        ))}
      </div>
      <p className="text-center text-creo-xs text-zinc-500 dark:text-zinc-400">
        Fin prévue : <time dateTime={endAt}>{endLabel}</time>
      </p>
    </div>
  );
}
