import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Crée un workspace + ligne owner si l’utilisateur n’en a aucun.
 * S’appuie sur la RPC `ensure_default_workspace` (SECURITY DEFINER) pour éviter
 * les refus RLS côté PostgREST lors du bootstrap (connexion / Server Actions).
 */
export async function ensureDefaultWorkspace(
  supabase: SupabaseClient
): Promise<void> {
  const { error } = await supabase.rpc("ensure_default_workspace");
  if (error) {
    throw new Error(error.message);
  }
}

/** Même RPC, sans exception — pour le contexte RSC / middleware. */
export async function ensureDefaultWorkspaceSafe(
  supabase: SupabaseClient
): Promise<boolean> {
  try {
    const { error } = await supabase.rpc("ensure_default_workspace");
    return !error;
  } catch {
    return false;
  }
}
