import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

type LoginPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

function loginErrorMessage(code: string): string {
  if (code === "configuration_supabase") {
    return "Configuration serveur incomplète : vérifie NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY sur Vercel (Settings → Environment Variables), puis redéploie.";
  }
  return decodeURIComponent(code);
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTo =
    typeof searchParams.redirect === "string" ? searchParams.redirect : undefined;
  const authError =
    typeof searchParams.error === "string" ? searchParams.error : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Connexion
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pas encore de compte ?{" "}
          <Link href="/register" className="font-medium text-primary hover:underline">
            Créer un compte
          </Link>
        </p>
      </div>
      {authError ? (
        <p className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {loginErrorMessage(authError)}
        </p>
      ) : null}
      <LoginForm redirectTo={redirectTo} />
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">
            Ou lien magique
          </span>
        </div>
      </div>
      <MagicLinkForm />
    </div>
  );
}
