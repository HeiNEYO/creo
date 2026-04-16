"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { createCourseServer } from "@/lib/courses/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ACCESS_OPTIONS: { value: "paid" | "free" | "members_only"; label: string }[] = [
  { value: "paid", label: "Payant" },
  { value: "free", label: "Gratuit" },
  { value: "members_only", label: "Membres uniquement" },
];

type NewCourseFormProps = {
  /** Après création réussie (ex. fermeture dialog + navigation). */
  onCreated?: (courseId: string) => void;
  submitLabel?: string;
};

export function NewCourseForm({ onCreated, submitLabel }: NewCourseFormProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("eur");
  const [accessType, setAccessType] = useState<"paid" | "free" | "members_only">("paid");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const priceNum = parseFloat(price.replace(",", "."));
    const priceFinal =
      Number.isFinite(priceNum) && priceNum >= 0 ? priceNum : 0;

    startTransition(async () => {
      const res = await createCourseServer({
        title,
        description: description.trim() || null,
        thumbnail_url: thumbnailUrl.trim() || null,
        price: priceFinal,
        currency: currency.trim() || "eur",
        access_type: accessType,
      });
      if (res.ok) {
        if (onCreated) {
          onCreated(res.id);
        } else {
          router.push(`/dashboard/courses/${res.id}`);
          router.refresh();
        }
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="course-title">Nom de la formation</Label>
        <Input
          id="course-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex. Lancer son offre en 7 jours"
          required
          disabled={pending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-desc">Résumé (optionnel)</Label>
        <textarea
          id="course-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Une phrase pour toi et tes élèves…"
          disabled={pending}
          rows={3}
          className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex min-h-[80px] w-full rounded-md border px-3 py-2 text-creo-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-thumb">Image de couverture (URL)</Label>
        <Input
          id="course-thumb"
          type="url"
          inputMode="url"
          value={thumbnailUrl}
          onChange={(e) => setThumbnailUrl(e.target.value)}
          placeholder="https://…"
          disabled={pending}
        />
        <p className="text-creo-xs text-creo-gray-500">
          Colle un lien vers une image (hébergement, CDN, etc.).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="course-price">Prix</Label>
          <Input
            id="course-price"
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0"
            disabled={pending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="course-currency">Devise</Label>
          <Input
            id="course-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            placeholder="eur"
            maxLength={8}
            disabled={pending}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="course-access">Accès</Label>
        <select
          id="course-access"
          value={accessType}
          onChange={(e) =>
            setAccessType(e.target.value as "paid" | "free" | "members_only")
          }
          disabled={pending}
          className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-creo-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {ACCESS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <p className="text-creo-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Création…" : submitLabel ?? "Créer et ouvrir l’éditeur"}
      </Button>
    </form>
  );
}
