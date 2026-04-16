"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { emailCrmRoutes } from "@/lib/email-crm/routes";
import { emailCrmSubnavItems } from "@/lib/email-crm/subnav";
import { cn } from "@/lib/utils";

function isSubnavActive(href: string, pathname: string): boolean {
  if (href === emailCrmRoutes.home) {
    return pathname === emailCrmRoutes.home;
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function EmailCrmSubnav() {
  const pathname = usePathname();

  return (
    <div className="-mx-4 mb-6 md:-mx-6 lg:-mx-8 pl-4 pr-4 md:pl-6 md:pr-6 lg:pl-8 lg:pr-8">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-creo-gray-500 dark:text-creo-gray-500">
        Email &amp; CRM
      </p>
      <nav
        aria-label="Sections Email et CRM"
        className="overflow-x-auto border-b border-creo-gray-200 dark:border-white/10"
      >
        <ul className="-mb-px flex min-w-0 gap-0">
          {emailCrmSubnavItems.map((item) => {
            const active = isSubnavActive(item.href, pathname);
            return (
              <li key={item.href} className="flex shrink-0 items-stretch">
                {item.sectionStart ? (
                  <span
                    className="my-2.5 w-px shrink-0 bg-creo-gray-200 dark:bg-white/10"
                    aria-hidden
                  />
                ) : null}
                <Link
                  href={item.href}
                  prefetch
                  className={cn(
                    "block whitespace-nowrap border-b-2 px-2.5 py-2.5 text-[15px] font-medium leading-[1.5] transition-colors sm:px-3 md:px-4",
                    active
                      ? "border-creo-purple text-creo-purple dark:border-creo-purple dark:text-creo-purple"
                      : "border-transparent text-creo-gray-600 hover:text-creo-gray-900 dark:text-creo-gray-400 dark:hover:text-white"
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}
