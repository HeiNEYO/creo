"use client";

import { Check } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  PLATFORM_SUBSCRIPTION_EUR_MONTHLY,
  platformSubscriptionAnnualEurMajor,
  type PlatformSubscriptionInterval,
  type PlatformSubscriptionPlanKey,
} from "@/lib/stripe/platform-subscription-prices";

const PLAN_CONFIG: Record<
  PlatformSubscriptionPlanKey,
  {
    badge: string;
    badgeStyle: "outline" | "popular" | "solid";
    title: string;
    subtitle: string;
    /** Points courts pour les cartes (landing + résumé app) */
    features: string[];
    highlight?: boolean;
  }
> = {
  creator: {
    badge: "Essentiel",
    badgeStyle: "outline",
    title: "Creator",
    subtitle: "Lance et centralise ton activité solo.",
    features: [
      "Éditeur & pages publiques",
      "Stripe Connect",
      "CRM, e-mail & campagnes",
      "Formations & parcours",
    ],
  },
  pro: {
    badge: "Le plus populaire",
    badgeStyle: "popular",
    title: "Pro",
    subtitle: "Le même moteur, pensé pour accélérer.",
    features: [
      "Tout Creator inclus",
      "Support prioritaire (e-mail)",
      "Meilleur équilibre prix / usage",
      "Idéal en phase de croissance",
    ],
    highlight: true,
  },
  agency: {
    badge: "Scale",
    badgeStyle: "solid",
    title: "Agency",
    subtitle: "Volume, équipes et accompagnement renforcé.",
    features: [
      "Tout Pro inclus",
      "Onboarding & accompagnement",
      "Pensé pour les charges élevées",
      "Une base pour structurer l’agence",
    ],
  },
};

const ORDER: PlatformSubscriptionPlanKey[] = ["creator", "pro", "agency"];

function formatEur(n: number, fraction: boolean) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: fraction ? 0 : 0,
    maximumFractionDigits: fraction ? 2 : 1,
  }).format(n);
}

function PlanBadge({
  label,
  style,
}: {
  label: string;
  style: "outline" | "popular" | "solid";
}) {
  return (
    <span
      className={cn(
        "inline-flex w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]",
        style === "outline" &&
          "border border-zinc-300 bg-transparent text-zinc-600 dark:border-white/25 dark:text-zinc-300",
        style === "popular" &&
          "bg-creo-blue text-white dark:bg-creo-blue dark:text-white",
        style === "solid" &&
          "border border-zinc-200 bg-zinc-100 text-zinc-800 dark:border-white/15 dark:bg-white/10 dark:text-zinc-100",
      )}
    >
      {label}
    </span>
  );
}

function FeatureRow({ text }: { text: string }) {
  return (
    <li className="flex gap-3 text-[13px] leading-snug text-zinc-600 dark:text-zinc-400">
      <span
        className={cn(
          "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full",
          "bg-creo-info-pale text-creo-blue dark:bg-[rgba(0,51,255,0.18)] dark:text-creo-blue-readable",
        )}
      >
        <Check className="size-3" strokeWidth={2.5} aria-hidden />
      </span>
      <span>{text}</span>
    </li>
  );
}

export type CreoPricingCardsProps = {
  variant: "landing" | "app";
  billingInterval: PlatformSubscriptionInterval;
  /** App uniquement */
  onSelectPlan?: (plan: PlatformSubscriptionPlanKey) => void;
  pending?: boolean;
  checkoutDisabled?: boolean;
  activePlanLabel?: string;
  /** App : carte plus compacte */
  density?: "comfortable" | "compact";
};

function planKeyFromLabel(label: string | undefined): PlatformSubscriptionPlanKey | null {
  if (!label) return null;
  const t = label.trim().toLowerCase();
  if (t === "creator" || t === "créateur") return "creator";
  if (t === "pro") return "pro";
  if (t === "agency") return "agency";
  return null;
}

export function CreoPricingCards({
  variant,
  billingInterval,
  onSelectPlan,
  pending,
  checkoutDisabled,
  activePlanLabel,
  density = "comfortable",
}: CreoPricingCardsProps) {
  const activeKey = planKeyFromLabel(activePlanLabel);
  const compact = density === "compact" || variant === "app";

  function savingsLine(key: PlatformSubscriptionPlanKey): string | null {
    if (billingInterval !== "year") return null;
    const m = PLATFORM_SUBSCRIPTION_EUR_MONTHLY[key];
    const y = platformSubscriptionAnnualEurMajor(key);
    const save = m * 12 - y;
    if (save <= 0) return null;
    const pct = Math.round((save / (m * 12)) * 100);
    return `Économise ${formatEur(save, true)} / an (~${pct} %)`;
  }

  return (
    <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 lg:gap-8">
      {ORDER.map((key) => {
        const cfg = PLAN_CONFIG[key];
        const isHighlight = cfg.highlight === true;
        const isCurrent = activeKey === key;

        return (
          <div
            key={key}
            className={cn(
              "relative flex min-h-full flex-col overflow-hidden rounded-[1.75rem] border p-6 shadow-sm",
              compact ? "md:p-5" : "p-7 md:p-8",
              isHighlight
                ? cn(
                    "border-creo-blue/35 bg-gradient-to-br from-white via-creo-info-pale/80 to-white shadow-sm",
                    "dark:border-white/18 dark:bg-zinc-900 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950",
                  )
                : cn(
                    "border-zinc-200/90 bg-white dark:border-white/10 dark:bg-zinc-900/95",
                  ),
            )}
          >
            {isHighlight ? (
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]" aria-hidden>
                {/* Lueur intérieure (dégradé bleu CRÉO), contenue dans la carte */}
                <div className="absolute -right-12 -top-12 size-[min(100%,17rem)] rounded-full bg-gradient-to-br from-[#0033ff]/22 via-[#6688ff]/12 to-transparent blur-3xl dark:from-[#0033ff]/28 dark:via-[#93a8ff]/10" />
                <div className="absolute -bottom-14 -left-10 size-[min(100%,14rem)] rounded-full bg-gradient-to-tr from-[#0033ff]/12 via-transparent to-transparent blur-2xl dark:from-[#0033ff]/18" />
              </div>
            ) : null}
            <div
              className={cn(
                "relative z-10 flex flex-1 flex-col",
                compact ? "gap-4" : "gap-5",
              )}
            >
              <div className="space-y-3">
                <PlanBadge label={cfg.badge} style={cfg.badgeStyle} />
                <div>
                  <h3 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
                    {cfg.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
                    {cfg.subtitle}
                  </p>
                </div>
              </div>

              <div className="h-px w-full bg-zinc-200/80 dark:bg-white/10" />

              <ul className={cn("flex flex-col gap-3", compact && "gap-2.5")}>
                {cfg.features.map((f) => (
                  <FeatureRow key={f} text={f} />
                ))}
              </ul>

              <div className="mt-auto flex flex-col gap-4 pt-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                  <div>
                    <p className="text-3xl font-semibold tabular-nums tracking-tight text-zinc-900 dark:text-white">
                      {billingInterval === "month"
                        ? formatEur(PLATFORM_SUBSCRIPTION_EUR_MONTHLY[key], true)
                        : formatEur(platformSubscriptionAnnualEurMajor(key), false)}
                      <span className="text-lg font-medium text-zinc-500 dark:text-zinc-400">
                        {billingInterval === "month" ? " / mois" : " / an"}
                      </span>
                    </p>
                    {savingsLine(key) ? (
                      <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-400/90">{savingsLine(key)}</p>
                    ) : (
                      <p className="mt-1 text-xs text-transparent">.</p>
                    )}
                  </div>
                </div>

                {variant === "landing" ? (
                  <Link
                    href="/register"
                    className={cn(
                      "inline-flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                      isHighlight
                        ? "bg-creo-blue text-white hover:bg-creo-blue-deep dark:bg-creo-blue dark:hover:bg-creo-blue-deep"
                        : "border border-zinc-300 bg-gradient-to-b from-zinc-50 to-zinc-100/90 text-zinc-900 hover:border-zinc-400 dark:border-white/15 dark:from-zinc-800 dark:to-zinc-900 dark:text-white dark:hover:border-white/25",
                    )}
                  >
                    {isHighlight ? "Commencer avec Pro" : `Choisir ${cfg.title}`}
                  </Link>
                ) : (
                  <>
                    {isCurrent ? (
                      <span
                        className={cn(
                          "inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-100 py-3 text-sm font-semibold text-zinc-600",
                          "dark:border-white/15 dark:bg-white/5 dark:text-zinc-300",
                        )}
                      >
                        Plan actuel
                      </span>
                    ) : (
                      <Button
                        type="button"
                        size="lg"
                        className={cn(
                          "w-full rounded-xl font-semibold",
                          isHighlight &&
                            "bg-creo-blue text-white hover:bg-creo-blue-deep dark:bg-creo-blue dark:hover:bg-creo-blue-deep",
                        )}
                        variant={isHighlight ? "default" : "outline"}
                        disabled={pending || checkoutDisabled}
                        onClick={() => onSelectPlan?.(key)}
                      >
                        Choisir {cfg.title}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CreoPricingBillingToggle({
  billingInterval,
  onBillingIntervalChange,
}: {
  billingInterval: PlatformSubscriptionInterval;
  onBillingIntervalChange: (v: PlatformSubscriptionInterval) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-500 dark:text-zinc-400">
        Facturation
      </span>
      <div
        className={cn(
          "inline-flex rounded-full border border-zinc-200 bg-zinc-100/80 p-1 dark:border-white/10 dark:bg-zinc-800/80",
        )}
        role="group"
        aria-label="Période de facturation"
      >
        <button
          type="button"
          onClick={() => onBillingIntervalChange("month")}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-colors",
            billingInterval === "month"
              ? "bg-creo-info-pale font-semibold text-creo-blue dark:bg-[rgba(0,51,255,0.16)] dark:text-creo-blue-readable"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white",
          )}
        >
          Mensuel
        </button>
        <button
          type="button"
          onClick={() => onBillingIntervalChange("year")}
          className={cn(
            "rounded-full px-5 py-2 text-sm font-medium transition-colors",
            billingInterval === "year"
              ? "bg-creo-info-pale font-semibold text-creo-blue dark:bg-[rgba(0,51,255,0.16)] dark:text-creo-blue-readable"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-white",
          )}
        >
          Annuel
        </button>
      </div>
    </div>
  );
}
