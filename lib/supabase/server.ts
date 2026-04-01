import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

function getSupabaseServerConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définis."
    );
  }
  return { url, anonKey };
}

/** Client Supabase pour les Server Components, Server Actions et Route Handlers. */
export function createClient() {
  const cookieStore = cookies();
  const { url, anonKey } = getSupabaseServerConfig();

  return createServerClient(url, anonKey, {
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
