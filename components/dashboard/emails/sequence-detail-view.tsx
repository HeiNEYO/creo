"use client";

import Link from "next/link";
import { ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  addEmailSequenceStepServer,
  deleteEmailSequenceStepServer,
  moveEmailSequenceStepServer,
  updateEmailSequenceStepServer,
} from "@/lib/emails/actions";
import { emailCrmRoutes } from "@/lib/email-crm/routes";
import { PageHeader } from "@/components/dashboard/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type SequenceStepRow = {
  id: string;
  position: number;
  subject: string;
  delay_days: number;
  delay_hours: number;
  content: unknown;
};

type SequenceMeta = {
  id: string;
  name: string;
  active: boolean;
};

type Props = {
  sequence: SequenceMeta;
  steps: SequenceStepRow[];
};

function htmlFromContent(content: unknown): string {
  if (
    content &&
    typeof content === "object" &&
    !Array.isArray(content) &&
    typeof (content as { html?: string }).html === "string"
  ) {
    return (content as { html: string }).html;
  }
  return "<p>Bonjour {{first_name}},</p>";
}

function delayLabel(days: number, hours: number): string {
  const parts: string[] = [];
  if (days > 0) {
    parts.push(`J+${days}`);
  }
  if (hours > 0) {
    parts.push(`${hours} h`);
  }
  if (parts.length === 0) {
    return "Immédiat (après étape préc.)";
  }
  return parts.join(" · ");
}

export function SequenceDetailView({ sequence, steps }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [subject, setSubject] = useState("");
  const [delayDays, setDelayDays] = useState("0");
  const [delayHours, setDelayHours] = useState("0");
  const [htmlBody, setHtmlBody] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  function openAdd() {
    setEditingId(null);
    setSubject("");
    setDelayDays("0");
    setDelayHours("0");
    setHtmlBody("<p>Bonjour {{first_name}},</p>");
    setFormError(null);
    setDialogOpen(true);
  }

  function openEdit(step: SequenceStepRow) {
    setEditingId(step.id);
    setSubject(step.subject);
    setDelayDays(String(step.delay_days));
    setDelayHours(String(step.delay_hours));
    setHtmlBody(htmlFromContent(step.content));
    setFormError(null);
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setFormError(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const d = Number.parseInt(delayDays, 10);
    const h = Number.parseInt(delayHours, 10);
    if (Number.isNaN(d) || d < 0) {
      setFormError("Jours invalides.");
      return;
    }
    if (Number.isNaN(h) || h < 0 || h > 23) {
      setFormError("Heures : 0 à 23.");
      return;
    }

    startTransition(async () => {
      if (editingId) {
        const res = await updateEmailSequenceStepServer({
          stepId: editingId,
          subject,
          delayDays: d,
          delayHours: h,
          htmlBody,
        });
        if (res.ok) {
          closeDialog();
          router.refresh();
        } else {
          setFormError(res.error);
        }
      } else {
        const res = await addEmailSequenceStepServer({
          sequenceId: sequence.id,
          subject,
          delayDays: d,
          delayHours: h,
          htmlBody,
        });
        if (res.ok) {
          closeDialog();
          router.refresh();
        } else {
          setFormError(res.error);
        }
      }
    });
  }

  function moveStep(stepId: string, direction: "up" | "down") {
    setFormError(null);
    startTransition(async () => {
      const res = await moveEmailSequenceStepServer({ stepId, direction });
      if (res.ok) {
        router.refresh();
      } else {
        setFormError(res.error);
      }
    });
  }

  function removeStep(stepId: string, stepSubject: string) {
    if (
      !window.confirm(
        `Supprimer l’étape « ${stepSubject || "sans titre"} » ?`
      )
    ) {
      return;
    }
    setFormError(null);
    startTransition(async () => {
      const res = await deleteEmailSequenceStepServer({ stepId });
      if (res.ok) {
        router.refresh();
      } else {
        setFormError(res.error);
      }
    });
  }

  return (
    <>
      <PageHeader
        title={sequence.name}
        description="Étapes de la séquence — délai après l’étape précédente (ou après le déclencheur pour la 1ʳᵉ). L’exécution automatique sera branchée ensuite."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={sequence.active ? "green" : "gray"}>
              {sequence.active ? "Active" : "Inactive"}
            </Badge>
            <Button type="button" size="sm" onClick={openAdd} disabled={pending}>
              <Plus className="size-4" />
              Ajouter une étape
            </Button>
            <Link
              href={emailCrmRoutes.sequences}
              className={buttonVariants({ variant: "outline", size: "sm" })}
            >
              Retour
            </Link>
          </div>
        }
      />

      {formError && !dialogOpen ? (
        <p className="mb-4 text-creo-sm text-red-600 dark:text-red-400" role="alert">
          {formError}
        </p>
      ) : null}

      {steps.length === 0 ? (
        <Card className="p-8 text-center text-creo-sm text-creo-gray-500">
          Aucune étape. Ajoute un e-mail avec le bouton ci-dessus (délai en jours / heures après
          l’étape précédente).
        </Card>
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-creo-sm">
            <thead className="border-b border-creo-gray-100 bg-creo-gray-50 text-creo-xs uppercase tracking-wide text-creo-gray-500 dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)]">
              <tr>
                <th className="w-12 px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Objet</th>
                <th className="px-4 py-3 text-left">Délai</th>
                <th className="w-40 px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {steps.map((s, idx) => (
                <tr
                  key={s.id}
                  className="border-b border-creo-gray-100 dark:border-[var(--creo-dashboard-border)]"
                >
                  <td className="px-4 py-3 tabular-nums text-creo-gray-500">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium dark:text-white">
                    {s.subject?.trim() ? s.subject : "Sans objet"}
                  </td>
                  <td className="px-4 py-3 text-creo-gray-600 dark:text-creo-gray-400">
                    {delayLabel(s.delay_days, s.delay_hours)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-1"
                        disabled={pending || idx === 0}
                        onClick={() => moveStep(s.id, "up")}
                        title="Monter"
                        aria-label="Monter"
                      >
                        <ChevronUp className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-1"
                        disabled={pending || idx >= steps.length - 1}
                        onClick={() => moveStep(s.id, "down")}
                        title="Descendre"
                        aria-label="Descendre"
                      >
                        <ChevronDown className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2"
                        disabled={pending}
                        onClick={() => openEdit(s)}
                        title="Modifier"
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-red-600 hover:bg-red-50 dark:text-red-400"
                        disabled={pending}
                        onClick={() => removeStep(s.id, s.subject)}
                        title="Supprimer"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {dialogOpen ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 dark:bg-black/60"
            aria-label="Fermer"
            onClick={closeDialog}
          />
          <Card className="relative z-10 flex max-h-[90vh] w-full max-w-lg flex-col space-y-4 overflow-hidden p-6">
            <h2 className="text-lg font-semibold text-[#202223] dark:text-white">
              {editingId ? "Modifier l’étape" : "Nouvelle étape"}
            </h2>
            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col space-y-3">
              <div className="space-y-2">
                <Label htmlFor="step-subject">Objet</Label>
                <Input
                  id="step-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex. Bienvenue !"
                  disabled={pending}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="step-days">Jours après l’étape préc.</Label>
                  <Input
                    id="step-days"
                    type="number"
                    min={0}
                    value={delayDays}
                    onChange={(e) => setDelayDays(e.target.value)}
                    disabled={pending}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="step-hours">Heures (0–23)</Label>
                  <Input
                    id="step-hours"
                    type="number"
                    min={0}
                    max={23}
                    value={delayHours}
                    onChange={(e) => setDelayHours(e.target.value)}
                    disabled={pending}
                  />
                </div>
              </div>
              <div className="min-h-0 flex-1 space-y-2">
                <Label htmlFor="step-html">Corps HTML</Label>
                <textarea
                  id="step-html"
                  className="min-h-[200px] w-full resize-y rounded-md border border-creo-gray-200 bg-white p-3 font-mono text-creo-xs dark:border-input dark:bg-transparent"
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  disabled={pending}
                  spellCheck={false}
                />
              </div>
              {formError ? (
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {formError}
                </p>
              ) : null}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={closeDialog} disabled={pending}>
                  Annuler
                </Button>
                <Button type="submit" disabled={pending}>
                  {pending ? "Enregistrement…" : editingId ? "Enregistrer" : "Ajouter"}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </>
  );
}
