import type { LucideProps } from "lucide-react";
import {
  AppWindow,
  BarChart3,
  Bell,
  Book,
  BookOpen,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Mail,
  Menu,
  Search,
  Settings,
  UserCircle,
  Users,
  X,
} from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import { cn } from "@/lib/utils";

type IconProps = { className?: string };

type LucideComp = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

/** Traits plus lisibles que le défaut Lucide (2) — icônes contour, intérieur vide */
const NAV_STROKE = 2.75;
const HEADER_STROKE = 2.75;
const CHEVRON_STROKE = 2.75;

const nav = "size-5 shrink-0";
const header = "size-5 shrink-0";

function wrapLucide(
  Icon: LucideComp,
  sizeClass: string,
  strokeWidth: number
) {
  return function CreoNavIcon({ className }: IconProps) {
    return (
      <Icon
        className={cn(sizeClass, className)}
        strokeWidth={strokeWidth}
        fill="none"
        aria-hidden
        focusable={false}
      />
    );
  };
}

/** Cockpit */
export const NavIconCockpit = wrapLucide(Home, nav, NAV_STROKE);

/** Questionnaire */
export const NavIconQuestionnaire = wrapLucide(ClipboardList, nav, NAV_STROKE);

/** Pages */
export const NavIconPages = wrapLucide(FileText, nav, NAV_STROKE);

/** Formations */
export const NavIconCourses = wrapLucide(BookOpen, nav, NAV_STROKE);

/** Contacts */
export const NavIconContacts = wrapLucide(Users, nav, NAV_STROKE);

/** Emails */
export const NavIconEmails = wrapLucide(Mail, nav, NAV_STROKE);

/** Intégrations */
export const NavIconIntegrations = wrapLucide(AppWindow, nav, NAV_STROKE);

/** Analytics */
export const NavIconAnalytics = wrapLucide(BarChart3, nav, NAV_STROKE);

/** Paramètres */
export const NavIconSettings = wrapLucide(Settings, nav, NAV_STROKE);

/** Espace membre */
export const NavIconLearn = wrapLucide(Book, nav, NAV_STROKE);

/** Section rail */
export const NavIconChevronSection = wrapLucide(
  ChevronRight,
  "size-4 shrink-0",
  CHEVRON_STROKE
);

/** Résultats pages (palette) */
export const NavIconDocument = wrapLucide(FileText, "size-[18px] shrink-0", NAV_STROKE);

export const CreoIconSearch = wrapLucide(Search, header, HEADER_STROKE);
export const CreoIconMenu = wrapLucide(Menu, header, HEADER_STROKE);
export const CreoIconClose = wrapLucide(X, header, HEADER_STROKE);
export const CreoIconBell = wrapLucide(Bell, header, HEADER_STROKE);

/** Profil (sidebar) */
export const NavIconProfile = wrapLucide(UserCircle, nav, NAV_STROKE);

/** Déconnexion */
export const NavIconExit = wrapLucide(LogOut, nav, NAV_STROKE);
