import { notFound, redirect } from "next/navigation";

import { CampaignEditor } from "@/components/dashboard/emails/campaign-editor";
import { getEmailMonthlyBroadcastCap } from "@/lib/config/limits";
import { emailCrmRoutes } from "@/lib/email-crm/routes";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function EmailCampaignHtmlPage({ params }: Props) {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const { data: row, error } = await supabase
    .from("email_campaigns")
    .select("id, name, subject, preview_text, content, status, is_template, workspace_id")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const { data: wsPlan } = await supabase
    .from("workspaces")
    .select("plan")
    .eq("id", row.workspace_id)
    .maybeSingle();

  const content = row.content as { html?: string } | null;
  const html =
    typeof content?.html === "string"
      ? content.html
      : "<p>Bonjour {{first_name}},</p><p>—</p>";

  const isTemplate = Boolean(
    (row as { is_template?: boolean | null }).is_template
  );

  return (
    <CampaignEditor
      campaignId={row.id}
      initialName={row.name}
      initialSubject={row.subject ?? ""}
      initialPreviewText={row.preview_text ?? ""}
      initialHtml={html}
      status={row.status}
      isTemplate={isTemplate}
      platformPlan={(wsPlan?.plan as string | undefined) ?? "starter"}
      monthlyBroadcastCap={getEmailMonthlyBroadcastCap()}
      listBackHref={
        isTemplate ? emailCrmRoutes.conception : emailCrmRoutes.campaigns
      }
    />
  );
}
