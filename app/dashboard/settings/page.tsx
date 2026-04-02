import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/dashboard/page-header";
import { WorkspaceGeneralForm } from "@/components/dashboard/settings/workspace-general-form";
import { ThemeAppearanceSettings } from "@/components/settings/theme-appearance-settings";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getWorkspaceContext } from "@/lib/workspaces/get-workspace-context";

export const dynamic = "force-dynamic";

const sections = [
  { id: "general", label: "Général" },
  { id: "appearance", label: "Apparence" },
  { id: "account", label: "Mon compte" },
  { id: "billing", label: "Facturation" },
  { id: "domain", label: "Domaine" },
  { id: "team", label: "Équipe" },
  { id: "danger", label: "Zone de danger" },
];

const planLabels: Record<string, string> = {
  starter: "Starter",
  creator: "Creator",
  pro: "Pro",
  agency: "Agency",
};

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const { supabase, user, workspaceId } = await getWorkspaceContext();
  if (!user) {
    redirect("/login");
  }

  const section =
    typeof searchParams.section === "string"
      ? searchParams.section
      : "general";

  const { data: workspace } = workspaceId
    ? await supabase
        .from("workspaces")
        .select("name, slug, plan")
        .eq("id", workspaceId)
        .maybeSingle()
    : { data: null };

  return (
    <>
      <PageHeader
        title="Paramètres"
        description="Workspace, facturation, domaine, équipe"
      />
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <nav
          className="sticky top-0 z-10 flex shrink-0 flex-row gap-2 overflow-x-auto bg-white pb-1 pt-0.5 dark:bg-[#141414] lg:w-48 lg:flex-col lg:gap-1 lg:self-start lg:overflow-x-visible lg:pb-0 lg:pt-0"
          aria-label="Sections des paramètres"
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`/dashboard/settings?section=${s.id}`}
              className={`whitespace-nowrap rounded-none px-3 py-2 text-creo-sm font-medium lg:w-full ${
                section === s.id
                  ? "bg-creo-purple-pale text-creo-purple"
                  : "text-creo-gray-600 hover:bg-creo-gray-100 dark:hover:bg-white/[0.06]"
              }`}
            >
              {s.label}
            </a>
          ))}
        </nav>
        <div className="min-w-0 flex-1">
          {section === "general" && (
            <Card className="space-y-4 p-6">
              <h2 className="text-creo-md font-semibold">Général</h2>
              {!workspaceId || !workspace ? (
                <p className="text-creo-sm text-creo-gray-500">
                  Workspace introuvable.{" "}
                  <Link href="/login" className="text-creo-purple underline">
                    Reconnecte-toi
                  </Link>
                  .
                </p>
              ) : (
                <>
                  <WorkspaceGeneralForm
                    initialName={workspace.name}
                    initialSlug={workspace.slug}
                  />
                  <p className="border-t border-creo-gray-100 pt-4 text-creo-xs text-creo-gray-500 dark:border-border">
                    Devise boutique / Stripe : prochaine étape (pas encore stockée
                    sur le workspace).
                  </p>
                </>
              )}
            </Card>
          )}
          {section === "appearance" && (
            <Card className="space-y-4 p-6">
              <h2 className="text-creo-md font-semibold">Apparence</h2>
              <ThemeAppearanceSettings />
            </Card>
          )}
          {section === "account" && (
            <Card className="space-y-4 p-6">
              <h2 className="text-creo-md font-semibold">Mon compte</h2>
              <p className="text-creo-sm text-creo-gray-500">
                Photo et nom :{" "}
                <Link href="/dashboard/profile" className="text-creo-purple underline">
                  Mon profil
                </Link>
                .
              </p>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                  type="email"
                  readOnly
                  defaultValue={user.email ?? ""}
                  className="bg-creo-gray-50 dark:bg-muted/40"
                />
              </div>
              <Link
                href="/forgot-password"
                className={buttonVariants({ variant: "outline" })}
              >
                Changer le mot de passe
              </Link>
            </Card>
          )}
          {section === "billing" && (
            <Card className="space-y-4 p-6">
              <h2 className="text-creo-md font-semibold">Facturation</h2>
              <p className="text-creo-sm text-creo-gray-500">
                Plan actuel :{" "}
                <strong>
                  {workspace?.plan
                    ? (planLabels[workspace.plan] ?? workspace.plan)
                    : "—"}
                </strong>{" "}
                — intégration Stripe à venir.
              </p>
            </Card>
          )}
          {section === "domain" && (
            <Card className="space-y-4 p-6">
              <h2 className="text-creo-md font-semibold">Domaine personnalisé</h2>
              <ol className="list-decimal space-y-2 pl-5 text-creo-sm text-creo-gray-600">
                <li>Entre ton domaine</li>
                <li>Ajoute les enregistrements DNS indiqués</li>
                <li>Vérifie le statut ici</li>
              </ol>
            </Card>
          )}
          {section === "team" && (
            <Card className="space-y-4 p-6">
              <h2 className="text-creo-md font-semibold">Équipe</h2>
              <p className="text-creo-sm text-creo-gray-500">
                Invitations par email — bientôt disponible.
              </p>
            </Card>
          )}
          {section === "danger" && (
            <Card className="space-y-4 border-creo-danger/30 p-6">
              <h2 className="text-creo-md font-semibold text-creo-danger">
                Zone de danger
              </h2>
              <p className="text-creo-sm text-creo-gray-500">
                La suppression de workspace sera toujours confirmée par une
                modale explicative.
              </p>
              <Button type="button" variant="danger" size="sm">
                Supprimer le workspace
              </Button>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
