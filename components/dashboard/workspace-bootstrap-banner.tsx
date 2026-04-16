"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ensureDefaultWorkspaceFromBrowser } from "@/lib/workspaces/ensure-default-browser";

/**
 * Affiché lorsqu’aucun workspace n’est résolu côté serveur (RPC absente, compte tout neuf, etc.).
 */
export function WorkspaceBootstrapBanner() {
  const router = useRouter();
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setMsg(null);
    startTransition(async () => {
      const supabase = createClient();
      const r = await ensureDefaultWorkspaceFromBrowser(supabase);
      if (r.error) {
        setMsg(r.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      <p className="font-medium">Aucun workspace n’est lié à ton compte pour l’instant.</p>
      <p className="mt-2 text-amber-900/90 dark:text-amber-100/90">
        Cela arrive si la fonction SQL <code className="text-xs">ensure_default_workspace</code> n’est pas
        encore déployée sur Supabase, ou si la création automatique a échoué. Tu peux réessayer depuis le
        navigateur (même session).
      </p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" onClick={run} disabled={pending}>
          {pending ? "Traitement…" : "Créer / réparer mon workspace"}
        </Button>
      </div>
      {msg ? (
        <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
          {msg}
        </p>
      ) : null}
    </Card>
  );
}
