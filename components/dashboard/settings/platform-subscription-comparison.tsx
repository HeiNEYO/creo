"use client";

import { Check, X } from "lucide-react";

import { CreoPricingBillingToggle, CreoPricingCards } from "@/components/pricing/creo-pricing-cards";
import { cn } from "@/lib/utils";
import type { PlatformSubscriptionInterval, PlatformSubscriptionPlanKey } from "@/lib/stripe/platform-subscription-prices";

const PLAN_ORDER: PlatformSubscriptionPlanKey[] = ["creator", "pro", "agency"];

const PLAN_META: Record<
  PlatformSubscriptionPlanKey,
  { title: string; short: string; popular?: boolean }
> = {
  creator: { title: "Creator", short: "Créateur solo" },
  pro: { title: "Pro", short: "Croissance", popular: true },
  agency: { title: "Agency", short: "Volume & équipes" },
};

type BoolRow = {
  label: string;
  creator: boolean;
  pro: boolean;
  agency: boolean;
};

type TextRow = {
  label: string;
  creator: string;
  pro: string;
  agency: string;
};

const COMPARISON_ROWS: (BoolRow | TextRow)[] = [
  {
    label: "Éditeur de pages & site public",
    creator: true,
    pro: true,
    agency: true,
  },
  {
    label: "Stripe Connect (encaissement client)",
    creator: true,
    pro: true,
    agency: true,
  },
  {
    label: "E-mail, CRM, séquences & campagnes",
    creator: true,
    pro: true,
    agency: true,
  },
  {
    label: "Export CSV des contacts",
    creator: true,
    pro: true,
    agency: true,
  },
  {
    label: "Formations & parcours",
    creator: true,
    pro: true,
    agency: true,
  },
  {
    label: "Analytics & tableau de bord",
    creator: true,
    pro: true,
    agency: true,
  },
  {
    label: "Invitations équipe & rôles",
    creator: true,
    pro: true,
    agency: true,
  },
  {
    label: "Support prioritaire (e-mail)",
    creator: false,
    pro: true,
    agency: true,
  },
  {
    label: "Accompagnement renforcé / onboarding",
    creator: false,
    pro: false,
    agency: true,
  },
  {
    label: "Positionnement",
    creator: "Individuel",
    pro: "Croissance",
    agency: "Équipe & volume",
  },
];

function isTextRow(row: BoolRow | TextRow): row is TextRow {
  return typeof (row as TextRow).creator === "string";
}

function planKeyFromLabel(label: string | undefined): PlatformSubscriptionPlanKey | null {
  if (!label) return null;
  const t = label.trim().toLowerCase();
  if (t === "creator" || t === "créateur") return "creator";
  if (t === "pro") return "pro";
  if (t === "agency") return "agency";
  return null;
}

function BoolCell({ value }: { value: boolean }) {
  if (value) {
    return (
      <span className="inline-flex items-center justify-center" title="Inclus">
        <Check
          className="size-5 text-emerald-600 dark:text-emerald-400"
          strokeWidth={2.75}
          aria-hidden
        />
        <span className="sr-only">Inclus</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center justify-center" title="Non inclus">
      <X
        className="size-5 text-red-600 dark:text-red-400"
        strokeWidth={2.5}
        aria-hidden
      />
      <span className="sr-only">Non inclus</span>
    </span>
  );
}

export type PlatformSubscriptionComparisonHeroProps = {
  billingInterval: PlatformSubscriptionInterval;
  onBillingIntervalChange: (interval: PlatformSubscriptionInterval) => void;
  onSelectPlan: (plan: PlatformSubscriptionPlanKey) => void;
  pending: boolean;
  checkoutDisabled: boolean;
  activePlanLabel?: string;
};

/**
 * App : cartes « premium » (aperçu offre) + tableau type Systeme (détail ligne à ligne).
 */
export function PlatformSubscriptionComparisonHero({
  billingInterval,
  onBillingIntervalChange,
  onSelectPlan,
  pending,
  checkoutDisabled,
  activePlanLabel,
}: PlatformSubscriptionComparisonHeroProps) {
  const activeKey = planKeyFromLabel(activePlanLabel);

  function colHighlight(plan: PlatformSubscriptionPlanKey) {
    return activeKey === plan
      ? cn(
          "border-x border-primary/25 bg-primary/[0.06] dark:border-primary/35 dark:bg-primary/[0.12]",
        )
      : "border-x border-transparent";
  }

  return (
    <div className="flex w-full min-w-0 flex-col gap-10">
      <div className="flex w-full min-w-0 flex-col gap-8">
        <div className="flex justify-center">
          <CreoPricingBillingToggle
            billingInterval={billingInterval}
            onBillingIntervalChange={onBillingIntervalChange}
          />
        </div>

        <div>
          <CreoPricingCards
            variant="app"
            billingInterval={billingInterval}
            onSelectPlan={onSelectPlan}
            pending={pending}
            checkoutDisabled={checkoutDisabled}
            activePlanLabel={activePlanLabel}
            density="compact"
          />
        </div>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-medium text-foreground">Comparatif fonctionnalités</h4>
        <div
          className={cn(
            "overflow-hidden rounded-xl border border-border bg-card text-card-foreground",
            "dark:border-white/10",
          )}
        >
          <div className="overflow-x-auto [scrollbar-width:thin]">
            <table className="w-full min-w-[760px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-border bg-card dark:bg-card">
                  <th
                    scope="col"
                    className={cn(
                      "sticky left-0 z-20 min-w-[200px] bg-card px-4 py-4 text-[13px] font-semibold text-foreground",
                      "shadow-[4px_0_12px_-4px_rgba(15,23,42,0.08)] dark:shadow-[4px_0_14px_-4px_rgba(0,0,0,0.55)]",
                    )}
                  >
                    Fonctionnalité
                  </th>
                  {PLAN_ORDER.map((key) => {
                    const meta = PLAN_META[key];
                    return (
                      <th
                        key={key}
                        scope="col"
                        className={cn(
                          "min-w-[140px] px-4 py-4 text-center align-bottom text-[13px] font-semibold text-foreground",
                          colHighlight(key),
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          <span>{meta.title}</span>
                          <span className="text-[11px] font-normal text-muted-foreground">{meta.short}</span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => {
                  const zebra = i % 2 === 1;
                  const rowBg = zebra ? "bg-muted/40 dark:bg-muted/20" : "bg-card dark:bg-card/90";
                  const stickyBg = zebra ? "bg-muted/40 dark:bg-muted/20" : "bg-card dark:bg-card/90";

                  if (isTextRow(row)) {
                    return (
                      <tr key={row.label} className={cn("border-b border-border", rowBg)}>
                        <th
                          scope="row"
                          className={cn(
                            "sticky left-0 z-10 px-4 py-4 pr-5 text-left text-[13px] font-medium text-foreground",
                            stickyBg,
                            "shadow-[4px_0_12px_-4px_rgba(15,23,42,0.08)] dark:shadow-[4px_0_14px_-4px_rgba(0,0,0,0.5)]",
                          )}
                        >
                          {row.label}
                        </th>
                        {PLAN_ORDER.map((key) => (
                          <td
                            key={key}
                            className={cn(
                              "px-4 py-4 text-center align-middle text-[13px] font-medium text-foreground",
                              colHighlight(key),
                            )}
                          >
                            {row[key]}
                          </td>
                        ))}
                      </tr>
                    );
                  }

                  return (
                    <tr key={row.label} className={cn("border-b border-border", rowBg)}>
                      <th
                        scope="row"
                        className={cn(
                          "sticky left-0 z-10 max-w-[280px] px-4 py-4 pr-5 text-left text-[13px] font-normal leading-snug text-foreground",
                          stickyBg,
                          "shadow-[4px_0_12px_-4px_rgba(15,23,42,0.08)] dark:shadow-[4px_0_14px_-4px_rgba(0,0,0,0.5)]",
                        )}
                      >
                        {row.label}
                      </th>
                      {PLAN_ORDER.map((key) => (
                        <td
                          key={key}
                          className={cn("px-4 py-4 text-center align-middle", colHighlight(key))}
                        >
                          <BoolCell value={row[key]} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
