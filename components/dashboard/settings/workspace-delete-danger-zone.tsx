"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { deleteWorkspaceServer } from "@/lib/workspaces/actions";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  workspaceName: string;
  isOwner: boolean;
};

export function WorkspaceDeleteDangerZone({ workspaceName, isOwner }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const trimmed = workspaceName.trim();
  const canSubmit =
    isOwner && trimmed.length > 0 && confirmName.trim() === trimmed;

  function close() {
    if (pending) return;
    setOpen(false);
    setConfirmName("");
    setError(null);
  }

  function submit() {
    if (!canSubmit) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteWorkspaceServer();
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setOpen(false);
      router.replace("/dashboard");
      router.refresh();
    });
  }

  return (
    <>
      {!isOwner ? (
        <p className="text-creo-sm text-creo-gray-500">
          Seul le <strong className="font-medium text-foreground">propriétaire</strong> du
          workspace peut le supprimer. Contacte-le si besoin.
        </p>
      ) : null}
      <Button
        type="button"
        variant="danger"
        size="sm"
        disabled={!isOwner}
        onClick={() => {
          setConfirmName("");
          setError(null);
          setOpen(true);
        }}
      >
        Supprimer le workspace
      </Button>

      {open ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 backdrop-blur-sm dark:bg-black/60"
            aria-label="Fermer"
            onClick={close}
          />
          <Card
            className="relative z-10 w-full max-w-lg space-y-4 border-creo-danger/25 p-6 shadow-creo-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ws-delete-title"
          >
            <h2
              id="ws-delete-title"
              className="text-creo-lg font-semibold text-creo-danger dark:text-red-400"
            >
              Supprimer définitivement ce workspace ?
            </h2>
            <div className="space-y-3 text-creo-sm text-creo-gray-600 dark:text-creo-gray-400">
              <p>
                Toutes les données liées seront effacées :{" "}
                <strong className="font-medium text-foreground">pages</strong>,{" "}
                <strong className="font-medium text-foreground">formations</strong>,{" "}
                <strong className="font-medium text-foreground">contacts</strong>, campagnes
                e-mail, etc. Cette action est{" "}
                <strong className="font-medium text-foreground">irréversible</strong>.
              </p>
              <p>
                Après suppression, un <strong className="font-medium text-foreground">nouveau</strong>{" "}
                workspace vide pourra être créé automatiquement à ta prochaine visite du tableau de
                bord.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ws-delete-confirm">
                Tape le nom exact du workspace pour confirmer :{" "}
                <span className="font-mono text-creo-xs text-foreground">{trimmed || "—"}</span>
              </Label>
              <Input
                id="ws-delete-confirm"
                autoComplete="off"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={trimmed || "Nom du workspace"}
                disabled={pending}
                className="font-mono text-creo-sm"
              />
            </div>
            {error ? (
              <p className="text-creo-sm text-red-600 dark:text-red-400" role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={close} disabled={pending}>
                Annuler
              </Button>
              <Button
                type="button"
                variant="danger"
                disabled={!canSubmit || pending}
                onClick={() => void submit()}
              >
                {pending ? "Suppression…" : "Supprimer définitivement"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
