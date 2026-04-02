"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { DashboardCommandPalette } from "@/components/dashboard/dashboard-command-palette";
import {
  DashboardHeaderTray,
  type HeaderNotification,
} from "@/components/dashboard/dashboard-header-tray";
import {
  dashboardNavItems,
  learnNavItem,
} from "@/components/dashboard/nav-config";
import {
  CreoIconClose,
  CreoIconMenu,
  CreoIconSearch,
  NavIconChevronSection,
  NavIconExit,
} from "@/components/icons/creo-nav-icons";
import { clearRememberPreferenceCookie } from "@/lib/supabase/auth-session-preference";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  userEmail: string;
  displayName: string;
  avatarUrl: string | null;
  notifications: HeaderNotification[];
  children: React.ReactNode;
};

/** DA type admin Shopify : barre sup #1a1a1a, rail #ebebeb, fond contenu #f6f6f7. */
export function DashboardShell({
  userEmail,
  displayName,
  avatarUrl,
  notifications,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const active = href.startsWith("/learn")
      ? pathname.startsWith("/learn")
      : href === "/dashboard"
        ? pathname === "/dashboard"
        : pathname === href || pathname.startsWith(`${href}/`);
    return (
      <Link
        href={href}
        prefetch
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-[13px] leading-snug transition-[background-color,color,box-shadow] duration-150",
          active
            ? "bg-white font-semibold text-black shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:bg-[#1a1a1a] dark:text-white dark:shadow-none dark:ring-1 dark:ring-white/[0.08]"
            : "font-normal text-[#4a4a4a] hover:bg-black/[0.035] dark:text-[#a3a3a3] dark:hover:bg-white/[0.06]"
        )}
      >
        <Icon
          className={cn(
            active
              ? "text-black dark:text-white"
              : "text-[#4a4a4a] dark:text-[#a3a3a3]"
          )}
        />
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </Link>
    );
  };

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearRememberPreferenceCookie();
    window.location.assign("/login");
  }

  const sidebarInner = (
    <>
      <div className="flex-1 overflow-y-auto px-2 pt-2 md:px-2.5 md:pt-3">
        <ul className="space-y-px">
          {dashboardNavItems.map((item) => (
            <li key={item.href}>
              <NavLink {...item} />
            </li>
          ))}
        </ul>

        <div className="mt-4 px-1">
          <div
            className="flex cursor-default items-center justify-between gap-2 py-2 pl-1.5 pr-1"
            role="presentation"
          >
            <span className="text-[12px] font-medium text-[#6d7175] dark:text-[#737373]">
              Formation & accès
            </span>
            <NavIconChevronSection className="text-[#b0b3b8] dark:text-[#525252]" />
          </div>
          <ul className="space-y-px">
            <li>
              <NavLink {...learnNavItem} />
            </li>
          </ul>
        </div>
      </div>

      <div className="shrink-0 border-t border-[#d2d5d8] bg-[#ebebeb] px-2 pb-3 pt-2 dark:border-[#1f1f1f] dark:bg-[#111111] md:px-2.5">
        <button
          type="button"
          onClick={() => void signOut()}
          className={cn(
            "flex w-full items-center gap-3 rounded-[10px] px-2.5 py-2.5 text-left text-[13px] leading-snug transition-[background-color,color] duration-150",
            "font-normal text-[#4a4a4a] hover:bg-black/[0.035] dark:text-[#a3a3a3] dark:hover:bg-white/[0.06]"
          )}
        >
          <NavIconExit />
          <span className="min-w-0 flex-1 truncate">Déconnexion</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="creo-dashboard-polaris flex min-h-screen flex-col bg-[#f6f6f7] text-[#202223] dark:bg-[#0b0b0b] dark:text-white">
      {/* Barre supérieure type Shopify */}
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-3 border-b border-black/10 bg-[#1a1a1a] px-3 dark:border-white/10 dark:bg-[#0a0a0a] md:gap-4 md:px-4">
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white/90 hover:bg-white/10 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label="Menu"
        >
          {mobileOpen ? (
            <CreoIconClose className="text-white/90" />
          ) : (
            <CreoIconMenu className="text-white/90" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setCommandOpen(true)}
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white/90 hover:bg-white/10 md:hidden"
          aria-label="Rechercher"
        >
          <CreoIconSearch className="text-white/90" />
        </button>

        <Link
          href="/dashboard"
          className="shrink-0 text-lg font-semibold tracking-tight text-white"
        >
          CRÉO
        </Link>

        <div className="relative mx-auto hidden min-w-0 flex-1 md:block md:max-w-xl">
          <button
            type="button"
            onClick={() => setCommandOpen(true)}
            className="relative flex h-9 w-full cursor-pointer items-center rounded-lg border-0 bg-white/10 pl-10 pr-16 text-left text-sm text-white/50 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.12] hover:text-white/70"
          >
            <CreoIconSearch className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35" />
            <span className="truncate">Rechercher…</span>
          </button>
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans text-[10px] font-medium text-white/45 sm:inline-block">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex min-w-0 items-center">
          <DashboardHeaderTray
            userEmail={userEmail}
            displayName={displayName}
            avatarUrl={avatarUrl}
            notifications={notifications}
          />
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 top-14 z-30 bg-black/40 backdrop-blur-sm dark:bg-black/60 md:hidden"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            "fixed left-0 top-14 z-40 flex h-[calc(100dvh-3.5rem)] w-[252px] flex-col border-r border-[#d2d5d8] bg-[#ebebeb] transition-transform duration-200 dark:border-[#1f1f1f] dark:bg-[#111111] md:static md:top-0 md:z-0 md:h-auto md:min-h-[calc(100dvh-3.5rem)] md:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="flex h-12 shrink-0 items-center border-b border-[#d2d5d8] bg-[#ebebeb] px-4 dark:border-[#1f1f1f] dark:bg-[#111111] md:hidden">
            <span className="text-[13px] font-semibold text-[#202223] dark:text-white">
              Menu
            </span>
          </div>
          <nav className="flex min-h-0 flex-1 flex-col">
            {sidebarInner}
          </nav>
        </aside>

        <main className="creo-dashboard-main flex min-h-0 min-w-0 flex-1 flex-col bg-[#f6f6f7] px-0 pb-2 pt-0 dark:bg-[#0b0b0b] md:pb-3">
          <div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-t-xl border border-[#e3e5e8] bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)] dark:border-[#262626] dark:bg-[#141414] dark:shadow-[0_1px_0_rgba(255,255,255,0.04)]">
            <div className="mx-auto min-h-0 w-full max-w-[1600px] flex-1 overflow-auto px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      <DashboardCommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
      />
    </div>
  );
}
