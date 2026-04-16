import { redirect } from "next/navigation";

import { WorkspaceEmailCrmSettingsForm } from "@/components/dashboard/email-crm/workspace-email-crm-settings-form";
import { Card } from "@/components/ui/card";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function EmailCrmSettingsPage() {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);

  type EmailSettingsRow = {
    from_name: string | null;
    from_email: string | null;
    reply_to: string | null;
    double_opt_in: boolean;
    double_opt_in_subject: string | null;
    double_opt_in_html: string | null;
    unsub_page_id: string | null;
    confirm_page_id: string | null;
  };

  let settings: EmailSettingsRow | null = null;
  let pages: { id: string; title: string; slug: string }[] = [];

  if (workspaceId) {
    const [{ data: settingsRow }, { data: pageRows }] = await Promise.all([
      supabase
        .from("workspace_email_settings")
        .select(
          "from_name, from_email, reply_to, double_opt_in, double_opt_in_subject, double_opt_in_html, unsub_page_id, confirm_page_id"
        )
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
      supabase
        .from("pages")
        .select("id, title, slug")
        .eq("workspace_id", workspaceId)
        .order("title", { ascending: true }),
    ]);

    settings = settingsRow as EmailSettingsRow | null;
    pages = (pageRows ?? []) as typeof pages;
  }

  return (
    <>
      <Card className="p-6">
        {workspaceId ? (
          <WorkspaceEmailCrmSettingsForm
            initialFromName={settings?.from_name ?? ""}
            initialFromEmail={settings?.from_email ?? ""}
            initialReplyTo={settings?.reply_to ?? ""}
            initialDoubleOptIn={settings?.double_opt_in ?? false}
            initialDoubleOptInSubject={settings?.double_opt_in_subject ?? ""}
            initialDoubleOptInHtml={settings?.double_opt_in_html ?? ""}
            initialUnsubPageId={settings?.unsub_page_id ?? ""}
            initialConfirmPageId={settings?.confirm_page_id ?? ""}
            pages={pages}
          />
        ) : (
          <p className="text-creo-sm text-creo-gray-500">Aucun workspace.</p>
        )}
      </Card>
    </>
  );
}
