"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { DashboardCommandPalette } from "@/components/dashboard/dashboard-command-palette";
import { DashboardSettingsNavExpandable } from "@/components/dashboard/dashboard-settings-nav-expandable";
import {
  dashboardNavEntries,
  isDashboardNavGroup,
} from "@/components/dashboard/nav-config";
import { emailCrmRoutes } from "@/lib/email-crm/routes";
import { DashboardSidebarProfile } from "@/components/dashboard/dashboard-sidebar-profile";
import {
  CreoIconClose,
  CreoIconMenu,
  dashboardNavEntryTextClass,
  dashboardNavIconMutedClass,
  NavIconHelp,
} from "@/components/icons/creo-nav-icons";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  userEmail: string;
  displayName: string;
  avatarUrl: string | null;
  children: React.ReactNode;
};

/** Menu --creo-dashboard-chrome ; contenu --creo-dashboard-canvas. Marque CRÉO dans la colonne gauche. */
export function DashboardShell({
  userEmail,
  displayName,
  avatarUrl,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const isSettingsRoute = pathname.startsWith("/dashboard/settings");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

  function closeMainNav() {
    setMobileOpen(false);
  }

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

  function navLinkActive(href: string): boolean {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === emailCrmRoutes.home) {
      return (
        pathname === emailCrmRoutes.home ||
        pathname.startsWith(`${emailCrmRoutes.home}/`)
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  const NavLink = ({
    href,
    label,
    icon: Icon,
  }: {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }) => {
    const active = navLinkActive(href);
    return (
      <Link
        href={href}
        prefetch
        onClick={() => closeMainNav()}
        {...(active ? { "data-nav-active": "" } : {})}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 transition-[background-color,color] duration-150",
          dashboardNavEntryTextClass,
          active
            ? "bg-[#eff6ff] font-semibold text-[#2563eb] dark:bg-[var(--creo-surface-raised)] dark:text-[var(--creo-blue-readable)]"
            : "font-normal text-black hover:bg-[#f3f4f6] dark:text-white dark:hover:bg-white/[0.06]"
        )}
      >
        <Icon
          className={cn(!active && dashboardNavIconMutedClass)}
        />
        <span className="min-w-0 flex-1 truncate">{label}</span>
      </Link>
    );
  };

  const sidebarInner = (
    <>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2 pt-2 md:px-2.5 md:pb-3 md:pt-2">
        <ul className="space-y-0.5">
          {dashboardNavEntries.map((entry) => {
            if (isDashboardNavGroup(entry)) {
              const GroupIcon = entry.icon;
              return (
                <li key={entry.id} className="mb-1.5 space-y-0.5">
                  <div className="flex items-center gap-2 px-2 pb-0.5 pt-1 text-[calc(12px+0.2px)] font-semibold uppercase leading-[calc(16px+0.2px)] tracking-wide text-black dark:text-white">
                    <GroupIcon className={cn("size-[15px]", dashboardNavIconMutedClass)} />
                    <span className="truncate">{entry.label}</span>
                  </div>
                  <ul className="space-y-0.5 border-l border-[#e5e7eb] pl-2 dark:border-white/[0.08]">
                    {entry.items.map((item) => (
                      <li key={item.href}>
                        <NavLink {...item} />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }
            if (entry.href === "/dashboard/settings") {
              return (
                <li key={entry.href}>
                  <Suspense
                    fallback={
                      <div className="h-9 animate-pulse rounded-lg bg-black/[0.04] dark:bg-white/[0.06]" />
                    }
                  >
                    <DashboardSettingsNavExpandable onNavigate={closeMainNav} />
                  </Suspense>
                </li>
              );
            }
            return (
              <li key={entry.href}>
                <NavLink {...entry} />
              </li>
            );
          })}
        </ul>
      </div>
    </>
  );

  return (
    <div className="creo-dashboard-polaris flex min-h-[100dvh] flex-col bg-[var(--creo-dashboard-canvas)] text-[#202223] dark:bg-[var(--creo-surface-app)] dark:text-[var(--foreground)]">
      <button
        type="button"
        className="fixed left-3 top-3 z-40 flex size-9 items-center justify-center rounded-lg border border-black/[0.08] bg-[var(--creo-dashboard-chrome)] text-[#202223] shadow-sm hover:bg-[#f3f4f6] md:hidden dark:border-white/[0.12] dark:bg-black dark:text-white dark:hover:bg-white/[0.08]"
        onClick={() => setMobileOpen((o) => !o)}
        aria-expanded={mobileOpen}
        aria-label="Menu"
      >
        {mobileOpen ? (
          <CreoIconClose className="size-5 text-current" />
        ) : (
          <CreoIconMenu className="size-5 text-current" />
        )}
      </button>

      <div className="relative flex min-h-0 flex-1 items-stretch bg-[var(--creo-dashboard-canvas)] dark:bg-black">
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/45 dark:bg-black/75 md:hidden"
            aria-label="Fermer le menu"
            onClick={() => closeMainNav()}
          />
        ) : null}

        <aside
          className={cn(
            "fixed left-0 top-0 z-50 flex h-[100dvh] w-[252px] flex-col overflow-hidden border-r border-[#e5e7eb] bg-[var(--creo-dashboard-chrome)] shadow-xl transition-transform duration-200 dark:border-white/[0.09] dark:bg-black",
            "md:sticky md:top-0 md:z-0 md:h-[100dvh] md:shrink-0 md:shadow-none",
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          )}
        >
          <div className="flex shrink-0 items-center border-b border-black/[0.08] bg-[var(--creo-dashboard-chrome)] px-3 py-3 dark:border-white/[0.08] dark:bg-black md:px-3.5 md:py-3.5">
            <Link
              href="/dashboard"
              onClick={() => closeMainNav()}
              className="text-lg font-semibold tracking-tight text-[#202223] dark:text-white"
            >
              CRÉO
            </Link>
          </div>

          <nav className="flex min-h-0 min-w-0 flex-1 flex-col">
            {sidebarInner}
            <div className="shrink-0 border-t border-black/[0.08] bg-[var(--creo-dashboard-chrome)] dark:border-white/[0.08] dark:bg-black">
              <div className="px-2 pb-1 pt-2 md:px-2.5 md:pt-2.5">
                <NavLink href="/aides" label="Aide" icon={NavIconHelp} />
              </div>
              <DashboardSidebarProfile
                displayName={displayName}
                userEmail={userEmail}
                avatarUrl={avatarUrl}
                onNavigate={closeMainNav}
              />
            </div>
          </nav>
        </aside>

        <main className="creo-dashboard-main flex min-h-[100dvh] min-w-0 flex-1 flex-col bg-[var(--creo-dashboard-canvas)] px-0 pb-2 pt-0 dark:bg-[var(--creo-surface-app)] max-md:pl-14 max-md:pt-14 md:rounded-tl-[28px] md:pb-3 md:pl-0 md:pt-0">
          <div className="flex min-h-full w-full flex-1 flex-col rounded-none border-0 bg-transparent shadow-none dark:bg-transparent dark:shadow-none">
            <div
              className={cn(
                "mx-auto w-full flex-1 py-5 md:py-6",
                isSettingsRoute
                  ? "max-w-none px-3 py-5 sm:px-4 md:px-5 md:py-6 lg:px-6 xl:px-8"
                  : "max-w-[1600px] px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8",
              )}
            >
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
