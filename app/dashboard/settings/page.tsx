import { PageHeader } from "@/components/dashboard/page-header";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const dynamic = "force-dynamic";

const sections = [
  { id: "general", label: "Général" },
  { id: "account", label: "Mon compte" },
  { id: "billing", label: "Facturation" },
  { id: "domain", label: "Domaine" },
  { id: "team", label: "Équipe" },
  { id: "danger", label: "Zone de danger" },
];

export default function SettingsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const section =
    typeof searchParams.section === "string"
      ? searchParams.section
      : "general";

  return (
    <>
      <PageHeader
        title="Paramètres"
        description="Workspace, facturation, domaine, équipe"
      />
      <div className="flex flex-col gap-8 lg:flex-row">
        <nav className="flex shrink-0 flex-row gap-2 overflow-x-auto lg:w-48 lg:flex-col lg:gap-1">
          {sections.map((s) => (
            <a
              key={s.id}
              href={`/dashboard/settings?section=${s.id}`}
              className={`whitespace-nowrap rounded-creo-md px-3 py-2 text-creo-sm font-medium lg:w-full ${
                section === s.id
                  ? "bg-creo-purple-pale text-creo-purple"
                  : "text-creo-gray-600 hover:bg-creo-gray-100"
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
              <div className="space-y-2">
                <Label>Nom du workspace</Label>
                <Input defaultValue="Mon workspace" />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input defaultValue="mon-workspace" />
              </div>
              <div className="space-y-2">
                <Label>Devise</Label>
                <Input defaultValue="EUR" />
              </div>
              <Button type="button">Enregistrer</Button>
            </Card>
          )}
          {section === "account" && (
            <Card className="space-y-4 p-6">
              <h2 className="text-creo-md font-semibold">Mon compte</h2>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" />
              </div>
              <Button type="button" variant="outline">
                Changer le mot de passe
              </Button>
            </Card>
          )}
          {section === "billing" && (
            <Card className="space-y-4 p-6">
              <h2 className="text-creo-md font-semibold">Facturation</h2>
              <p className="text-creo-sm text-creo-gray-500">
                Plan actuel : <strong>Starter</strong> — intégration Stripe à
                venir.
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
