import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Nouveau mot de passe
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Choisis un mot de passe sécurisé pour ton compte.
        </p>
      </div>
      <ResetPasswordForm />
      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
