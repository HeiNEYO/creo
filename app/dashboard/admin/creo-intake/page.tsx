import { notFound } from "next/navigation";

import { Card } from "@/components/ui/card";
import { isCreoAdminEmail } from "@/lib/admin/is-creo-admin";
import { ADMIN_INTAKE_PROFILES_LIMIT } from "@/lib/config/limits";
import { createServiceRoleClient } from "@/lib/supabase/service";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

type ProfileRow = {
  id: string;
  full_name: string | null;
  signup_intake: unknown;
  signup_intake_completed_at: string | null;
  created_at: string;
};

export default async function CreoIntakeAdminPage() {
  const { user } = await getWorkspaceContext();
  if (!isCreoAdminEmail(user?.email)) {
    notFound();
  }

  const admin = createServiceRoleClient();
  if (!admin) {
    notFound();
  }

  const { data: profiles, error: pErr } = await admin
    .from("profiles")
    .select("id, full_name, signup_intake, signup_intake_completed_at, created_at")
    .order("created_at", { ascending: false })
    .limit(ADMIN_INTAKE_PROFILES_LIMIT);

  if (pErr) {
    return (
      <>
        <Card className="p-6 text-creo-sm text-red-600">{pErr.message}</Card>
      </>
    );
  }

  const { data: authData, error: authErr } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  const emailById = new Map<string, string>();
  if (authErr) {
    console.error("[creo-intake] listUsers:", authErr.message);
  }
  for (const u of authData?.users ?? []) {
    if (u.email) {
      emailById.set(u.id, u.email);
    }
  }

  const rows = (profiles ?? []) as ProfileRow[];

  return (
    <>
      <Card className="overflow-x-auto p-0">
        <table className="w-full text-left text-creo-sm">
          <thead className="border-b border-creo-gray-200 bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500 dark:border-border dark:bg-muted/40">
            <tr>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Nom</th>
              <th className="px-4 py-3">Questionnaire</th>
              <th className="hidden px-4 py-3 lg:table-cell">Réponses (JSON)</th>
              <th className="px-4 py-3">Inscrit</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-creo-gray-500" colSpan={5}>
                  Aucun profil.
                </td>
              </tr>
            ) : (
              rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-creo-gray-100 dark:border-border"
                >
                  <td className="px-4 py-3 font-mono text-creo-xs">
                    {emailById.get(r.id) ?? r.id.slice(0, 8)}
                  </td>
                  <td className="px-4 py-3">{r.full_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    {r.signup_intake_completed_at ? (
                      <span className="text-green-600 dark:text-green-400">Terminé</span>
                    ) : (
                      <span className="text-creo-gray-400">—</span>
                    )}
                  </td>
                  <td className="hidden max-w-md truncate px-4 py-3 font-mono text-[11px] text-creo-gray-600 lg:table-cell dark:text-muted-foreground">
                    {JSON.stringify(r.signup_intake ?? {})}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-creo-xs text-creo-gray-500">
                    {new Date(r.created_at).toLocaleDateString("fr-FR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </>
  );
}
