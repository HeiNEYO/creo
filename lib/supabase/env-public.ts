/**
 * Variables Supabase exposées au client (NEXT_PUBLIC_*).
 * Retourne null si non configurées (évite un crash du middleware / build atypique).
 */
export function getSupabasePublicEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) {
    return null;
  }
  return { url, anonKey };
}
