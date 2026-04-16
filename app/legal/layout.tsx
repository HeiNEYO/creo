import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-creo-white text-creo-black dark:bg-background dark:text-foreground">
      <header className="border-b border-creo-gray-200 px-6 py-4 dark:border-border">
        <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="text-lg font-semibold text-creo-purple">
            CRÉO
          </Link>
          <nav className="flex flex-wrap items-center gap-x-4 gap-y-1 text-creo-sm">
            <Link href="/legal/conditions" className="text-creo-gray-600 hover:text-creo-purple dark:text-muted-foreground">
              CGU
            </Link>
            <Link
              href="/legal/confidentialite"
              className="text-creo-gray-600 hover:text-creo-purple dark:text-muted-foreground"
            >
              Confidentialité
            </Link>
            <Link href="/legal/mentions" className="text-creo-gray-600 hover:text-creo-purple dark:text-muted-foreground">
              Mentions légales
            </Link>
            <Link href="/" className={buttonVariants({ variant: "ghost", size: "sm", className: "h-8 px-2" })}>
              Accueil
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-10">{children}</main>
    </div>
  );
}
