/**
 * Éditeur plein écran (hors shell dashboard), réf. Framer.
 */
export default function BuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f8f8f8]">{children}</div>
  );
}
