"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  dashboardNavItems,
  learnNavItem,
} from "@/components/dashboard/nav-config";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  userEmail: string;
  children: React.ReactNode;
};

/** DA type admin Shopify : barre sup #1a1a1a, rail #f1f1f1, fond contenu #f6f6f7. */
export function DashboardShell({ userEmail, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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
        onClick={() => setMobileOpen(false)}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-creo-sm transition-colors",
          active
            ? "bg-white font-semibold text-[#202223] shadow-sm ring-1 ring-black/[0.06]"
            : "font-medium text-[#616161] hover:bg-black/[0.04]"
        )}
      >
        <Icon
          className={cn(
            "size-4 shrink-0",
            active ? "text-[#202223]" : "text-[#616161]"
          )}
        />
        {label}
      </Link>
    );
  };

  const sidebarInner = (
    <>
      <nav className="flex-1 overflow-y-auto p-3 pt-2 md:pt-4">
        <ul className="space-y-0.5">
          {dashboardNavItems.map((item) => (
            <li key={item.href}>
              <NavLink {...item} />
            </li>
          ))}
          <li className="pt-3">
            <div className="my-2 border-t border-[#e3e5e8]" />
            <NavLink {...learnNavItem} />
          </li>
        </ul>
      </nav>
    </>
  );

  return (
    <div className="creo-dashboard-polaris flex min-h-screen flex-col bg-[#f6f6f7] text-[#202223]">
      {/* Barre supérieure type Shopify */}
      <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-3 border-b border-black/10 bg-[#1a1a1a] px-3 md:gap-4 md:px-4">
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-lg text-white/90 hover:bg-white/10 md:hidden"
          onClick={() => setMobileOpen((o) => !o)}
          aria-expanded={mobileOpen}
          aria-label="Menu"
        >
          {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>

        <Link
          href="/dashboard"
          className="shrink-0 text-lg font-semibold tracking-tight text-white"
        >
          CRÉO
        </Link>

        <div className="relative mx-auto hidden min-w-0 flex-1 md:block md:max-w-xl">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/35"
            aria-hidden
          />
          <input
            type="search"
            readOnly
            placeholder="Rechercher"
            className="h-9 w-full cursor-default rounded-lg border-0 bg-white/10 pl-10 pr-16 text-sm text-white placeholder:text-white/40 outline-none ring-1 ring-inset ring-white/10"
            aria-label="Rechercher (bientôt disponible)"
          />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans text-[10px] font-medium text-white/45 sm:inline-block">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="hidden min-w-0 flex-col items-end text-right sm:flex">
            <span className="max-w-[200px] truncate text-xs text-white/85">
              Mon espace
            </span>
            <span className="max-w-[200px] truncate text-[11px] text-white/50">
              {userEmail}
            </span>
          </div>
          <SignOutButton tone="onDark" />
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1">
        {mobileOpen ? (
          <button
            type="button"
            className="fixed inset-0 top-14 z-30 bg-black/40 backdrop-blur-sm md:hidden"
            aria-label="Fermer le menu"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <aside
          className={cn(
            "fixed left-0 top-14 z-40 flex h-[calc(100dvh-3.5rem)] w-[240px] flex-col border-r border-[#e3e5e8] bg-[#f1f1f1] transition-transform duration-200 md:static md:top-0 md:z-0 md:h-auto md:min-h-[calc(100dvh-3.5rem)] md:translate-x-0",
            mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <div className="flex h-12 items-center border-b border-[#e3e5e8] px-4 md:hidden">
            <span className="text-creo-sm font-semibold text-[#202223]">
              Navigation
            </span>
          </div>
          {sidebarInner}
        </aside>

        <main className="min-w-0 flex-1 p-4 md:p-6 lg:p-8">
          <div className="mx-auto max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
