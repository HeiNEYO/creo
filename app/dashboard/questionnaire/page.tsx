import Link from "next/link";

import { PageHeader } from "@/components/dashboard/page-header";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

export default async function QuestionnairePage() {
  const { supabase, user } = await getWorkspaceContext();

  const { data: profile, error: profileErr } = user
    ? await supabase
        .from("profiles")
        .select("signup_intake_completed_at")
        .eq("id", user.id)
        .maybeSingle()
    : { data: null, error: null };

  const done =
    !profileErr && Boolean(profile?.signup_intake_completed_at);

  return (
    <>
      <PageHeader
        title="Questionnaire"
        description="Quelques questions pour mieux te connaître — optionnel, sans bloquer ton accès."
      />
      <Card className="space-y-4 p-6">
        <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground">
          Un parcours type Typeform sera branché ici : objectifs, activité, pourquoi tu
          rejoins CRÉO. Les réponses sont stockées côté base (
          <code className="text-creo-xs">signup_intake</code>) pour l’équipe produit.
        </p>
        {done ? (
          <p className="text-creo-sm font-medium text-green-700 dark:text-green-400">
            Tu as déjà complété le questionnaire. Tu pourras le modifier quand le
            formulaire sera en ligne.
          </p>
        ) : (
          <p className="text-creo-sm text-creo-gray-500">
            Tu peux utiliser tout le dashboard sans remplir ce questionnaire.
          </p>
        )}
        <Link href="/dashboard" className={buttonVariants({ className: "inline-flex" })}>
          Retour au cockpit
        </Link>
      </Card>
    </>
  );
}
