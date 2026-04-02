import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import {
  authCookieMaxAge,
  CREO_REMEMBER_COOKIE,
} from "@/lib/supabase/auth-session-preference";
import { getSupabasePublicEnv } from "@/lib/supabase/env-public";

/**
 * Rafraîchit la session Supabase sur la requête entrante et renvoie la réponse
 * avec les cookies mis à jour (pattern @supabase/ssr).
 *
 * Ne modifie pas request.cookies : en middleware Next.js, les cookies de la
 * requête sont en lecture seule ; seule la réponse peut porter les Set-Cookie.
 */
export function createMiddlewareSupabaseClient(request: NextRequest) {
  const config = getSupabasePublicEnv();
  if (!config) {
    return {
      supabase: null,
      response: NextResponse.next({ request: { headers: request.headers } }),
    } as const;
  }

  const { url, anonKey } = config;
  const response = NextResponse.next({ request: { headers: request.headers } });
  const rememberVal = request.cookies.get(CREO_REMEMBER_COOKIE)?.value;

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: {
      maxAge: authCookieMaxAge(rememberVal),
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        /* Ne pas recréer la réponse : sinon les Set-Cookie des appels précédents sont perdus. */
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  return { supabase, response } as const;
}
