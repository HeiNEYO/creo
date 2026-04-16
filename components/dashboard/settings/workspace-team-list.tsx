"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { removeWorkspaceMemberServer } from "@/lib/workspaces/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type WorkspaceMemberRow = {
  user_id: string;
  role: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  member_since: string;
};

const roleLabel: Record<string, string> = {
  owner: "Propriétaire",
  admin: "Admin",
  member: "Membre",
};

function formatSince(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("fr-FR", { dateStyle: "medium" }).format(d);
}

function displayName(m: WorkspaceMemberRow): string {
  const n = m.full_name?.trim();
  if (n) return n;
  const local = m.email.split("@")[0];
  return local || "Membre";
}

function canRemoveOther(
  m: WorkspaceMemberRow,
  workspaceOwnerId: string,
  viewerId: string,
  viewerRole: string
): boolean {
  if (m.user_id === workspaceOwnerId) return false;
  if (m.user_id === viewerId) return false;
  if (viewerRole === "owner") return true;
  if (viewerRole === "admin" && m.role === "member") return true;
  return false;
}

function canLeaveSelf(
  m: WorkspaceMemberRow,
  workspaceOwnerId: string,
  viewerId: string
): boolean {
  return m.user_id === viewerId && viewerId !== workspaceOwnerId;
}

type Props = {
  members: WorkspaceMemberRow[];
  currentUserId: string;
  workspaceOwnerId: string;
  viewerRole: "owner" | "admin" | "member";
};

export function WorkspaceTeamList({
  members,
  currentUserId,
  workspaceOwnerId,
  viewerRole,
}: Props) {
  const router = useRouter();
  const [err, setErr] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function runRemove(targetId: string, label: string) {
    if (!window.confirm(label)) return;
    setErr(null);
    startTransition(async () => {
      const res = await removeWorkspaceMemberServer({ memberUserId: targetId });
      if (!res.ok) {
        setErr(res.error);
        return;
      }
      if (targetId === currentUserId) {
        window.location.assign("/dashboard");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-3">
      {err ? (
        <p className="text-creo-sm text-red-600 dark:text-red-400" role="alert">
          {err}
        </p>
      ) : null}
      <ul className="divide-y divide-creo-gray-100 dark:divide-border">
        {members.map((m) => {
          const removeOther = canRemoveOther(
            m,
            workspaceOwnerId,
            currentUserId,
            viewerRole
          );
          const leaveSelf = canLeaveSelf(m, workspaceOwnerId, currentUserId);
          return (
            <li
              key={m.user_id}
              className="flex flex-wrap items-center gap-3 py-4 first:pt-0 last:pb-0"
            >
              <div className="relative size-10 shrink-0 overflow-hidden rounded-full bg-creo-gray-100 dark:bg-white/10">
                {m.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.avatar_url}
                    alt=""
                    width={40}
                    height={40}
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="flex size-full items-center justify-center text-creo-sm font-medium text-creo-gray-500">
                    {displayName(m).slice(0, 1).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{displayName(m)}</span>
                  {m.user_id === currentUserId ? (
                    <span className="text-creo-xs text-creo-gray-500">(toi)</span>
                  ) : null}
                  <Badge variant="gray" className="text-creo-xs">
                    {roleLabel[m.role] ?? m.role}
                  </Badge>
                </div>
                <p className="truncate text-creo-sm text-creo-gray-500">{m.email || "—"}</p>
                <p className="text-creo-xs text-creo-gray-400">
                  Dans l’équipe depuis {formatSince(m.member_since)}
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                {removeOther ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      runRemove(
                        m.user_id,
                        `Retirer ${displayName(m)} de ce workspace ?`
                      )
                    }
                  >
                    Retirer
                  </Button>
                ) : null}
                {leaveSelf ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={pending}
                    className="border-amber-200 text-amber-900 hover:bg-amber-50 dark:border-amber-900/40 dark:text-amber-200 dark:hover:bg-amber-950/40"
                    onClick={() =>
                      runRemove(
                        m.user_id,
                        "Quitter ce workspace ? Tu pourras rejoindre une autre équipe par invitation."
                      )
                    }
                  >
                    Quitter
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
