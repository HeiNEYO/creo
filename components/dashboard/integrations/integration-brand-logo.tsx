import Image from "next/image";

import type { IntegrationCatalogId } from "@/lib/integrations/catalog";
import { cn } from "@/lib/utils";

/** Chemins vers les logos officiels (formes Simple Icons + couleurs de marque). */
const BRAND_SRC: Partial<Record<IntegrationCatalogId, string>> = {
  "meta-pixel": "/integrations/brands/meta.svg",
  /** Logos raster (fichiers locaux — évite hotlink fragile) */
  stripe: "/integrations/brands/stripe.png",
  zapier: "/integrations/brands/zapier.svg",
  "google-calendar": "/integrations/brands/googlecalendar.png",
  calendly: "/integrations/brands/calendly.svg",
  zoom: "/integrations/brands/zoom.svg",
  slack: "/integrations/brands/slack.png",
  gtm: "/integrations/brands/googletagmanager.svg",
  iclosed: "/integrations/brands/iclosed.png",
};

export function IntegrationBrandLogo({
  id,
  size,
  className,
}: {
  id: IntegrationCatalogId;
  /** Taille en px (largeur et hauteur max, object-contain). */
  size: number;
  className?: string;
}) {
  const src = BRAND_SRC[id];
  if (!src) {
    return null;
  }

  return (
    <Image
      src={src}
      alt=""
      width={size}
      height={size}
      unoptimized
      className={cn("object-contain", className)}
    />
  );
}
