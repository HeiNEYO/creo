import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env-public";
import { ensureDefaultWorkspace } from "@/lib/workspaces/ensure-default";

/**
 * Échange le code PKCE (magic link, recovery, OAuth) contre une session cookie.
 */
export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=auth_code_manquant`
    );
  }

  const config = getSupabasePublicEnv();
  if (!config) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent("configuration_supabase")}`
    );
  }

  const cookieStore = cookies();
  const { url, anonKey } = config;

  const supabase = createServerClient(url, anonKey, {
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
          /* set depuis un contexte read-only */
        }
      },
    },
  });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      `${requestUrl.origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    try {
      await ensureDefaultWorkspace(supabase, user);
    } catch {
      /* la page dashboard pourra réessayer ou afficher une erreur */
    }
  }

  const safeNext = next.startsWith("/") ? next : "/dashboard";
  return NextResponse.redirect(`${requestUrl.origin}${safeNext}`);
}
