"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { clearRememberPreferenceCookie } from "@/lib/supabase/auth-session-preference";
import { createClient } from "@/lib/supabase/client";

export function AccountSignOutSection() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!confirmOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setConfirmOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirmOpen]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearRememberPreferenceCookie();
    window.location.assign("/login");
  }

  return (
    <>
      <div className="space-y-3 border-t border-border pt-8">
        <h3 className="text-creo-md font-semibold">Déconnexion</h3>
        <p className="text-creo-sm text-muted-foreground">
          Tu quitteras la session sur cet appareil.
        </p>
        <Button
          type="button"
          variant="danger"
          onClick={() => setConfirmOpen(true)}
        >
          Se déconnecter
        </Button>
      </div>

      {confirmOpen ? (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setConfirmOpen(false);
          }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="signout-dialog-title"
            aria-describedby="signout-dialog-desc"
            className="w-full max-w-sm rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <p id="signout-dialog-title" className="text-base font-semibold">
              Déconnexion
            </p>
            <p
              id="signout-dialog-desc"
              className="mt-2 text-sm text-muted-foreground"
            >
              Es-tu sûr de vouloir te déconnecter ?
            </p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmOpen(false)}
              >
                Non
              </Button>
              <Button
                type="button"
                variant="danger"
                onClick={() => void signOut()}
              >
                Oui, me déconnecter
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
