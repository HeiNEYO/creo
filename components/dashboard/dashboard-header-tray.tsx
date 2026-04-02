"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { CreoIconBell } from "@/components/icons/creo-nav-icons";
import {
  markAllNotificationsReadServer,
  markNotificationReadServer,
} from "@/lib/notifications/actions";
import { cn } from "@/lib/utils";

export type HeaderNotification = {
  id: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string;
};

function initialsFromUser(displayName: string, email: string): string {
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

function formatNotifDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return "";
  }
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}

type DashboardHeaderTrayProps = {
  userEmail: string;
  displayName: string;
  avatarUrl: string | null;
  notifications: HeaderNotification[];
};

export function DashboardHeaderTray({
  userEmail,
  displayName,
  avatarUrl,
  notifications: initialNotifications,
}: DashboardHeaderTrayProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const [notifications, setNotifications] = useState(initialNotifications);

  useEffect(() => {
    setNotifications(initialNotifications);
  }, [initialNotifications]);

  const unreadCount = notifications.filter((n) => !n.read_at).length;

  useEffect(() => {
    if (!open) {
      return;
    }
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        panelRef.current?.contains(t) ||
        btnRef.current?.contains(t)
      ) {
        return;
      }
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleOpenNotif = useCallback(
    async (n: HeaderNotification) => {
      if (!n.read_at) {
        const res = await markNotificationReadServer(n.id);
        if (res.ok) {
          setNotifications((prev) =>
            prev.map((x) =>
              x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x
            )
          );
        }
      }
      setOpen(false);
      const href = n.link?.trim();
      if (href) {
        router.push(href);
      }
      router.refresh();
    },
    [router]
  );

  const handleMarkAll = useCallback(async () => {
    const res = await markAllNotificationsReadServer();
    if (res.ok) {
      const now = new Date().toISOString();
      setNotifications((prev) =>
        prev.map((x) => (x.read_at ? x : { ...x, read_at: now }))
      );
      router.refresh();
    }
  }, [router]);

  const [imgBroken, setImgBroken] = useState(false);
  useEffect(() => {
    setImgBroken(false);
  }, [avatarUrl]);

  const showAvatarImage = Boolean(avatarUrl?.trim()) && !imgBroken;
  const initials = initialsFromUser(displayName, userEmail);

  return (
    <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
      <div className="relative">
        <button
          ref={btnRef}
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="relative flex size-9 shrink-0 items-center justify-center rounded-lg text-white/90 transition-colors hover:bg-white/10"
          aria-label="Notifications"
          aria-expanded={open}
          aria-haspopup="true"
        >
          <CreoIconBell className="text-white/85" />
          {unreadCount > 0 ? (
            <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-[#0033ff] text-[10px] font-bold text-white ring-2 ring-[#1a1a1a]">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          ) : null}
        </button>

        {open ? (
          <div
            ref={panelRef}
            className="absolute right-0 top-[calc(100%+6px)] z-[60] w-[min(100vw-1.5rem,22rem)] overflow-hidden rounded-xl border border-white/10 bg-[#252525] py-2 shadow-xl ring-1 ring-black/40 dark:bg-[#1c1c1c]"
            role="menu"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-3 pb-2">
              <p className="text-[13px] font-semibold text-white">Notifications</p>
              {unreadCount > 0 ? (
                <button
                  type="button"
                  onClick={() => void handleMarkAll()}
                  className="text-[11px] font-medium text-white/60 underline-offset-2 hover:text-white hover:underline"
                >
                  Tout lu
                </button>
              ) : null}
            </div>
            <ul className="max-h-[min(60vh,320px)] overflow-y-auto py-1">
              {notifications.length === 0 ? (
                <li className="px-3 py-8 text-center text-[13px] text-white/45">
                  Aucune notification pour l’instant.
                </li>
              ) : (
                notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => void handleOpenNotif(n)}
                      className={cn(
                        "flex w-full flex-col gap-0.5 px-3 py-2.5 text-left transition-colors hover:bg-white/[0.06]",
                        !n.read_at && "bg-white/[0.04]"
                      )}
                    >
                      <span
                        className={cn(
                          "text-[13px] leading-snug text-white",
                          !n.read_at && "font-semibold"
                        )}
                      >
                        {!n.read_at ? (
                          <span
                            className="mr-1.5 inline-block size-1.5 rounded-full bg-[#6688ff]"
                            aria-hidden
                          />
                        ) : null}
                        {n.title}
                      </span>
                      {n.body ? (
                        <span className="line-clamp-2 text-[12px] leading-snug text-white/55">
                          {n.body}
                        </span>
                      ) : null}
                      <span className="text-[10px] text-white/35">
                        {formatNotifDate(n.created_at)}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        ) : null}
      </div>

      <Link
        href="/dashboard/profile"
        className="group flex size-9 shrink-0 items-center justify-center rounded-full transition-opacity hover:opacity-90"
        title="Mon profil"
        aria-label="Mon profil"
      >
        <span className="relative flex size-9 shrink-0 overflow-hidden rounded-full ring-2 ring-white/25 transition ring-offset-2 ring-offset-[#1a1a1a] group-hover:ring-white/40">
          {showAvatarImage ? (
            // eslint-disable-next-line @next/next/no-img-element -- URL utilisateur (Gravatar, Storage…)
            <img
              src={avatarUrl!}
              alt=""
              className="size-full object-cover"
              onError={() => setImgBroken(true)}
            />
          ) : (
            <span className="flex size-full items-center justify-center bg-gradient-to-br from-[#4a4a8a] to-[#2a2a4a] text-[11px] font-bold text-white">
              {initials}
            </span>
          )}
        </span>
      </Link>
    </div>
  );
}
