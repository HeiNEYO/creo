import { createBrowserClient } from "@supabase/ssr";

import {
  authCookieMaxAge,
  readRememberCookieValueFromDocument,
} from "@/lib/supabase/auth-session-preference";
import { getSupabasePublicEnv } from "@/lib/supabase/env-public";

function getSupabaseBrowserConfig(): { url: string; anonKey: string } {
  const cfg = getSupabasePublicEnv();
  if (!cfg) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définis."
    );
  }
  return cfg;
}

/** Client Supabase pour le navigateur (composants client, hooks). */
export function createClient() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  const remember = readRememberCookieValueFromDocument();
  return createBrowserClient(url, anonKey, {
    isSingleton: false,
    cookieOptions: {
      maxAge: authCookieMaxAge(remember),
    },
  });
}
