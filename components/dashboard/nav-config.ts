import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Mail,
  Puzzle,
  Rocket,
  Settings,
  Users,
  FileStack,
} from "lucide-react";

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const dashboardNavItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Cockpit", icon: LayoutDashboard },
  { href: "/dashboard/onboarding", label: "Onboarding", icon: Rocket },
  { href: "/dashboard/pages", label: "Pages", icon: FileStack },
  { href: "/dashboard/courses", label: "Formations", icon: GraduationCap },
  { href: "/dashboard/contacts", label: "Contacts", icon: Users },
  { href: "/dashboard/emails", label: "Emails", icon: Mail },
  { href: "/dashboard/integrations", label: "Intégrations", icon: Puzzle },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
];

/** Espace élève (aperçu) */
export const learnNavItem: DashboardNavItem = {
  href: "/learn/demo",
  label: "Espace membre (démo)",
  icon: BookOpen,
};
