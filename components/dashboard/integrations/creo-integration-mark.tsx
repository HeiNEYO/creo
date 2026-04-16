import Image from "next/image";

import { cn } from "@/lib/utils";

/** Décor de carte « Intégrations » (icône lien CRÉO). */
export function CreoIntegrationMark({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-creo-md bg-creo-gray-100 dark:bg-muted",
        className
      )}
    >
      <Image
        src="/integrations/creo-integration.png"
        alt=""
        width={26}
        height={26}
        className="object-contain dark:invert dark:opacity-90"
      />
    </div>
  );
}
