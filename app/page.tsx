import Link from "next/link";

import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background px-6 py-16">
      <div className="max-w-lg text-center">
        <p className="text-sm font-medium text-primary">CRÉO</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Ta plateforme tout-en-un pour vendre tes formations
        </h1>
        <p className="mt-4 text-muted-foreground">
          Next.js 14, Supabase, Stripe, Resend et OpenAI sont câblés. Configure{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-sm">
            .env.local
          </code>{" "}
          pour activer les services.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard" className={cn(buttonVariants())}>
          Tableau de bord
        </Link>
        <a
          href="https://supabase.com/docs/guides/auth/server-side/nextjs"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          Doc auth Supabase
        </a>
      </div>
    </div>
  );
}
