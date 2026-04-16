"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { acceptWorkspaceInviteServer } from "@/lib/workspaces/invite-actions";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";

type Props = {
  token: string;
  isLoggedIn: boolean;
  inviteEmail: string;
  loginHref: string;
  registerHref: string;
};

export function AcceptInviteClient({
  token,
  isLoggedIn,
  inviteEmail,
  loginHref,
  registerHref,
}: Props) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function accept() {
    setErr(null);
    startTransition(async () => {
      const res = await acceptWorkspaceInviteServer({ token });
      if (!res.ok) {
        if (
          res.error.includes("accept_workspace_invite") ||
          res.error.includes("schema cache")
        ) {
          setErr(
            "Fonction d’acceptation absente : applique la migration Supabase « workspace_invites » sur ton projet."
          );
        } else {
          setErr(res.error);
        }
        return;
      }
      router.replace("/dashboard");
      router.refresh();
    });
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={loginHref}
          className={buttonVariants({ className: "inline-flex w-full justify-center sm:flex-1" })}
        >
          Se connecter
        </Link>
        <Link
          href={registerHref}
          className={buttonVariants({
            variant: "outline",
            className: "inline-flex w-full justify-center sm:flex-1",
          })}
        >
          Créer un compte
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-creo-sm text-creo-gray-600 dark:text-creo-gray-400">
        Compte connecté : si ce n’est pas l’email <strong className="font-mono text-foreground">{inviteEmail}</strong>,{" "}
        <Link href={loginHref} className="text-creo-purple underline">
          déconnecte-toi
        </Link>{" "}
        puis reconnecte-toi avec le bon compte.
      </p>
      {err ? (
        <p className="text-creo-sm text-red-600 dark:text-red-400" role="alert">
          {err}
        </p>
      ) : null}
      <Button type="button" className="w-full" disabled={pending} onClick={() => void accept()}>
        {pending ? "Validation…" : "Rejoindre ce workspace"}
      </Button>
    </div>
  );
}
