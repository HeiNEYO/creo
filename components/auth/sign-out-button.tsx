"use client";

import { clearRememberPreferenceCookie } from "@/lib/supabase/auth-session-preference";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  /** Barre sombre type Shopify admin */
  tone?: "default" | "onDark";
  className?: string;
};

export function SignOutButton({
  tone = "default",
  className,
}: SignOutButtonProps) {
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    clearRememberPreferenceCookie();
    window.location.assign("/login");
  }

  return (
    <Button
      type="button"
      variant={tone === "onDark" ? "ghost" : "outline"}
      size="sm"
      className={cn(
        tone === "onDark" &&
          "border border-white/20 text-white hover:bg-white/10 hover:text-white",
        className
      )}
      onClick={() => void signOut()}
    >
      Déconnexion
    </Button>
  );
}
