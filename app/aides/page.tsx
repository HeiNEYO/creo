import { Suspense } from "react";

import { HelpCenter } from "@/components/help/help-center";

export const metadata = {
  title: "Aide | CRÉO",
  description:
    "Documentation CRÉO : éditeur de pages, formations, paiements, e-mail et paramètres.",
};

function HelpCenterFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100 dark:bg-zinc-950">
      <p className="text-sm text-zinc-500">Chargement…</p>
    </div>
  );
}

export default function AidesPage({
  searchParams,
}: {
  searchParams: { categorie?: string };
}) {
  const initial =
    typeof searchParams.categorie === "string" && searchParams.categorie
      ? searchParams.categorie
      : "editeur";

  return (
    <Suspense fallback={<HelpCenterFallback />}>
      <HelpCenter initialCategoryId={initial} />
    </Suspense>
  );
}
