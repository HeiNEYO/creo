"use client";

import { Camera, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";

import { updateProfileServer } from "@/lib/profile/actions";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const MAX_BYTES = 2 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function initialsFrom(fullName: string, email: string): string {
  const n = fullName.trim();
  if (n) {
    const parts = n.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  }
  const local = email.split("@")[0] ?? "";
  return (local.slice(0, 2) || "?").toUpperCase();
}

type Props = {
  userId: string;
  initialFullName: string;
  initialAvatarUrl: string;
  userEmail: string;
};

export function ProfileForm({
  userId,
  initialFullName,
  initialAvatarUrl,
  userEmail,
}: Props) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(initialFullName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [imgBroken, setImgBroken] = useState(false);

  useEffect(() => {
    setFullName(initialFullName);
    setAvatarUrl(initialAvatarUrl);
  }, [initialFullName, initialAvatarUrl]);

  useEffect(() => {
    setImgBroken(false);
  }, [avatarUrl]);

  const showAvatarImage = Boolean(avatarUrl?.trim()) && !imgBroken;
  const initials = initialsFrom(fullName, userEmail);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    startTransition(async () => {
      const res = await updateProfileServer({ fullName, avatarUrl });
      setMsg(res.ok ? "Profil enregistré." : res.error);
      if (res.ok) router.refresh();
    });
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setMsg(null);
    if (!file.type.startsWith("image/")) {
      setMsg("Choisis une image (JPG, PNG, WebP ou GIF).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setMsg("Image trop lourde (maximum 2 Mo).");
      return;
    }

    setUploading(true);
    const supabase = createClient();
    const path = `${userId}/avatar`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, {
      upsert: true,
      cacheControl: "3600",
      contentType: file.type,
    });

    if (upErr) {
      setMsg(
        upErr.message.includes("Bucket not found")
          ? "Le stockage des avatars n’est pas configuré (bucket « avatars »). Applique la migration Supabase ou crée le bucket."
          : upErr.message
      );
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    const publicUrl = data.publicUrl;

    const res = await updateProfileServer({ fullName, avatarUrl: publicUrl });
    setUploading(false);
    if (res.ok) {
      setAvatarUrl(publicUrl);
      setMsg("Photo mise à jour.");
      router.refresh();
    } else {
      setMsg(res.error);
    }
  }

  function removePhoto() {
    if (!avatarUrl.trim()) return;
    if (!window.confirm("Retirer la photo de profil ?")) return;
    setMsg(null);
    startTransition(async () => {
      const supabase = createClient();
      await supabase.storage.from("avatars").remove([`${userId}/avatar`]);
      const res = await updateProfileServer({ fullName, avatarUrl: "" });
      if (res.ok) {
        setAvatarUrl("");
        setMsg("Photo retirée.");
        router.refresh();
      } else {
        setMsg(res.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-creo-md font-semibold">Identité</h2>
        <p className="mt-1 text-creo-sm text-creo-gray-500">
          Photo affichée dans le menu latéral du tableau de bord.
        </p>
      </div>
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div
            className={cn(
              "relative flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-creo-gray-200 bg-creo-gray-100 dark:border-border dark:bg-muted/40"
            )}
          >
            {showAvatarImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- URL utilisateur / Storage
              <img
                src={avatarUrl.trim()}
                alt=""
                className="size-full object-cover"
                onError={() => setImgBroken(true)}
              />
            ) : (
              <span className="flex size-full items-center justify-center bg-gradient-to-br from-[#4a4a8a] to-[#2a2a4a] text-xl font-bold text-white">
                {initials}
              </span>
            )}
            {uploading ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-creo-xs font-medium text-white">
                Envoi…
              </div>
            ) : null}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => void onFileChange(e)}
              disabled={uploading || pending}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                disabled={uploading || pending}
                onClick={() => fileRef.current?.click()}
              >
                <Camera className="size-4" />
                {avatarUrl.trim() ? "Changer la photo" : "Ajouter une photo"}
              </Button>
              {avatarUrl.trim() ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={uploading || pending}
                  onClick={removePhoto}
                >
                  Retirer
                </Button>
              ) : null}
            </div>
            <p className="flex items-center gap-1.5 text-creo-xs text-creo-gray-500">
              <User className="size-3.5 shrink-0 opacity-70" />
              JPG, PNG, WebP ou GIF · max 2 Mo
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="pf-email">Email</Label>
          <Input
            id="pf-email"
            type="email"
            readOnly
            value={userEmail}
            className="bg-creo-gray-50 dark:bg-muted/40"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pf-name">Nom affiché</Label>
          <Input
            id="pf-name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Prénom Nom"
            disabled={pending}
          />
        </div>

        <details className="rounded-creo-md border border-creo-gray-200 p-3 dark:border-border">
          <summary className="cursor-pointer text-creo-sm font-medium text-creo-gray-700 dark:text-foreground">
            Lien URL (optionnel)
          </summary>
          <p className="mt-2 text-creo-xs text-creo-gray-500">
            Utilise une image déjà hébergée ailleurs (Gravatar, CDN…) à la place du fichier
            ci-dessus.
          </p>
          <div className="mt-3 space-y-2">
            <Label htmlFor="pf-avatar">URL de la photo</Label>
            <Input
              id="pf-avatar"
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://…"
              disabled={pending}
            />
          </div>
        </details>

        {msg ? (
          <p
            className={`text-creo-sm ${msg.includes("à jour") || msg.includes("enregistré") || msg.includes("retirée") ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}
            role="status"
          >
            {msg}
          </p>
        ) : null}
        <Button type="submit" disabled={pending || uploading}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </form>
    </div>
  );
}
