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
  try {
    return decodeURIComponent(code);
  } catch {
    return code;
  }
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  const redirectTo =
    typeof searchParams.redirect === "string" ? searchParams.redirect : undefined;
  const authError =
    typeof searchParams.error === "string" ? searchParams.error : undefined;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-creo-xl font-semibold text-creo-black">
          Connexion à CRÉO
        </h1>
        <p className="mt-2 text-creo-base text-creo-gray-500">
          Ravis de te revoir
        </p>
        <p className="mt-4 text-creo-sm text-creo-gray-500">
          Pas encore de compte ?{" "}
          <Link
            href="/register"
            className="font-medium text-creo-purple hover:underline"
          >
            Créer un compte
          </Link>
        </p>
      </div>
      {authError ? (
        <p className="rounded-creo-md bg-creo-danger-pale px-3 py-2 text-creo-sm text-[#dc2626]">
          {loginErrorMessage(authError)}
        </p>
      ) : null}
      <LoginForm redirectTo={redirectTo} />
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-creo-gray-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-creo-white px-3 text-creo-xs uppercase tracking-wide text-creo-gray-400">
            ou
          </span>
        </div>
      </div>
      <MagicLinkForm />
    </div>
  );
}
