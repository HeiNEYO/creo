import type { ReactNode } from "react";

/** Shell minimal : l’expérience leçon gère sa propre barre (progression, navigation). */
export default function LearnLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[var(--creo-dashboard-canvas)] dark:bg-background">{children}</div>;
}
