import type { ComponentType } from "react";

import {
  NavIconAnalytics,
  NavIconCockpit,
  NavIconContacts,
  NavIconCourses,
  NavIconDocument,
  NavIconEmails,
  NavIconIntegrations,
  NavIconLearn,
  NavIconQuestionnaire,
  NavIconPages,
  NavIconProfile,
  NavIconSettings,
} from "@/components/icons/creo-nav-icons";

export type NavIconComponent = ComponentType<{ className?: string }>;

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: NavIconComponent;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Cockpit", icon: NavIconCockpit },
  { href: "/dashboard/questionnaire", label: "Questionnaire", icon: NavIconQuestionnaire },
  { href: "/dashboard/pages", label: "Pages", icon: NavIconPages },
  { href: "/dashboard/courses", label: "Formations", icon: NavIconCourses },
  { href: "/dashboard/contacts", label: "Contacts", icon: NavIconContacts },
  { href: "/dashboard/emails", label: "Emails", icon: NavIconEmails },
  { href: "/dashboard/integrations", label: "Intégrations", icon: NavIconIntegrations },
  { href: "/dashboard/analytics", label: "Analytics", icon: NavIconAnalytics },
  { href: "/dashboard/profile", label: "Mon profil", icon: NavIconProfile },
  { href: "/dashboard/settings", label: "Paramètres", icon: NavIconSettings },
];

/** Espace élève (aperçu) */
export const learnNavItem: DashboardNavItem = {
  href: "/learn/demo",
  label: "Espace membre (démo)",
  icon: NavIconLearn,
};

const allNav = [...dashboardNavItems, learnNavItem];

/** Icône pour la palette ⌘K et tout lien dashboard. */
export function resolveDashboardIcon(href: string): NavIconComponent {
  const exact = allNav.find((i) => i.href === href);
  if (exact) {
    return exact.icon;
  }
  if (href.startsWith("/builder/")) {
    return NavIconDocument;
  }
  const prefix = allNav.find(
    (i) => i.href !== "/dashboard" && href.startsWith(`${i.href}/`)
  );
  if (prefix) {
    return prefix.icon;
  }
  return NavIconDocument;
}
