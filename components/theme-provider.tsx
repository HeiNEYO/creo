"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * Mode sombre désactivé pour l’instant — uniquement le thème clair.
 * Retirer `forcedTheme` et réactiver `enableSystem` quand on réintroduit le sombre.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      storageKey="creo-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
