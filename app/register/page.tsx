import Link from "next/link";

import { RegisterForm } from "@/components/auth/register-form";
import { getWorkspaceInvitePreview } from "@/lib/workspaces/invite-preview";

export const dynamic = "force-dynamic";

type RegisterPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const inviteRaw =
    typeof searchParams.invite === "string" ? searchParams.invite.trim() : "";
  let defaultEmail: string | undefined;
  if (inviteRaw.length >= 10) {
    const preview = await getWorkspaceInvitePreview(inviteRaw);
    if (preview.ok) {
      defaultEmail = preview.inviteEmail;
    }
  }

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
      <RegisterForm
        inviteToken={inviteRaw.length >= 10 ? inviteRaw : undefined}
        defaultEmail={defaultEmail}
      />
    </div>
  );
}
