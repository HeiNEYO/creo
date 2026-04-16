/**
 * Éditeur plein écran (hors shell dashboard), réf. Framer.
 */
export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="creo-builder-theme flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-white dark:bg-zinc-950">
      {children}
    </div>
  );
}
