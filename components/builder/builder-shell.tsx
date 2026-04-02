"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Globe,
  Monitor,
  Save,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useCallback, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePageServer } from "@/lib/pages/actions";
import { cn } from "@/lib/utils";

const blockGroups = [
  {
    title: "Structure",
    items: ["Section", "Colonnes 2", "Colonnes 3", "Conteneur"],
  },
  { title: "Texte", items: ["Titre H1", "Titre H2", "Paragraphe", "Citation"] },
  { title: "Médias", items: ["Image", "Vidéo", "Icône"] },
  {
    title: "Conversion",
    items: ["Compte à rebours", "Témoignage", "FAQ", "Prix"],
  },
];

type Device = "desktop" | "tablet" | "mobile";

function parseContent(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    try {
      return JSON.parse(JSON.stringify(raw)) as Record<string, unknown>;
    } catch {
      return { id: "", blocks: [] };
    }
  }
  return { id: "", blocks: [] };
}

const typeLabels: Record<string, string> = {
  landing: "Landing",
  sales: "Vente",
  optin: "Opt-in",
  thankyou: "Merci",
  checkout: "Checkout",
  custom: "Libre",
};

export type BuilderShellProps = {
  pageId: string;
  pageSlug: string;
  workspaceSlug: string;
  /** Lien absolu vers la page publique si NEXT_PUBLIC_APP_URL est défini. */
  publicPageHref: string | null;
  initialTitle: string;
  initialPublished: boolean;
  initialType: string;
  initialContent: unknown;
};

export function BuilderShell({
  pageId,
  pageSlug,
  workspaceSlug,
  publicPageHref,
  initialTitle,
  initialPublished,
  initialType,
  initialContent,
}: BuilderShellProps) {
  const [device, setDevice] = useState<Device>("desktop");
  const [title, setTitle] = useState(initialTitle);
  const [published, setPublished] = useState(initialPublished);
  const [content, setContent] = useState(() => parseContent(initialContent));
  const [publishPending, setPublishPending] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const blockCount = (() => {
    const b = content.blocks;
    return Array.isArray(b) ? b.length : 0;
  })();

  const handleSave = useCallback(async () => {
    setSaveStatus("saving");
    setSaveMessage(null);
    const res = await updatePageServer({
      pageId,
      title,
      content,
      published,
    });
    if (res.ok) {
      setSaveStatus("saved");
      window.setTimeout(() => setSaveStatus("idle"), 2000);
    } else {
      setSaveStatus("error");
      setSaveMessage(res.error);
    }
  }, [pageId, title, content, published]);

  const handlePublish = useCallback(async () => {
    setPublishPending(true);
    setSaveMessage(null);
    const res = await updatePageServer({
      pageId,
      title,
      content,
      published: true,
    });
    setPublishPending(false);
    if (res.ok) {
      setPublished(true);
    } else {
      setSaveMessage(res.error);
    }
  }, [pageId, title, content]);

  const addTextBlock = useCallback(() => {
    setContent((c) => {
      const blocks = Array.isArray(c.blocks) ? [...c.blocks] : [];
      blocks.push({
        id: `blk-${globalThis.crypto?.randomUUID?.() ?? Date.now()}`,
        type: "paragraph",
        text: "Nouveau texte",
      });
      return { ...c, blocks };
    });
  }, []);

  const canvasWidth =
    device === "desktop" ? "max-w-5xl" : device === "tablet" ? "max-w-2xl" : "max-w-sm";

  return (
    <>
      <header className="flex h-[52px] shrink-0 items-center gap-3 border-b border-creo-gray-200 bg-creo-white px-3 md:px-4">
        <Link
          href="/dashboard/pages"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-2" })}
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <span className="hidden h-6 w-px bg-creo-gray-200 sm:block" />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 max-w-[200px] border-transparent px-2 text-creo-md font-semibold shadow-none focus-visible:ring-1 md:max-w-xs"
          aria-label="Titre de la page"
        />
        <Badge variant={published ? "green" : "gray"}>
          {published ? "Publié" : "Brouillon"}
        </Badge>
        <span className="hidden text-creo-xs text-creo-gray-400 md:inline">
          {typeLabels[initialType] ?? initialType}
        </span>
        <div className="ml-auto flex items-center gap-1">
          {(
            [
              ["desktop", Monitor],
              ["tablet", Tablet],
              ["mobile", Smartphone],
            ] as const
          ).map(([d, Icon]) => (
            <button
              key={d}
              type="button"
              onClick={() => setDevice(d)}
              className={cn(
                "rounded-creo-md p-2 transition-colors",
                device === d
                  ? "bg-creo-purple-pale text-creo-purple"
                  : "text-creo-gray-500 hover:bg-creo-gray-100"
              )}
              aria-label={d}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        {publicPageHref && published ? (
          <a
            href={publicPageHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "hidden sm:inline-flex gap-1",
            })}
          >
            <Eye className="size-4" />
            Voir en ligne
          </a>
        ) : (
          <Button variant="ghost" size="sm" type="button" className="hidden sm:flex" disabled>
            <Eye className="size-4" />
            Aperçu
          </Button>
        )}
        <span className="hidden text-creo-xs text-creo-gray-400 xl:inline" title="URL publique">
          /p/{workspaceSlug}/{pageSlug}
        </span>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className="hidden sm:flex gap-1"
          disabled={saveStatus === "saving"}
          onClick={() => void handleSave()}
        >
          <Save className="size-4" />
          {saveStatus === "saving"
            ? "Enregistrement…"
            : saveStatus === "saved"
              ? "Enregistré"
              : saveStatus === "error"
                ? "Réessayer"
                : "Sauvegarder"}
        </Button>
        <Button
          size="sm"
          type="button"
          className="gap-1"
          disabled={publishPending || published}
          onClick={() => void handlePublish()}
        >
          <Globe className="size-4" />
          {published ? "Publié" : publishPending ? "…" : "Publier"}
        </Button>
      </header>

      {saveMessage ? (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2 text-creo-sm text-red-700">
          {saveMessage}
        </div>
      ) : null}

      <div className="flex min-h-[calc(100vh-52px)] flex-1">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-creo-gray-200 bg-creo-white lg:flex">
          <div className="border-b border-creo-gray-100 p-3">
            <div className="flex gap-1 rounded-creo-md bg-creo-gray-100 p-0.5 text-creo-xs font-medium">
              {["Blocs", "Calques", "Pages"].map((t, i) => (
                <button
                  key={t}
                  type="button"
                  className={cn(
                    "flex-1 rounded-md py-1.5",
                    i === 0 ? "bg-creo-white shadow-sm" : "text-creo-gray-500"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            {blockGroups.map((g) => (
              <div key={g.title} className="mb-4">
                <p className="mb-2 text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
                  {g.title}
                </p>
                <ul className="space-y-1">
                  {g.items.map((name) => (
                    <li
                      key={name}
                      className="cursor-grab rounded-creo-md border border-dashed border-creo-gray-200 px-3 py-2 text-creo-sm text-creo-gray-700 hover:border-creo-purple/30 hover:bg-creo-purple-pale/30"
                    >
                      {name}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </aside>

        <div className="flex flex-1 items-start justify-center overflow-auto p-4 md:p-8">
          <div
            className={cn(
              "min-h-[480px] w-full rounded-creo-lg border border-creo-gray-200 bg-creo-white shadow-sm transition-all",
              canvasWidth
            )}
          >
            <div className="m-4 flex min-h-[400px] flex-col items-center justify-center rounded-creo-md border-2 border-dashed border-creo-gray-200 text-creo-sm text-creo-gray-500">
              <p>Canvas — glisse des blocs ici</p>
              <p className="mt-2 text-creo-xs text-creo-gray-400">
                {blockCount} bloc{blockCount !== 1 ? "s" : ""} enregistré(s) dans le
                contenu
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={addTextBlock}
              >
                + Bloc texte (démo)
              </Button>
            </div>
          </div>
        </div>

        <aside className="hidden w-[320px] shrink-0 flex-col border-l border-creo-gray-200 bg-creo-white xl:flex">
          <div className="border-b border-creo-gray-100 p-4">
            <p className="text-creo-sm font-semibold">Propriétés</p>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center p-6 text-center text-creo-sm text-creo-gray-500">
            Sélectionne un bloc pour l’éditer
          </div>
        </aside>
      </div>
    </>
  );
}
