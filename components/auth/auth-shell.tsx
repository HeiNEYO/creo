import Link from "next/link";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <header className="border-b border-border bg-background px-6 py-4">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-primary"
        >
          CRÉO
        </Link>
      </header>
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-sm">
          {children}
        </div>
      </div>
    </div>
  );
}
