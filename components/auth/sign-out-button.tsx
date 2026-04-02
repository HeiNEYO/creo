"use client";

import { clearRememberPreferenceCookie } from "@/lib/supabase/auth-session-preference";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearRememberPreferenceCookie();
    window.location.assign("/login");
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void signOut()}
    >
      Déconnexion
    </Button>
  );
}
