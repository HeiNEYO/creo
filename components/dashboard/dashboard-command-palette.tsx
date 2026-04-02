"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Loader2, Search } from "lucide-react";

import {
  dashboardNavItems,
  learnNavItem,
} from "@/components/dashboard/nav-config";
import { cn } from "@/lib/utils";

type PaletteItem = {
  id: string;
  label: string;
  href: string;
  group: string;
};

type DashboardCommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

async function fetchSearchPages(): Promise<{ id: string; title: string }[]> {
  const res = await fetch("/api/dashboard/search-pages", {
    credentials: "same-origin",
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { pages?: { id: string; title: string }[] };
  return data.pages ?? [];
}

export function DashboardCommandPalette({
  open,
  onOpenChange,
}: DashboardCommandPaletteProps) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const [remotePages, setRemotePages] = useState<
    { id: string; title: string }[] | null
  >(null);
  const [pagesLoading, setPagesLoading] = useState(false);
  const fetchStartedRef = useRef(false);

  const loadPages = useCallback(async () => {
    if (remotePages !== null || fetchStartedRef.current) return;
    fetchStartedRef.current = true;
    setPagesLoading(true);
    try {
      const pages = await fetchSearchPages();
      setRemotePages(pages);
    } catch {
      setRemotePages([]);
    } finally {
      setPagesLoading(false);
    }
  }, [remotePages]);

  /* Préchargement discret après le premier rendu (palette plus réactive au ⌘K). */
  useEffect(() => {
    const run = () => {
      void loadPages();
    };
    if (typeof window === "undefined") return;
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = globalThis.setTimeout(run, 2500);
    return () => globalThis.clearTimeout(id);
  }, [loadPages]);

  useEffect(() => {
    if (open) {
      void loadPages();
    }
  }, [open, loadPages]);

  const items = useMemo<PaletteItem[]>(() => {
    const pageList = remotePages ?? [];
    const nav: PaletteItem[] = [
      ...dashboardNavItems.map((i) => ({
        id: `nav-${i.href}`,
        label: i.label,
        href: i.href,
        group: "Navigation",
      })),
      {
        id: `nav-${learnNavItem.href}`,
        label: learnNavItem.label,
        href: learnNavItem.href,
        group: "Navigation",
      },
      ...pageList.map((p) => ({
        id: `page-${p.id}`,
        label: p.title?.trim() ? p.title : "Page sans titre",
        href: `/builder/${p.id}`,
        group: "Pages",
      })),
    ];
    return nav;
  }, [remotePages]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(s) ||
        i.href.toLowerCase().includes(s)
    );
  }, [items, q]);

  const go = useCallback(
    (href: string) => {
      onOpenChange(false);
      setQ("");
      router.push(href);
    },
    [onOpenChange, router]
  );

  useEffect(() => {
    if (!open) return;
    setQ("");
    const t = window.setTimeout(() => inputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche et navigation rapide"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50 backdrop-blur-sm dark:bg-black/70"
        aria-label="Fermer"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-[#e3e5e8] bg-white shadow-xl dark:border-[#2a2a2a] dark:bg-[#141414]">
        <div className="flex items-center gap-2 border-b border-[#e3e5e8] px-3 dark:border-[#2a2a2a]">
          <Search className="size-4 shrink-0 text-[#616161] dark:text-[#a3a3a3]" />
          <input
            ref={inputRef}
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Une page, une section…"
            className="h-12 w-full bg-transparent text-sm text-[#202223] outline-none placeholder:text-[#8c9196] dark:text-white dark:placeholder:text-[#737373]"
          />
          {pagesLoading ? (
            <Loader2
              className="size-4 shrink-0 animate-spin text-[#616161] dark:text-[#a3a3a3]"
              aria-hidden
            />
          ) : (
            <kbd className="hidden shrink-0 rounded border border-[#e3e5e8] bg-[#f6f6f7] px-1.5 py-0.5 font-mono text-[10px] text-[#616161] dark:border-[#2a2a2a] dark:bg-[#1a1a1a] dark:text-[#a3a3a3] sm:inline">
              Esc
            </kbd>
          )}
        </div>
        <ul className="max-h-[min(50vh,320px)] overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <li className="px-3 py-8 text-center text-sm text-[#616161] dark:text-[#a3a3a3]">
              {pagesLoading && !q.trim()
                ? "Chargement des pages…"
                : "Aucun résultat."}
            </li>
          ) : (
            filtered.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.href)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                    "text-[#202223] hover:bg-[#f6f6f7] dark:text-white dark:hover:bg-[#1f1f1f]"
                  )}
                >
                  <FileText className="size-4 shrink-0 text-[#616161] dark:text-[#a3a3a3]" />
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  <span className="shrink-0 text-[11px] text-[#8c9196] dark:text-[#737373]">
                    {item.group}
                  </span>
                </button>
              </li>
            ))
          )}
        </ul>
        <p className="border-t border-[#e3e5e8] px-3 py-2 text-[11px] text-[#8c9196] dark:border-[#2a2a2a] dark:text-[#737373]">
          <kbd className="rounded bg-[#f6f6f7] px-1 dark:bg-[#1a1a1a]">⌘</kbd>{" "}
          + <kbd className="rounded bg-[#f6f6f7] px-1 dark:bg-[#1a1a1a]">K</kbd>{" "}
          pour ouvrir depuis n’importe quelle page du tableau de bord.
        </p>
      </div>
    </div>
  );
}
