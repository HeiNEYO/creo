"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";

import {
  dashboardNavEntryTextClass,
  dashboardNavIconMutedClass,
  NavIconSettings,
} from "@/components/icons/creo-nav-icons";
import {
  resolveSettingsSectionId,
  settingsSectionGroups,
} from "@/components/dashboard/settings/settings-sections-config";
import { cn } from "@/lib/utils";

type Props = {
  onNavigate?: () => void;
};

/**
 * Une seule zone cliquable (icône + libellé + +) : déplie/replie ;
 * le + pivote en croix ; sous-menu avec animation grid (0fr → 1fr).
 */
export function DashboardSettingsNavExpandable({ onNavigate }: Props) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isSettingsRoute = pathname.startsWith("/dashboard/settings");
  const activeSection = resolveSettingsSectionId(
    searchParams.get("section") ?? undefined,
  );

  const [open, setOpen] = useState(isSettingsRoute);
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (isSettingsRoute) {
      setOpen(true);
    }
  }, [isSettingsRoute]);

  useEffect(() => {
    const prev = prevPathRef.current;
    prevPathRef.current = pathname;
    if (
      prev.startsWith("/dashboard/settings") &&
      !pathname.startsWith("/dashboard/settings")
    ) {
      setOpen(false);
    }
  }, [pathname]);

  const parentActive = isSettingsRoute;

  return (
    <div className="space-y-0">
      <button
        type="button"
        id="settings-nav-trigger"
        onClick={() => setOpen((o) => !o)}
        {...(parentActive ? { "data-nav-active": "" } : {})}
        aria-expanded={open}
        aria-controls="settings-subnav-panel"
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition-[background-color,color] duration-200 ease-out",
          dashboardNavEntryTextClass,
          parentActive
            ? "bg-[#eff6ff] font-semibold text-[#2563eb] dark:bg-[var(--creo-surface-raised)] dark:text-[var(--creo-blue-readable)]"
            : "font-normal text-black hover:bg-[#f3f4f6] dark:text-white dark:hover:bg-white/[0.06]",
        )}
      >
        <NavIconSettings
          className={cn(!parentActive && dashboardNavIconMutedClass)}
        />
        <span className="min-w-0 flex-1 truncate">Paramètres</span>
        <Plus
          strokeWidth={2}
          className={cn(
            "size-[15px] shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] motion-reduce:transition-none",
            parentActive
              ? "text-[#2563eb] opacity-100 dark:text-[var(--creo-blue-readable)]"
              : dashboardNavIconMutedClass,
            open && "rotate-45",
          )}
          aria-hidden
        />
      </button>

      <div
        id="settings-subnav-panel"
        role="region"
        aria-labelledby="settings-nav-trigger"
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pb-0.5 pl-1 pt-2">
            <ul className="ml-2 space-y-0.5 border-l border-[#e5e7eb] pl-3 dark:border-white/[0.12]">
              {settingsSectionGroups.map((group, gi) => (
                <Fragment key={group.title}>
                  {gi > 0 ? (
                    <li className="list-none py-1.5" role="separator" aria-hidden>
                      <div className="h-px w-full bg-black/[0.08] dark:bg-white/[0.08]" />
                    </li>
                  ) : null}
                  {group.items.map((item) => {
                    const active = activeSection === item.id;
                    return (
                      <li key={item.id}>
                        <Link
                          href={`/dashboard/settings?section=${item.id}`}
                          prefetch
                          onClick={() => onNavigate?.()}
                          aria-current={active ? "page" : undefined}
                          className={cn(
                            "block w-full rounded-lg py-1.5 pl-2 pr-2 text-left transition-colors duration-150",
                            dashboardNavEntryTextClass,
                            active
                              ? "bg-[#eff6ff] font-semibold text-[#2563eb] dark:bg-[var(--creo-surface-raised)] dark:text-[var(--creo-blue-readable)]"
                              : "font-normal text-black hover:bg-[#f3f4f6] dark:text-white dark:hover:bg-white/[0.06]",
                          )}
                        >
                          <span className="min-w-0 truncate">{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </Fragment>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
