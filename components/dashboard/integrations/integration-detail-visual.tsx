import Image from "next/image";
import type { ReactNode } from "react";

import type { IntegrationCatalogId } from "@/lib/integrations/catalog";
import { cn } from "@/lib/utils";

/**
 * Schéma d’illustration page détail (logos de marque + schéma abstrait).
 */
export function IntegrationDetailVisual({
  id,
  className,
}: {
  id: IntegrationCatalogId;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[220px] flex-col items-center justify-center rounded-creo-lg border border-blue-100 bg-gradient-to-b from-[#eff6ff] to-[#dbeafe]/60 p-6 dark:border-blue-900/40 dark:from-blue-950/40 dark:to-blue-950/20",
        className
      )}
    >
      {id === "stripe" ? <StripeFlowDiagram /> : null}
      {id === "webhook" ? <WebhookFlowDiagram /> : null}
      {id === "meta-pixel" ? <PixelFlowDiagram /> : null}
      {id !== "stripe" && id !== "webhook" && id !== "meta-pixel" ? (
        <GenericFlowDiagram label={flowLabel(id)} />
      ) : null}
    </div>
  );
}

function flowLabel(id: IntegrationCatalogId): string {
  switch (id) {
    case "zapier":
      return "Automatisations";
    case "google-calendar":
      return "Calendrier";
    case "calendly":
      return "Rendez-vous";
    case "zoom":
      return "Visioconférence";
    case "slack":
      return "Notifications";
    case "gtm":
      return "Tags & mesure";
    case "iclosed":
      return "CRM iClosed";
    default:
      return "Intégration";
  }
}

function Box({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border border-white/80 bg-white/90 px-3 py-2 text-center text-creo-xs font-medium text-creo-gray-800 shadow-sm dark:border-white/10 dark:bg-card dark:text-foreground",
        className
      )}
    >
      {children}
    </div>
  );
}

function ArrowDown() {
  return (
    <div className="flex flex-col items-center py-1 text-[#2563eb]" aria-hidden>
      <svg width="20" height="24" viewBox="0 0 20 24" fill="none" className="opacity-80">
        <path d="M10 0v18M4 14l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function StripeFlowDiagram() {
  return (
    <div className="flex w-full max-w-[280px] flex-col items-center">
      <div className="mb-2 w-full rounded-md border border-creo-gray-200 bg-white/95 p-2 text-creo-xs text-creo-gray-600 dark:border-border dark:bg-card dark:text-muted-foreground">
        <div className="flex justify-between border-b border-creo-gray-100 pb-1 font-medium text-creo-gray-800 dark:border-border dark:text-foreground">
          <span>Paiements</span>
          <span className="text-green-600">OK</span>
        </div>
        <div className="mt-1 space-y-0.5">
          <div className="flex justify-between">
            <span>Page</span>
            <span>49,00 €</span>
          </div>
          <div className="flex justify-between">
            <span>Offre</span>
            <span>29,00 €</span>
          </div>
        </div>
      </div>
      <ArrowDown />
      <Box className="flex items-center justify-center py-2 text-sm">
        <Image
          src="/integrations/brands/stripe.png"
          alt=""
          width={56}
          height={24}
          unoptimized
          className="h-6 w-auto object-contain"
        />
      </Box>
      <ArrowDown />
      <Box className="bg-[#eff6ff] text-sm font-semibold text-[#1e40af] dark:bg-blue-950/50 dark:text-blue-200">
        CRÉO
      </Box>
    </div>
  );
}

function WebhookFlowDiagram() {
  return (
    <div className="flex w-full max-w-[260px] flex-col items-center">
      <Box className="text-sm">Événement CRÉO</Box>
      <ArrowDown />
      <Box className="text-sm">Webhook HTTPS</Box>
      <ArrowDown />
      <Box className="text-sm">Ton outil / Zapier</Box>
    </div>
  );
}

function PixelFlowDiagram() {
  return (
    <div className="flex w-full max-w-[260px] flex-col items-center">
      <Box className="text-sm">Page publique</Box>
      <ArrowDown />
      <Box className="text-sm">Consentement cookies</Box>
      <ArrowDown />
      <Box className="flex flex-col items-center gap-1.5 text-sm">
        <span>Meta Pixel</span>
        <Image
          src="/integrations/brands/meta.svg"
          alt=""
          width={28}
          height={28}
          unoptimized
          className="size-7 object-contain"
        />
      </Box>
    </div>
  );
}

function GenericFlowDiagram({ label }: { label: string }) {
  return (
    <div className="flex w-full max-w-[260px] flex-col items-center">
      <Box className="text-sm">CRÉO</Box>
      <ArrowDown />
      <Box className="text-sm">{label}</Box>
      <ArrowDown />
      <Box className="text-sm">Tes outils</Box>
    </div>
  );
}
