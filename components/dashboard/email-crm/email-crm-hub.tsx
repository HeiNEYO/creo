import Link from "next/link";
import {
  Users,
  Tag,
  Mail,
  GitBranch,
  BarChart3,
  Settings,
  Workflow,
  LayoutTemplate,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { emailCrmRoutes } from "@/lib/email-crm/routes";
import type { MarketingOverviewStats } from "@/lib/marketing/get-marketing-overview-stats";

type Props = {
  stats: MarketingOverviewStats | null;
};

const sections: {
  href: string;
  title: string;
  description: string;
  icon: typeof Users;
}[] = [
  {
    href: emailCrmRoutes.contacts,
    title: "Contacts",
    description: "Base centralisée : recherche, tags, export, fiche détaillée.",
    icon: Users,
  },
  {
    href: emailCrmRoutes.tags,
    title: "Tags",
    description: "Étiquettes partagées pour segmenter comme sur un CRM marketing.",
    icon: Tag,
  },
  {
    href: emailCrmRoutes.segments,
    title: "Segments",
    description: "Audiences dynamiques à partir de règles (MVP JSON).",
    icon: GitBranch,
  },
  {
    href: emailCrmRoutes.campaigns,
    title: "Campagnes",
    description: "Envoi ponctuel : HTML, éditeur visuel, test et diffusion.",
    icon: Mail,
  },
  {
    href: emailCrmRoutes.sequences,
    title: "Automatisations",
    description: "Séquences multi-envois (scénarios — éditeur d’étapes à venir).",
    icon: Workflow,
  },
  {
    href: emailCrmRoutes.conception,
    title: "Modèles d'email",
    description: "Bibliothèque et brouillons pour réutiliser tes mises en page.",
    icon: LayoutTemplate,
  },
  {
    href: emailCrmRoutes.statistics,
    title: "Statistiques",
    description: "Suivi des événements et des envois par campagne.",
    icon: BarChart3,
  },
  {
    href: emailCrmRoutes.settings,
    title: "Paramètres",
    description: "Expéditeur, opt-in, pages légales liées au CRM.",
    icon: Settings,
  },
];

export function EmailCrmHub({ stats }: Props) {
  return (
    <>
      {stats ? (
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="flex items-center gap-3 p-4">
            <Users className="size-5 shrink-0 text-creo-purple" aria-hidden />
            <div>
              <p className="text-creo-xs uppercase tracking-wide text-creo-gray-500">
                Contacts
              </p>
              <p className="text-xl font-semibold tabular-nums dark:text-white">
                {stats.contactCount}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <Tag className="size-5 shrink-0 text-creo-purple" aria-hidden />
            <div>
              <p className="text-creo-xs uppercase tracking-wide text-creo-gray-500">
                Tags distincts
              </p>
              <p className="text-xl font-semibold tabular-nums dark:text-white">
                {stats.distinctTagCount}
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <Mail className="size-5 shrink-0 text-creo-purple" aria-hidden />
            <div className="min-w-0">
              <p className="text-creo-xs uppercase tracking-wide text-creo-gray-500">
                Campagnes (envoi)
              </p>
              <p className="text-xl font-semibold tabular-nums dark:text-white">
                {stats.campaignCount}
              </p>
              <p className="mt-1 text-creo-xs text-creo-gray-500">
                Modèles :{" "}
                <span className="font-medium tabular-nums text-creo-gray-700 dark:text-creo-gray-400">
                  {stats.templateCount}
                </span>
              </p>
            </div>
          </Card>
          <Card className="flex items-center gap-3 p-4">
            <GitBranch className="size-5 shrink-0 text-creo-purple" aria-hidden />
            <div>
              <p className="text-creo-xs uppercase tracking-wide text-creo-gray-500">
                Séquences actives
              </p>
              <p className="text-xl font-semibold tabular-nums dark:text-white">
                {stats.activeSequenceCount}
                <span className="text-creo-sm font-normal text-creo-gray-500">
                  {" "}
                  / {stats.sequenceCount}
                </span>
              </p>
            </div>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {sections.map(({ href, title, description, icon: Icon }) => (
          <Link key={href} href={href} prefetch>
            <Card className="h-full p-5 transition-[box-shadow,background-color] hover:shadow-md dark:hover:bg-[var(--creo-surface-raised)]">
              <div className="flex gap-4">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-creo-purple-pale dark:bg-creo-purple-pale/30">
                  <Icon className="size-5 text-creo-purple" aria-hidden />
                </div>
                <div className="min-w-0">
                  <h2 className="font-semibold text-[#202223] dark:text-white">{title}</h2>
                  <p className="mt-1 text-creo-sm text-creo-gray-500">{description}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
