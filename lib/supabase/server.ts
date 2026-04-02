import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  authCookieMaxAge,
  CREO_REMEMBER_COOKIE,
} from "@/lib/supabase/auth-session-preference";
import { getSupabasePublicEnv } from "@/lib/supabase/env-public";

function getSupabaseServerConfig(): { url: string; anonKey: string } {
  const cfg = getSupabasePublicEnv();
  if (!cfg) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définis."
    );
  }
  return cfg;
}

/** Client Supabase pour les Server Components, Server Actions et Route Handlers. */
export function createClient() {
  const { url, anonKey } = getSupabaseServerConfig();
  const cookieStore = cookies();
  const rememberVal = cookieStore.get(CREO_REMEMBER_COOKIE)?.value;

  return createServerClient(url, anonKey, {
    cookieOptions: {
      maxAge: authCookieMaxAge(rememberVal),
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Appel depuis un Server Component : la session est rafraîchie via le middleware.
        }
      },
    },
  });
}
