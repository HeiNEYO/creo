"use client";

import { useEffect, useRef } from "react";

import { getCookieConsentChoice } from "@/components/cookie-consent-banner";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

function ensureMetaPixelScript(): void {
  if (typeof window === "undefined") return;
  if (document.getElementById("creo-fbq-snippet")) return;

  const s = document.createElement("script");
  s.id = "creo-fbq-snippet";
  s.innerHTML = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js');`;
  document.head.appendChild(s);
}

/**
 * Pixel Meta : uniquement si consentement « Tout accepter » (bandeau cookies).
 */
export function PublicMetaPixel({ pixelId }: { pixelId: string | null | undefined }) {
  const lastInitedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const id = pixelId?.trim();
    if (!id) return;

    const run = () => {
      if (getCookieConsentChoice() !== "all") return;

      ensureMetaPixelScript();

      if (lastInitedIdRef.current === id) {
        window.fbq?.("track", "PageView");
        return;
      }

      window.fbq?.("init", id);
      window.fbq?.("track", "PageView");
      lastInitedIdRef.current = id;
    };

    run();
    window.addEventListener("creo-cookie-consent", run);
    return () => window.removeEventListener("creo-cookie-consent", run);
  }, [pixelId]);

  return null;
}
