import { redirect } from "next/navigation";

import {
  ContactsView,
  type ContactRow,
} from "@/components/dashboard/contacts/contacts-view";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  let initialContacts: ContactRow[] = [];

  if (workspaceId) {
    const { data } = await supabase
      .from("contacts")
      .select(
        "id, email, first_name, last_name, tags, source, subscribed, created_at"
      )
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false });

    initialContacts = (data ?? []) as ContactRow[];
  }

  return <ContactsView initialContacts={initialContacts} />;
}
