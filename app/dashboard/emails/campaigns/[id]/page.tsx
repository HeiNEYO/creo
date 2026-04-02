import { notFound, redirect } from "next/navigation";

import { CampaignEditor } from "@/components/dashboard/emails/campaign-editor";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type Props = { params: { id: string } };

export default async function EmailCampaignPage({ params }: Props) {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const { data: row, error } = await supabase
    .from("email_campaigns")
    .select("id, name, subject, preview_text, content, status")
    .eq("id", params.id)
    .maybeSingle();

  if (error || !row) {
    notFound();
  }

  const html =
    typeof (row.content as { html?: string } | null)?.html === "string"
      ? (row.content as { html: string }).html
      : "";

  return (
    <CampaignEditor
      campaignId={row.id}
      initialName={row.name}
      initialSubject={row.subject ?? ""}
      initialPreviewText={row.preview_text ?? ""}
      initialHtml={html}
      status={row.status}
    />
  );
}
