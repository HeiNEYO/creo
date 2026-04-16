import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import {
  authCookieMaxAge,
  CREO_REMEMBER_COOKIE,
} from "@/lib/supabase/auth-session-preference";
import { getSupabasePublicEnv } from "@/lib/supabase/env-public";
import { sendWelcomePlatformEmailOnce } from "@/lib/emails/welcome-platform";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { ensureDefaultWorkspace } from "@/lib/workspaces/ensure-default";

/**
 * Échange le code PKCE (magic link, recovery, OAuth) contre une session cookie.
 * Les Set-Cookie doivent aller sur la NextResponse de redirection (pas seulement cookieStore).
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const nextParam = requestUrl.searchParams.get("next") ?? "/dashboard";
  const safeNext = nextParam.startsWith("/") ? nextParam : "/dashboard";
  const origin = requestUrl.origin;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth_code_manquant`);
  }

  const config = getSupabasePublicEnv();
  if (!config) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("configuration_supabase")}`
    );
  }

  const { url, anonKey } = config;
  const cookieStore = cookies();
  const rememberVal = cookieStore.get(CREO_REMEMBER_COOKIE)?.value;

  const redirectToApp = () =>
    NextResponse.redirect(`${origin}${safeNext}`);

  const response = redirectToApp();

  const supabase = createServerClient(url, anonKey, {
    cookieOptions: {
      maxAge: authCookieMaxAge(rememberVal),
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const user = await readAuthUser(supabase);

  if (user && !safeNext.startsWith("/invite/")) {
    try {
      await ensureDefaultWorkspace(supabase);
    } catch {
      /* la page dashboard pourra réessayer ou afficher une erreur */
    }
    void sendWelcomePlatformEmailOnce(supabase, {
      id: user.id,
      email: user.email,
    }).catch(() => {});
  }

  return response;
}
