import Image from "next/image";
import type { ComponentType, SVGProps } from "react";
import {
  BookIcon,
  ChevronRightIcon,
  ExitIcon,
  MenuIcon,
  NotificationIcon,
  PageIcon,
  SearchIcon,
  XIcon,
} from "@shopify/polaris-icons";

import { cn } from "@/lib/utils";

type IconProps = { className?: string };

const nav = "size-[19px] shrink-0";
const header = "size-5 shrink-0";

/** Icônes du rail : non sélectionné — couleur + opacité 80 % (les PNG : CreoNavRasterIcon reçoit la classe en dernier). */
export const dashboardNavIconMutedClass =
  "text-black opacity-80 dark:text-white";

/** Texte des entrées du menu latéral (+0,2px sur 13px / 18px). */
export const dashboardNavEntryTextClass =
  "text-[calc(13px+0.2px)] leading-[calc(18px+0.2px)]";

/** Sources raster navigation (PNG distant, même jeu que le thème clair). */
const CREO_RASTER_HOME =
  "https://img.icons8.com/?size=100&id=z6m63h25vYs2&format=png&color=000000";
const CREO_RASTER_SITE =
  "https://img.icons8.com/?size=100&id=7gXZp7fqAo1J&format=png&color=000000";
const CREO_RASTER_COURSES =
  "https://img.icons8.com/?size=100&id=1JChCru7DwZr&format=png&color=000000";
const CREO_RASTER_CONTACTS =
  "https://img.icons8.com/?size=100&id=lCYw1uasYgD5&format=png&color=000000";
const CREO_RASTER_EMAIL =
  "https://img.icons8.com/?size=100&id=6025lvBAJ0M6&format=png&color=000000";
/** Intégrations — cube isométrique (Icons8) */
const CREO_RASTER_INTEGRATIONS =
  "https://img.icons8.com/?size=100&id=JB4P6J4ORU2v&format=png&color=000000";
/** Analytics — Pulsar Line (Icons8), même famille que commandes / intégrations */
const CREO_RASTER_ANALYTICS =
  "https://img.icons8.com/?size=100&id=tTIl1sEbXudG&format=png&color=000000";
/** Add Shopping Cart — Icons8 Pulsar Line (eLKhCNc6SMdl) */
const CREO_RASTER_ORDERS =
  "https://img.icons8.com/?size=100&id=eLKhCNc6SMdl&format=png&color=000000";
const CREO_RASTER_SETTINGS =
  "https://img.icons8.com/?size=100&id=UCX4DI82AU0H&format=png&color=000000";
const CREO_RASTER_PROFILE =
  "https://img.icons8.com/?size=100&id=15265&format=png&color=000000";
/** Aide — bulle + ? (Icons8) */
const CREO_RASTER_HELP =
  "https://img.icons8.com/?size=100&id=NA8QqPrMsofO&format=png&color=000000";

function CreoNavRasterIcon({ src, className }: IconProps & { src: string }) {
  return (
    <Image
      src={src}
      alt=""
      width={19}
      height={19}
      className={cn(
        nav,
        "object-contain opacity-100 transition-[opacity,filter] duration-150",
        /* Actif (clair) : teinte proche de #2563eb */
        "group-data-[nav-active]:[filter:invert(37%)_sepia(98%)_saturate(2842%)_hue-rotate(211deg)_brightness(101%)_contrast(92%)]",
        "dark:invert dark:brightness-110",
        className
      )}
      aria-hidden
    />
  );
}

function wrap(
  Icon: ComponentType<SVGProps<SVGSVGElement>>,
  sizeClass: string
) {
  return function PolarisNavIcon({ className }: IconProps) {
    return (
      <Icon
        className={cn(
          sizeClass,
          "text-current [&_path]:fill-current [&_path]:stroke-none",
          className
        )}
        aria-hidden
        focusable={false}
      />
    );
  };
}

/** Accueil (dashboard) */
export function NavIconCockpit({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_HOME} className={className} />;
}

/** Site (pages publiées / builder) */
export function NavIconSite({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_SITE} className={className} />;
}

/** Formations */
export function NavIconCourses({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_COURSES} className={className} />;
}

/** Contacts */
export function NavIconContacts({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_CONTACTS} className={className} />;
}

/** Emails */
export function NavIconEmails({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_EMAIL} className={className} />;
}

/** Intégrations */
export function NavIconIntegrations({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_INTEGRATIONS} className={className} />;
}

/** Analytics */
export function NavIconAnalytics({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_ANALYTICS} className={className} />;
}

/** Commandes */
export function NavIconOrders({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_ORDERS} className={className} />;
}

/** Paramètres */
export function NavIconSettings({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_SETTINGS} className={className} />;
}

/** Espace membre / lecture */
export const NavIconLearn = wrap(BookIcon, nav);

/** Aide / documentation (lien vers /aides) */
export function NavIconHelp({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_HELP} className={className} />;
}

/** Section rail */
export const NavIconChevronSection = wrap(ChevronRightIcon, "size-3.5 shrink-0");

/** Résultats pages (palette) */
export const NavIconDocument = wrap(PageIcon, "size-4 shrink-0");

export const CreoIconSearch = wrap(SearchIcon, header);
export const CreoIconMenu = wrap(MenuIcon, header);
export const CreoIconClose = wrap(XIcon, header);
export const CreoIconBell = wrap(NotificationIcon, header);

/** Mon profil */
export function NavIconProfile({ className }: IconProps) {
  return <CreoNavRasterIcon src={CREO_RASTER_PROFILE} className={className} />;
}

/** Déconnexion (bas du rail) */
export const NavIconExit = wrap(ExitIcon, nav);
