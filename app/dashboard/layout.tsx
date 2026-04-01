import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/lib/auth/actions";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <header className="flex h-14 items-center justify-between border-b border-border bg-background px-6">
        <Link href="/dashboard" className="font-semibold text-primary">
          CRÉO
        </Link>
        <div className="flex items-center gap-4">
          <span className="max-w-[200px] truncate text-sm text-muted-foreground">
            {user.email}
          </span>
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Déconnexion
            </Button>
          </form>
        </div>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
