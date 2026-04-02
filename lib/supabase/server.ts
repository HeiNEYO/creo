import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

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

/**
 * Un seul client Supabase par requête RSC (layout + pages partagent la même instance).
 * Évite des doubles appels cookies / refresh qui peuvent faire échouer le rendu.
 */
function createSupabaseServerClientInner() {
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

/** Client Supabase pour les Server Components, Server Actions et Route Handlers. */
export const createClient = cache(createSupabaseServerClientInner);
