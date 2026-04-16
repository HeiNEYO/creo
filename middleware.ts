import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env-public";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { ensureDefaultWorkspaceSafe } from "@/lib/workspaces/ensure-default";

/** Sous-domaine {slug}.{NEXT_PUBLIC_ROOT_DOMAIN} → /p/{slug}/{pageSlug} (racine = page « accueil »). */
function trySubdomainRewrite(request: NextRequest): NextResponse | null {
  const root = process.env.NEXT_PUBLIC_ROOT_DOMAIN?.trim().toLowerCase();
  if (!root) {
    return null;
  }

  const host = request.headers.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (!host || host === root) {
    return null;
  }

  const suffix = `.${root}`;
  if (!host.endsWith(suffix)) {
    return null;
  }

  const sub = host.slice(0, -suffix.length);
  if (!sub || sub.includes(".")) {
    return null;
  }

  const reserved = new Set(["www", "app", "api", "cdn"]);
  if (reserved.has(sub)) {
    return null;
  }

  const pathname = request.nextUrl.pathname;
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    pathname === "/aide" ||
    pathname.startsWith("/aides")
  ) {
    return null;
  }

  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
  const pageSlug = segments[0] ?? "accueil";

  return NextResponse.rewrite(new URL(`/p/${sub}/${pageSlug}`, request.url));
}

function isProtectedPath(path: string) {
  return (
    path.startsWith("/dashboard") ||
    path.startsWith("/builder") ||
    path.startsWith("/learn")
  );
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  const subdomainRewrite = trySubdomainRewrite(request);
  if (subdomainRewrite) {
    return subdomainRewrite;
  }

  if (!getSupabasePublicEnv()) {
    if (isProtectedPath(path)) {
      const u = new URL("/login", request.url);
      u.searchParams.set("error", "configuration_supabase");
      return NextResponse.redirect(u);
    }
    return NextResponse.next();
  }

  const { supabase, response } = createMiddlewareSupabaseClient(request);
  if (!supabase) {
    return response;
  }

  const user = await readAuthUser(supabase);

  if (
    user &&
    (path.startsWith("/dashboard") || path.startsWith("/builder"))
  ) {
    await ensureDefaultWorkspaceSafe(supabase);
  }

  if (isProtectedPath(path) && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirect", path);
    return NextResponse.redirect(redirectUrl);
  }

  if (
    user &&
    (path === "/login" || path === "/register" || path === "/forgot-password")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!api/|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml|webmanifest)$).*)",
  ],
};
