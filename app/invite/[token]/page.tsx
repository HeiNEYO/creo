import Link from "next/link";

import { AcceptInviteClient } from "@/components/invite/accept-invite-client";
import { readAuthUser } from "@/lib/supabase/read-auth-user";
import { createClient } from "@/lib/supabase/server";
import { getWorkspaceInvitePreview } from "@/lib/workspaces/invite-preview";

export const dynamic = "force-dynamic";

function formatExp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(d);
}

export default async function InviteTokenPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token?.trim() ?? "";
  const preview = await getWorkspaceInvitePreview(token);

  const supabase = createClient();
  const user = await readAuthUser(supabase);

  const enc = encodeURIComponent;
  const loginHref = `/login?redirect=${enc(`/invite/${token}`)}`;
  const registerHref = `/register?invite=${enc(token)}`;

  if (!preview.ok) {
    const copy =
      preview.reason === "expired"
        ? "Cette invitation a expiré. Demande à l’administrateur d’en envoyer une nouvelle."
        : preview.reason === "used"
          ? "Cette invitation a déjà été acceptée."
          : preview.reason === "config"
            ? "Le serveur ne peut pas lire les invitations (vérifie SUPABASE_SERVICE_ROLE_KEY sur l’hébergeur)."
            : "Ce lien n’est pas valide ou a été révoqué.";

    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-creo-xl font-semibold text-creo-black dark:text-white">
          Invitation
        </h1>
        <p className="text-creo-base text-creo-gray-600 dark:text-creo-gray-400">{copy}</p>
        <Link
          href="/login"
          className="text-creo-sm font-medium text-creo-purple underline"
        >
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-creo-xl font-semibold text-creo-black dark:text-white">
          Rejoindre « {preview.workspaceName} »
        </h1>
        <p className="mt-2 text-creo-base text-creo-gray-500">
          Tu as été invité sur CRÉO. L’invitation est destinée à{" "}
          <span className="font-mono text-creo-sm text-foreground">{preview.inviteEmail}</span>.
        </p>
        <p className="mt-2 text-creo-xs text-creo-gray-400">
          Expire le {formatExp(preview.expiresAt)}
        </p>
      </div>

      <AcceptInviteClient
        token={token}
        isLoggedIn={!!user}
        inviteEmail={preview.inviteEmail}
        loginHref={loginHref}
        registerHref={registerHref}
      />

      <p className="text-creo-xs text-creo-gray-500">
        <Link href="/" className="text-creo-purple underline">
          Retour à l’accueil
        </Link>
      </p>
    </div>
  );
}
