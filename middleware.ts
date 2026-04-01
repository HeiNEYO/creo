import { type NextRequest, NextResponse } from "next/server";

import { getSupabasePublicEnv } from "@/lib/supabase/env-public";
import { createMiddlewareSupabaseClient } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  if (!getSupabasePublicEnv()) {
    if (path.startsWith("/dashboard")) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (path.startsWith("/dashboard") && !user) {
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
    "/dashboard/:path*",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
  ],
};
