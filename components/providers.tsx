/**
 * Enveloppe racine (thème, toasts, etc.). Sonner retiré : son bundle cassait le SSR Vercel
 * (accès à `document` au rendu). Les formulaires affichent déjà les messages inline.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
