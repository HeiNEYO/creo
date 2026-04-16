"use client";

import Link from "next/link";
import { BookOpen, Crown, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { IntegrationCardIcon } from "@/components/dashboard/integrations/integration-card-icon";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { isPaidPlatformPlan } from "@/lib/workspaces/platform-plan";
import {
  integrationCatalog,
  type IntegrationCatalogEntry,
} from "@/lib/integrations/catalog";
import { cn } from "@/lib/utils";

type Props = {
  initialWebhookUrl: string;
  initialMetaPixelId: string;
  initialStripeConnectAccountId: string | null;
  initialStripeConnectChargesEnabled: boolean;
  platformPlan: string;
};

function isConnected(
  entry: IntegrationCatalogEntry,
  p: {
    webhookUrl: string;
    metaPixelId: string;
    stripeAccountId: string | null;
    stripeCharges: boolean;
  }
): boolean {
  switch (entry.id) {
    case "webhook":
      return p.webhookUrl.trim().length > 0;
    case "meta-pixel":
      return p.metaPixelId.trim().length > 0;
    case "stripe":
      return p.stripeCharges || (!!p.stripeAccountId && p.stripeAccountId.length > 0);
    default:
      return false;
  }
}

export function IntegrationsView({
  initialWebhookUrl,
  initialMetaPixelId,
  initialStripeConnectAccountId,
  initialStripeConnectChargesEnabled,
  platformPlan,
}: Props) {
  const [query, setQuery] = useState("");
  const paid = isPaidPlatformPlan(platformPlan);

  const state = useMemo(
    () => ({
      webhookUrl: initialWebhookUrl,
      metaPixelId: initialMetaPixelId,
      stripeAccountId: initialStripeConnectAccountId,
      stripeCharges: initialStripeConnectChargesEnabled,
    }),
    [
      initialWebhookUrl,
      initialMetaPixelId,
      initialStripeConnectAccountId,
      initialStripeConnectChargesEnabled,
    ]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return integrationCatalog;
    }
    return integrationCatalog.filter(
      (e) =>
        e.label.toLowerCase().includes(q) ||
        e.shortDescription.toLowerCase().includes(q)
    );
  }, [query]);

  const { connected, browse, business } = useMemo(() => {
    const connected: IntegrationCatalogEntry[] = [];
    const browse: IntegrationCatalogEntry[] = [];
    const business: IntegrationCatalogEntry[] = [];

    for (const entry of filtered) {
      if (entry.comingSoon) {
        browse.push(entry);
        continue;
      }
      const c = isConnected(entry, state);
      if (c) {
        connected.push(entry);
        continue;
      }
      const locked = entry.requiresPaidPlan && !paid;
      if (locked) {
        business.push(entry);
      } else {
        browse.push(entry);
      }
    }

    return { connected, browse, business };
  }, [filtered, state, paid]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-creo-xl font-semibold tracking-tight text-creo-black dark:text-foreground">
          Intégrations
        </h1>
        <Link
          href="/aides"
          className="inline-flex size-10 items-center justify-center rounded-lg border border-creo-gray-200 text-creo-gray-600 transition-colors hover:bg-creo-gray-50 dark:border-border dark:text-muted-foreground dark:hover:bg-muted/50"
          aria-label="Aide et documentation"
        >
          <BookOpen className="size-5" />
        </Link>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-creo-gray-400" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une intégration"
          className="h-11 rounded-creo-lg border-creo-gray-200 pl-10 dark:border-border"
          aria-label="Rechercher une intégration"
        />
      </div>

      <IntegrationSection
        title="Intégrations connectées"
        titleClassName="text-green-700 dark:text-green-400"
        dot
        items={connected}
        emptyHint="Aucune intégration active pour l’instant — configure-en une ci-dessous."
      />

      <IntegrationSection title="Parcourir" items={browse} />

      {business.length > 0 ? (
        <div className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-creo-sm font-semibold uppercase tracking-wide text-creo-gray-500 dark:text-muted-foreground">
              Intégrations sur forfait supérieur
            </h2>
            <Link
              href="/dashboard/settings?section=subscription-creo"
              className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-creo-xs font-medium text-amber-950 transition-colors hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100 dark:hover:bg-amber-950/60"
            >
              <Crown className="size-3.5 shrink-0" aria-hidden />
              Essaye gratuitement un forfait supérieur
            </Link>
          </div>
          <IntegrationGrid items={business} />
        </div>
      ) : null}
    </div>
  );
}

function IntegrationSection({
  title,
  titleClassName,
  dot,
  items,
  emptyHint,
}: {
  title: string;
  titleClassName?: string;
  dot?: boolean;
  items: IntegrationCatalogEntry[];
  emptyHint?: string;
}) {
  if (items.length === 0) {
    if (!emptyHint) {
      return null;
    }
    return (
      <div className="space-y-4">
        <h2
          className={cn(
            "flex items-center gap-2 text-creo-sm font-semibold uppercase tracking-wide text-creo-gray-500 dark:text-muted-foreground",
            titleClassName
          )}
        >
          {dot ? (
            <span className="size-2 rounded-full bg-green-500 dark:bg-green-400" aria-hidden />
          ) : null}
          {title}
        </h2>
        <p className="text-creo-sm text-creo-gray-500 dark:text-muted-foreground">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2
        className={cn(
          "flex items-center gap-2 text-creo-sm font-semibold uppercase tracking-wide text-creo-gray-500 dark:text-muted-foreground",
          titleClassName
        )}
      >
        {dot ? (
          <span className="size-2 rounded-full bg-green-500 dark:bg-green-400" aria-hidden />
        ) : null}
        {title}
      </h2>
      <IntegrationGrid items={items} />
    </div>
  );
}

function IntegrationGrid({ items }: { items: IntegrationCatalogEntry[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((entry) => (
        <li key={entry.id}>
          <Link href={`/dashboard/integrations/${entry.id}`} className="block h-full">
            <Card
              interactive
              className="h-full !rounded-xl border !border-creo-gray-200/95 p-5 shadow-[var(--creo-shadow-card-rest)] dark:!border-white/[0.12] sm:p-6"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <IntegrationCardIcon id={entry.id} />
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-creo-md font-semibold text-creo-black dark:text-foreground">
                      {entry.label}
                    </span>
                    {entry.comingSoon ? (
                      <span className="rounded-full bg-creo-gray-100 px-2 py-0.5 text-creo-xs font-medium text-creo-gray-600 dark:bg-muted dark:text-muted-foreground">
                        Bientôt
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-creo-sm leading-relaxed text-creo-gray-500 dark:text-muted-foreground">
                    {entry.shortDescription}
                  </p>
                </div>
              </div>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
