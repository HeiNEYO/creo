import Link from "next/link";

import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-creo-xl font-semibold text-creo-black">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-creo-base text-creo-gray-500">
          Choisis un mot de passe sécurisé pour ton compte.
        </p>
      </div>
      <ResetPasswordForm />
      <p className="text-center text-creo-sm text-creo-gray-500">
        <Link
          href="/login"
          className="font-medium text-creo-purple hover:underline"
        >
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
