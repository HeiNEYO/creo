"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

function initialsFrom(displayName: string, email: string): string {
  const n = displayName.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const local = email.split("@")[0] ?? "";
  return (local.slice(0, 2) || "?").toUpperCase();
}

type Props = {
  displayName: string;
  userEmail: string;
  avatarUrl: string | null;
  onNavigate?: () => void;
};

/**
 * Pilule profil (avatar + nom + chevron) en bas du rail ; menu vers Mon compte.
 */
export function DashboardSidebarProfile({
  displayName,
  userEmail,
  avatarUrl,
  onNavigate,
}: Props) {
  const [open, setOpen] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const label = displayName.trim() || userEmail.split("@")[0] || "Compte";
  const initials = initialsFrom(displayName, userEmail);
  const trimmedAvatar = avatarUrl?.trim() ?? "";
  const showAvatar = Boolean(trimmedAvatar) && !imgBroken;

  useEffect(() => {
    setImgBroken(false);
  }, [trimmedAvatar]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div ref={ref} className="relative z-20 px-2 pb-3 pt-2 md:px-2.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex w-full items-center gap-2 rounded-2xl border border-[#e5e7eb] bg-white px-2.5 py-2 text-left transition-colors",
          "hover:bg-[#fafafa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--creo-ring-brand)]",
          "dark:border-white/[0.12] dark:bg-[#141414] dark:hover:bg-white/[0.06]",
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        {showAvatar ? (
          // eslint-disable-next-line @next/next/no-img-element -- URL Storage / externe
          <img
            src={trimmedAvatar}
            alt=""
            width={32}
            height={32}
            className="size-8 shrink-0 rounded-full object-cover"
            onError={() => setImgBroken(true)}
          />
        ) : (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e5e7eb] text-[11px] font-semibold text-[#374151] dark:bg-white/10 dark:text-white"
            aria-hidden
          >
            {initials}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-[calc(13px+0.2px)] font-medium text-[#202223] dark:text-white">
          {label}
        </span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 text-[#6b7280] transition-transform dark:text-creo-gray-500",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute bottom-full left-2 right-2 z-50 mb-1 overflow-hidden rounded-xl border border-[#e5e7eb] bg-white py-1 shadow-lg dark:border-white/[0.12] dark:bg-[#1a1a1a]"
        >
          <Link
            href="/dashboard/settings?section=account"
            role="menuitem"
            className="block px-3 py-2 text-[13px] text-[#202223] hover:bg-[#f3f4f6] dark:text-white dark:hover:bg-white/[0.08]"
            onClick={() => {
              setOpen(false);
              onNavigate?.();
            }}
          >
            Mon compte
          </Link>
        </div>
      ) : null}
    </div>
  );
}
