import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const integrations = [
  {
    name: "Meta Ads",
    desc: "Pixels, conversions, audiences.",
    section: "Publicité",
    connected: true,
  },
  {
    name: "Stripe",
    desc: "Paiements et abonnements.",
    section: "Vente",
    connected: false,
  },
  {
    name: "Zapier",
    desc: "Automatise avec 5000+ apps.",
    section: "Automation",
    connected: false,
  },
  {
    name: "Slack",
    desc: "Notifications équipe.",
    section: "Communication",
    connected: false,
  },
];

export default function IntegrationsPage() {
  return (
    <>
      <PageHeader
        title="Intégrations"
        description="Connecte tes outils préférés"
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {integrations.map((i) => (
          <Card key={i.name} className="p-5">
            <div className="flex size-10 items-center justify-center rounded-creo-md bg-creo-gray-100 text-creo-sm font-medium text-creo-gray-600 dark:text-muted-foreground">
              {i.name.slice(0, 2)}
            </div>
            <h3 className="mt-4 text-creo-md font-semibold">{i.name}</h3>
            <p className="mt-1 text-creo-sm text-creo-gray-500">{i.desc}</p>
            <p className="mt-2 text-creo-xs text-creo-gray-400">{i.section}</p>
            <div className="mt-4 flex items-center justify-between">
              <Badge variant={i.connected ? "green" : "gray"}>
                {i.connected ? "Connecté" : "Non connecté"}
              </Badge>
              <Button type="button" size="sm" variant="outline">
                {i.connected ? "Configurer" : "Connecter"}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
