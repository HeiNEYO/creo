import { createBrowserClient } from "@supabase/ssr";

function getSupabaseBrowserConfig(): { url: string; anonKey: string } {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY doivent être définis."
    );
  }
  return { url, anonKey };
}

/** Client Supabase pour le navigateur (composants client, hooks). */
export function createClient() {
  const { url, anonKey } = getSupabaseBrowserConfig();
  return createBrowserClient(url, anonKey);
}
