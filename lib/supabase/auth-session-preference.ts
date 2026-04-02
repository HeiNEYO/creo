/** Cookie lisible par le navigateur et le middleware pour aligner la durée de session Supabase. */
export const CREO_REMEMBER_COOKIE = "creo-remember";

/** ~1 an : cookie de préférence (reste cohérent avec les renouvellements de session). */
const PREFERENCE_MAX_AGE = 400 * 24 * 60 * 60;

/** Session « longue » (se souvenir de moi) — aligné sur @supabase/ssr par défaut. */
export const AUTH_COOKIE_MAX_AGE_LONG = 400 * 24 * 60 * 60;

/** Sans « se souvenir » : déconnexion implicite après 24 h (navigateur fermé n’efface pas les cookies HttpOnly du même site). */
export const AUTH_COOKIE_MAX_AGE_SHORT = 60 * 60 * 24;

export function authCookieMaxAge(rememberCookieValue: string | undefined): number {
  if (rememberCookieValue === "0") {
    return AUTH_COOKIE_MAX_AGE_SHORT;
  }
  return AUTH_COOKIE_MAX_AGE_LONG;
}

/** À appeler dans le navigateur avant signIn / signUp. */
function cookieSecureSuffix(): string {
  if (typeof window === "undefined") return "";
  return window.location.protocol === "https:" ? "; Secure" : "";
}

export function setRememberPreferenceCookie(remember: boolean): void {
  if (typeof document === "undefined") return;
  const v = remember ? "1" : "0";
  document.cookie = `${CREO_REMEMBER_COOKIE}=${v}; Path=/; Max-Age=${PREFERENCE_MAX_AGE}; SameSite=Lax${cookieSecureSuffix()}`;
}

export function clearRememberPreferenceCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${CREO_REMEMBER_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${cookieSecureSuffix()}`;
}

export function readRememberCookieValueFromDocument(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const m = document.cookie.match(
    new RegExp(`(?:^|; )${CREO_REMEMBER_COOKIE}=([^;]*)`)
  );
  return m?.[1] ?? undefined;
}
