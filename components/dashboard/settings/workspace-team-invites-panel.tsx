"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

import {
  createWorkspaceInviteServer,
  revokeWorkspaceInviteServer,
} from "@/lib/workspaces/invite-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type PendingInviteRow = {
  id: string;
  email: string;
  role: string;
  created_at: string;
  expires_at: string;
};

type Props = {
  canInvite: boolean;
  initialInvites: PendingInviteRow[];
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export function WorkspaceTeamInvitesPanel({
  canInvite,
  initialInvites,
}: Props) {
  const router = useRouter();
  const [invites, setInvites] = useState(initialInvites);
  useEffect(() => {
    setInvites(initialInvites);
  }, [initialInvites]);

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"member" | "admin">("member");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [lastUrl, setLastUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLastUrl(null);
    startTransition(async () => {
      const res = await createWorkspaceInviteServer({ email, role });
      if (!res.ok) {
        if (res.error.includes("workspace_invites") || res.error.includes("schema cache")) {
          setErr(
            "Table d’invitations absente : applique la migration Supabase « workspace_invites » puis réessaie."
          );
        } else {
          setErr(res.error);
        }
        return;
      }
      setEmail("");
      setLastUrl(res.inviteUrl);
      setMsg(
        res.emailed
          ? "Invitation envoyée par e-mail."
          : "Invitation créée. Copie le lien ci-dessous (Resend non configuré : pas d’e-mail automatique)."
      );
      router.refresh();
    });
  }

  function revoke(id: string) {
    setErr(null);
    startTransition(async () => {
      const res = await revokeWorkspaceInviteServer({ inviteId: id });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-6 border-t border-creo-gray-100 pt-6 dark:border-border">
      <div>
        <h3 className="text-creo-sm font-semibold text-foreground">Invitations en attente</h3>
        <p className="mt-1 text-creo-sm text-creo-gray-500">
          Rôle <strong className="font-medium text-foreground">Admin</strong> : gestion du workspace ;
          <strong className="font-medium text-foreground"> Membre</strong> : accès au contenu.
        </p>
      </div>

      {canInvite ? (
        <form onSubmit={sendInvite} className="space-y-4 rounded-lg border border-creo-gray-200 p-4 dark:border-border">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div className="space-y-2">
              <Label htmlFor="invite-email">E-mail à inviter</Label>
              <Input
                id="invite-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="collegue@exemple.com"
                disabled={pending}
                autoComplete="off"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Rôle</Label>
              <select
                id="invite-role"
                value={role}
                onChange={(e) => setRole(e.target.value === "admin" ? "admin" : "member")}
                disabled={pending}
                className="flex h-10 w-full rounded-md border border-creo-gray-200 bg-white px-3 text-creo-sm dark:border-border dark:bg-[var(--creo-surface-panel)]"
              >
                <option value="member">Membre</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          {err ? (
            <p className="text-creo-sm text-red-600 dark:text-red-400" role="alert">
              {err}
            </p>
          ) : null}
          {msg ? (
            <p className="text-creo-sm text-emerald-700 dark:text-emerald-400" role="status">
              {msg}
            </p>
          ) : null}
          {lastUrl ? (
            <div className="rounded-md bg-creo-gray-50 p-3 dark:bg-white/5">
              <p className="text-creo-xs font-medium text-creo-gray-500">Lien à partager</p>
              <p className="mt-1 break-all font-mono text-creo-xs text-foreground">{lastUrl}</p>
            </div>
          ) : null}
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "Envoi…" : "Envoyer l’invitation"}
          </Button>
        </form>
      ) : (
        <p className="text-creo-sm text-creo-gray-500">
          Seuls les <strong className="font-medium text-foreground">propriétaires</strong> et{" "}
          <strong className="font-medium text-foreground">admins</strong> peuvent inviter des
          personnes.
        </p>
      )}

      {invites.length === 0 ? (
        <p className="text-creo-sm text-creo-gray-500">Aucune invitation en attente.</p>
      ) : (
        <ul className="space-y-2">
          {invites.map((inv) => (
            <li
              key={inv.id}
              className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-creo-gray-100 px-3 py-2 dark:border-border"
            >
              <div className="min-w-0">
                <p className="truncate font-mono text-creo-sm text-foreground">{inv.email}</p>
                <p className="text-creo-xs text-creo-gray-500">
                  {inv.role === "admin" ? "Admin" : "Membre"} · expire le {formatDate(inv.expires_at)}
                </p>
              </div>
              {canInvite ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={pending}
                  onClick={() => revoke(inv.id)}
                >
                  Révoquer
                </Button>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
