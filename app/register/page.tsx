import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-creo-xl font-semibold text-creo-black">
          Créer ton compte
        </h1>
        <p className="mt-2 text-creo-base text-creo-gray-500">
          Rejoins les créateurs qui centralisent tout sur CRÉO
        </p>
        <p className="mt-4 text-creo-sm text-creo-gray-500">
          Déjà inscrit ?{" "}
          <Link
            href="/login"
            className="font-medium text-creo-purple hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </div>
      <RegisterForm />
    </div>
  );
}
