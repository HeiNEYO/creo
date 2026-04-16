"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { NewCourseForm } from "@/components/dashboard/courses/new-course-form";

type NewCourseDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function NewCourseDialog({ open, onClose }: NewCourseDialogProps) {
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        aria-label="Fermer"
        onClick={onClose}
      />
      <div
        className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-creo-xl bg-creo-white p-6 shadow-creo-modal dark:bg-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-course-dialog-title"
      >
        <div className="mb-4">
          <h2 id="new-course-dialog-title" className="text-creo-lg font-semibold">
            Nouvelle formation
          </h2>
          <p className="mt-1 text-creo-sm text-creo-gray-500">
            Renseigne les infos principales ; tu pourras affiner le contenu dans l’éditeur.
          </p>
        </div>
        <NewCourseForm
          submitLabel="Créer la formation"
          onCreated={(id) => {
            onClose();
            router.push(`/dashboard/courses/${id}`);
            router.refresh();
          }}
        />
      </div>
    </div>
  );
}
