import { redirect } from "next/navigation";

import { ContactsView } from "@/components/dashboard/contacts/contacts-view";
import { CRM_CONTACTS_PAGE_SIZE } from "@/lib/config/limits";
import { fetchContactsCrmPage } from "@/lib/contacts/fetch-contacts-crm";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getFirstWorkspaceIdForUser } from "@/lib/workspaces/get-first-workspace-id";
import { fetchWorkspacePlan } from "@/lib/workspaces/fetch-workspace-plan";
import { isPaidPlatformPlan } from "@/lib/workspaces/platform-plan";

export const dynamic = "force-dynamic";

type Search = {
  q?: string;
  page?: string;
  tag?: string;
  sort?: string;
  dir?: string;
};

export default async function EmailCrmContactsPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const supabase = createClient();
  const user = await readAuthUser(supabase);
  if (!user) {
    redirect("/login");
  }

  const workspaceId = await getFirstWorkspaceIdForUser(supabase, user.id);
  if (!workspaceId) {
    return (
      <ContactsView
        initialContacts={[]}
        crmPagination={{
          total: 0,
          page: 1,
          pageSize: CRM_CONTACTS_PAGE_SIZE,
        }}
        crmFilters={{}}
        exportCsvEnabled={false}
      />
    );
  }

  const plan = await fetchWorkspacePlan(supabase, workspaceId);
  const exportCsvEnabled = isPaidPlatformPlan(plan);

  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10) || 1);
  const sort = searchParams.sort ?? "created_at";
  const dir = searchParams.dir === "asc" ? "asc" : "desc";

  const { rows, total } = await fetchContactsCrmPage(supabase, workspaceId, {
    q: searchParams.q,
    tag: searchParams.tag,
    sort,
    dir,
    page,
  });

  return (
    <ContactsView
      initialContacts={rows}
      crmPagination={{
        total,
        page,
        pageSize: CRM_CONTACTS_PAGE_SIZE,
      }}
      crmFilters={{
        q: searchParams.q,
        tag: searchParams.tag,
        sort,
        dir,
      }}
      exportCsvEnabled={exportCsvEnabled}
    />
  );
}
