"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  dashboardNavItems,
  learnNavItem,
} from "@/components/dashboard/nav-config";
import { cn } from "@/lib/utils";

const listVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.04, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  show: { opacity: 1, x: 0 },
};

type DashboardShellProps = {
  userEmail: string;
  children: React.ReactNode;
};

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
          "flex items-center gap-3 rounded-creo-md px-3 py-2 text-creo-sm font-medium transition-colors",
          active
            ? "bg-creo-purple-pale text-creo-purple"
            : "text-creo-gray-700 hover:bg-creo-gray-100"
        )}
      >
        <Icon className="size-4 shrink-0 opacity-80" />
        {label}
      </Link>
    );
  };

  const sidebarInner = (
    <>
      <div className="flex h-14 items-center border-b border-creo-gray-200 px-4">
        <Link
          href="/dashboard"
          className="text-lg font-semibold tracking-tight text-creo-purple"
        >
          CRÉO
        </Link>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        <motion.ul
          className="space-y-1"
          variants={listVariants}
          initial="hidden"
          animate="show"
        >
          {dashboardNavItems.map((item) => (
            <motion.li key={item.href} variants={itemVariants}>
              <NavLink {...item} />
            </motion.li>
          ))}
          <motion.li variants={itemVariants} className="pt-2">
            <div className="my-2 border-t border-creo-gray-100" />
            <NavLink {...learnNavItem} />
          </motion.li>
        </motion.ul>
      </nav>
    </>
  );

  return (
    <div className="min-h-screen bg-creo-gray-50">
      {/* Mobile overlay */}
      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
          aria-label="Fermer le menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-56 flex-col border-r border-creo-gray-200 bg-creo-white transition-transform duration-200 md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {sidebarInner}
      </aside>

      <div className="md:pl-56">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-creo-gray-200 bg-creo-white/95 px-4 backdrop-blur-sm md:px-6">
          <button
            type="button"
            className="flex size-9 items-center justify-center rounded-creo-md border border-creo-gray-200 md:hidden"
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label="Menu"
          >
            {mobileOpen ? (
              <X className="size-4" />
            ) : (
              <Menu className="size-4" />
            )}
          </button>
          <div className="hidden flex-1 md:block" />
          <div className="flex items-center gap-3">
            <span className="hidden max-w-[220px] truncate text-creo-sm text-creo-gray-500 sm:inline">
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
