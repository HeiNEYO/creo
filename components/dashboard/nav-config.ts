import type { ComponentType } from "react";

import {
  NavIconAnalytics,
  NavIconCockpit,
  NavIconCourses,
  NavIconDocument,
  NavIconEmails,
  NavIconHelp,
  NavIconIntegrations,
  NavIconOrders,
  NavIconProfile,
  NavIconSite,
  NavIconSettings,
} from "@/components/icons/creo-nav-icons";
import { emailCrmRoutes } from "@/lib/email-crm/routes";
import { emailCrmSubnavItems } from "@/lib/email-crm/subnav";

export type NavIconComponent = ComponentType<{ className?: string }>;

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: NavIconComponent;
};

export type DashboardNavGroup = {
  kind: "group";
  id: string;
  label: string;
  icon: NavIconComponent;
  items: DashboardNavItem[];
};

export type DashboardNavEntry = DashboardNavItem | DashboardNavGroup;

export function isDashboardNavGroup(e: DashboardNavEntry): e is DashboardNavGroup {
  return "kind" in e && e.kind === "group";
}

/** Rail principal — Email & CRM : un seul point d’entrée ; les sous-pages sont des onglets dans la zone module. */
export const dashboardNavEntries: DashboardNavEntry[] = [
  { href: "/dashboard", label: "Accueil", icon: NavIconCockpit },
  { href: "/dashboard/pages", label: "Site", icon: NavIconSite },
  { href: "/dashboard/courses", label: "Formations", icon: NavIconCourses },
  { href: emailCrmRoutes.home, label: "Email & CRM", icon: NavIconEmails },
  { href: "/dashboard/integrations", label: "Intégrations", icon: NavIconIntegrations },
  { href: "/dashboard/analytics", label: "Analytics", icon: NavIconAnalytics },
  { href: "/dashboard/orders", label: "Commandes", icon: NavIconOrders },
  { href: "/dashboard/settings", label: "Paramètres", icon: NavIconSettings },
];

/** Liste plate pour la palette ⌘K (préfixe groupe). */
export function flattenDashboardNavForPalette(): {
  id: string;
  label: string;
  href: string;
  group: string;
}[] {
  const out: { id: string; label: string; href: string; group: string }[] = [];
  for (const e of dashboardNavEntries) {
    if (isDashboardNavGroup(e)) {
      for (const item of e.items) {
        out.push({
          id: `nav-${item.href}`,
          label: `${e.label} — ${item.label}`,
          href: item.href,
          group: e.label,
        });
      }
    } else {
      out.push({
        id: `nav-${e.href}`,
        label: e.label,
        href: e.href,
        group: "Navigation",
      });
    }
  }
  const seen = new Set(out.map((x) => x.href));
  for (const item of emailCrmSubnavItems) {
    if (seen.has(item.href)) {
      continue;
    }
    out.push({
      id: `nav-crm-${item.href}`,
      label: `Email & CRM — ${item.label}`,
      href: item.href,
      group: "Email & CRM",
    });
  }
  if (!seen.has("/aides")) {
    out.push({
      id: "nav-/aides",
      label: "Aide",
      href: "/aides",
      group: "Navigation",
    });
  }
  return out;
}

/** Icône pour la palette ⌘K et tout lien dashboard. */
export function resolveDashboardIcon(href: string): NavIconComponent {
  if (href === "/aides" || href.startsWith("/aides/")) {
    return NavIconHelp;
  }
  if (href.startsWith("/dashboard/email-crm")) {
    return NavIconEmails;
  }
  if (href.startsWith("/builder/")) {
    return NavIconDocument;
  }
  if (href.startsWith("/learn")) {
    return NavIconCourses;
  }
  if (href === "/dashboard/profile" || href.startsWith("/dashboard/profile/")) {
    return NavIconProfile;
  }
  if (href === "/dashboard/orders" || href.startsWith("/dashboard/orders/")) {
    return NavIconOrders;
  }
  for (const e of dashboardNavEntries) {
    if (isDashboardNavGroup(e)) {
      const items = [...e.items].sort((a, b) => b.href.length - a.href.length);
      for (const item of items) {
        if (href === item.href) {
          return item.icon;
        }
        if (
          item.href !== emailCrmRoutes.home &&
          href.startsWith(`${item.href}/`)
        ) {
          return item.icon;
        }
      }
    } else if (e.href === "/dashboard") {
      if (href === "/dashboard") {
        return e.icon;
      }
    } else if (href === e.href || href.startsWith(`${e.href}/`)) {
      return e.icon;
    }
  }
  return NavIconDocument;
}
