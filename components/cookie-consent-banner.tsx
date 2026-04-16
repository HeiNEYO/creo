"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

const STORAGE_KEY = "creo_cookie_consent_v1";

type Choice = "essential" | "all";

function isPublicEntryPath(pathname: string): boolean {
  if (pathname === "/") return true;
  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password"
  ) {
    return true;
  }
  if (pathname.startsWith("/p/")) return true;
  return false;
}

function readStored(): Choice | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const j = JSON.parse(raw) as { choice?: Choice };
    return j.choice === "essential" || j.choice === "all" ? j.choice : null;
  } catch {
    return null;
  }
}

function persist(choice: Choice) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ choice, at: new Date().toISOString() })
    );
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("creo-cookie-consent"));
}

/** Exposé pour d’éventuels scripts analytics / pixel (lecture côté client). */
export function getCookieConsentChoice(): Choice | null {
  if (typeof window === "undefined") return null;
  return readStored();
}

export function CookieConsentBanner() {
  const pathname = usePathname() ?? "";
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!isPublicEntryPath(pathname)) {
      setOpen(false);
      return;
    }
    setOpen(readStored() === null);
  }, [mounted, pathname]);

  if (!mounted || !open) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies"
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-creo-gray-200 bg-creo-white/95 px-4 py-3 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] backdrop-blur-sm dark:border-border dark:bg-background/95"
    >
      <div className="mx-auto flex max-w-4xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <p className="text-creo-sm text-creo-gray-700 dark:text-creo-gray-300">
          Nous utilisons des cookies et stockages locaux <strong className="font-medium">nécessaires</strong> au
          fonctionnement (session, sécurité). Avec ton accord, d’autres traceurs (mesure d’audience, contenus
          tiers) pourront être activés plus tard sur ces pages.{" "}
          <Link href="/legal/confidentialite#cookies" className="text-creo-purple underline underline-offset-2">
            Politique de confidentialité
          </Link>
        </p>
        <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              persist("essential");
              setOpen(false);
            }}
          >
            Nécessaires uniquement
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => {
              persist("all");
              setOpen(false);
            }}
          >
            Tout accepter
          </Button>
        </div>
      </div>
    </div>
  );
}
