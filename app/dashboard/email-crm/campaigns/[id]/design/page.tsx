import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { EmailEditorRich } from "@/components/email-editor/email-editor-rich";
import { buttonVariants } from "@/components/ui/button-variants";
import { emailCrmRoutes } from "@/lib/email-crm/routes";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function EmailCampaignDesignPage({ params }: Props) {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const { data: row, error } = await supabase
    .from("email_campaigns")
    .select("id, name, content, is_template")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const isTemplate = Boolean(
    (row as { is_template?: boolean | null }).is_template
  );
  const listBackHref = isTemplate
    ? emailCrmRoutes.conception
    : emailCrmRoutes.campaigns;

  return (
    <>
      <PageHeader
        title={row.name || (isTemplate ? "Modèle" : "Campagne")}
        description={
          isTemplate
            ? "Modèle — éditeur de message (réutilisable, pas d’envoi de masse depuis ce type)."
            : "Éditeur de message — mise en forme simple (lien, image par URL), HTML généré pour l’envoi."
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={emailCrmRoutes.campaignHtml(params.id)}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Éditeur HTML
            </Link>
            <Link
              href={listBackHref}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Retour
            </Link>
          </div>
        }
      />
      <EmailEditorRich key={row.id} campaignId={row.id} initialContent={row.content} />
    </>
  );
}
