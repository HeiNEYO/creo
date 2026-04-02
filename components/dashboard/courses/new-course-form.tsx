"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createCourseServer } from "@/lib/courses/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function NewCourseForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createCourseServer({ title });
      if (res.ok) {
        router.push(`/dashboard/courses/${res.id}`);
        router.refresh();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="course-title">Titre de la formation</Label>
        <Input
          id="course-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex. Lancer son offre en 7 jours"
          required
          disabled={pending}
        />
      </div>
      {error ? (
        <p className="text-creo-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : "Créer et ouvrir l’éditeur"}
      </Button>
    </form>
  );
}
