import Link from "next/link";

import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-creo-xl font-semibold text-creo-black">
          Mot de passe oublié
        </h1>
        <p className="mt-2 text-creo-base text-creo-gray-500">
          Nous t’enverrons un lien pour choisir un nouveau mot de passe.
        </p>
      </div>
      <ForgotPasswordForm />
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
