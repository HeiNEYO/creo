import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export default async function DashboardHomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: members } = await supabase
    .from("workspace_members")
    .select("workspace_id")
    .eq("user_id", user.id)
    .limit(1);

  const workspaceId = members?.[0]?.workspace_id;

  const { data: workspace } = workspaceId
    ? await supabase
        .from("workspaces")
        .select("name, slug, plan")
        .eq("id", workspaceId)
        .maybeSingle()
    : { data: null };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">
        Cockpit
      </h1>
      <p className="text-muted-foreground">
        Bienvenue sur CRÉO. Le layout complet du dashboard arrive à l’étape 1.4.
      </p>
      {workspace ? (
        <div className="rounded-lg border border-border bg-card p-4 text-sm">
          <p className="font-medium text-foreground">Workspace actif</p>
          <p className="mt-1 text-muted-foreground">
            {workspace.name} ·{" "}
            <span className="text-foreground">/{workspace.slug}</span> · plan{" "}
            {workspace.plan}
          </p>
        </div>
      ) : (
        <p className="text-sm text-amber-700 dark:text-amber-400">
          Aucun workspace trouvé. Déconnecte-toi et reconnecte-toi, ou contacte le
          support.
        </p>
      )}
    </div>
  );
}
