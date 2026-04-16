"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Eye,
  Globe,
  Monitor,
  Redo2,
  Save,
  Smartphone,
  Tablet,
  Undo2,
} from "lucide-react";
import { nanoid } from "nanoid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "zustand/react";

import { CreoPageEditor } from "@/components/builder/page-editor/creo-page-editor";
import { PageEditorProvider, usePageEditorStore } from "@/components/builder/page-editor/page-editor-context";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updatePageServer } from "@/lib/pages/actions";
import { mergeDocumentIntoContent, documentFromPageContent } from "@/lib/pages/editor/document-io";
import type { EditorStore } from "@/lib/pages/editor/editor-store";
import type { PageDocument } from "@/lib/pages/editor/page-document.types";
import { PAGE_TYPE_LABELS } from "@/lib/pages/page-types";
import { parseCheckoutContent } from "@/lib/public-pages/checkout-config";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";

function parseContent(raw: unknown): Record<string, unknown> {
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    try {
      const c = JSON.parse(JSON.stringify(raw)) as Record<string, unknown>;
      if (!c.meta || typeof c.meta !== "object" || Array.isArray(c.meta)) {
        c.meta = {};
      }
      return c;
    } catch {
      return { id: "", editorVersion: 1, meta: {}, blocks: [] };
    }
  }
  return { id: "", editorVersion: 1, meta: {}, blocks: [] };
}

export type BuilderShellProps = {
  pageId: string;
  pageSlug: string;
  workspaceSlug: string;
  publicPageHref: string | null;
  initialTitle: string;
  initialPublished: boolean;
  initialType: string;
  initialContent: unknown;
};

function BuilderPageStatus({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-[12px] font-medium tracking-tight",
        published
          ? "bg-emerald-500/12 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300"
          : "bg-zinc-500/10 text-zinc-600 dark:bg-zinc-400/10 dark:text-zinc-400"
      )}
      role="status"
    >
      {published ? "Publié" : "Brouillon"}
    </span>
  );
}

function buildContentForSave(
  base: Record<string, unknown>,
  pageType: string,
  priceEuros: string,
  productName: string,
  buttonLabel: string
): Record<string, unknown> {
  if (pageType !== "checkout") {
    return base;
  }
  const euros = Number(priceEuros.replace(",", "."));
  const priceCents = Number.isFinite(euros) ? Math.round(euros * 100) : 0;
  return {
    ...base,
    checkout: {
      price_cents: Math.max(50, priceCents),
      currency: "eur",
      product_name: productName.trim() || "Produit",
      button_label: buttonLabel.trim() || "Payer",
    },
  };
}

function stableJsonKey(value: unknown): string {
  try {
    return JSON.stringify(value ?? null);
  } catch {
    return "null";
  }
}

export function BuilderShell(props: BuilderShellProps) {
  /** Évite de recréer le document (et le store éditeur) quand `initialContent` change seulement de référence (RSC / refresh). */
  const initialContentKey = useMemo(
    () => stableJsonKey(props.initialContent),
    [props.initialContent]
  );

  const initialDoc = useMemo(
    () =>
      documentFromPageContent(props.initialContent, {
        pageId: props.pageId,
        pageTitle: props.initialTitle,
        pageType: props.initialType as PageDocument["pageType"],
        idGen: nanoid,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- snapshot JSON via initialContentKey (refs RSC)
    [props.pageId, props.initialTitle, props.initialType, initialContentKey]
  );

  return (
    <PageEditorProvider pageId={props.pageId} initialDocument={initialDoc}>
      <BuilderShellEditor {...props} />
    </PageEditorProvider>
  );
}

function BuilderShellEditor({
  pageId,
  pageSlug,
  workspaceSlug,
  publicPageHref,
  initialTitle,
  initialPublished,
  initialType,
  initialContent,
}: BuilderShellProps) {
  const store = usePageEditorStore();
  const [device, setDevice] = useState<Device>("desktop");
  const [title, setTitle] = useState(initialTitle);
  const [published, setPublished] = useState(initialPublished);
  const [content, setContent] = useState(() => parseContent(initialContent));
  const [publishPending, setPublishPending] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  /** File d’attente : évite les retours silencieux quand sauvegarde + publication se chevauchent. */
  const saveQueueRef = useRef(Promise.resolve());
  const handleSaveRef = useRef<() => Promise<void>>(async () => {});

  const runSaveQueue = useCallback((fn: () => Promise<void>) => {
    const next = saveQueueRef.current.then(fn).catch((e: unknown) => {
      console.error("[builder save queue]", e);
    });
    saveQueueRef.current = next;
    return next;
  }, []);

  const dirty = useEditorSelector((s) => s.dirty);
  const document = useEditorSelector((s) => s.document);

  const initialCheckout = parseCheckoutContent(initialContent);
  const [priceEuros, setPriceEuros] = useState(() =>
    initialCheckout ? (initialCheckout.price_cents / 100).toFixed(2) : "5.00"
  );
  const [productName, setProductName] = useState(() => initialCheckout?.product_name ?? "Offre");
  const [buttonLabel, setButtonLabel] = useState(
    () => initialCheckout?.button_label ?? "Payer maintenant"
  );

  /** Dernière version enregistrée côté serveur (titre + checkout) — `dirty` ne couvre ni le titre ni les champs Stripe. */
  const [persistBaseline, setPersistBaseline] = useState(() => ({
    title: initialTitle.trim(),
    price: initialCheckout ? (initialCheckout.price_cents / 100).toFixed(2) : "5.00",
    product: initialCheckout?.product_name ?? "Offre",
    button: initialCheckout?.button_label ?? "Payer maintenant",
  }));

  const needsPersistence = useMemo(() => {
    if (dirty) return true;
    if (title.trim() !== persistBaseline.title) return true;
    if (initialType === "checkout") {
      return (
        priceEuros !== persistBaseline.price ||
        productName !== persistBaseline.product ||
        buttonLabel !== persistBaseline.button
      );
    }
    return false;
  }, [
    dirty,
    title,
    persistBaseline,
    initialType,
    priceEuros,
    productName,
    buttonLabel,
  ]);

  const handleSave = useCallback(() => {
    return runSaveQueue(async () => {
      setSaveStatus("saving");
      setSaveMessage(null);
      try {
        const rawDoc = store.getState().document;
        const docForMerge: PageDocument = { ...rawDoc, name: title };
        const merged = mergeDocumentIntoContent(parseContent(content), docForMerge);
        const payload = buildContentForSave(merged, initialType, priceEuros, productName, buttonLabel);
        const serializable = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
        const res = await updatePageServer({
          pageId,
          title,
          content: serializable,
          published,
        });
        if (res.ok) {
          setSaveStatus("saved");
          setContent(serializable);
          store.getState().markSaved();
          setPersistBaseline({
            title: title.trim(),
            price: priceEuros,
            product: productName,
            button: buttonLabel,
          });
          window.setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("error");
          setSaveMessage(res.error);
        }
      } catch (e: unknown) {
        setSaveStatus("error");
        setSaveMessage(e instanceof Error ? e.message : "Erreur lors de l’enregistrement.");
      }
    });
  }, [
    runSaveQueue,
    pageId,
    title,
    content,
    published,
    initialType,
    priceEuros,
    productName,
    buttonLabel,
    store,
  ]);

  const handlePublish = useCallback(() => {
    return runSaveQueue(async () => {
      setPublishPending(true);
      setSaveMessage(null);
      setSaveStatus("saving");
      try {
        const rawDoc = store.getState().document;
        const docForMerge: PageDocument = { ...rawDoc, name: title };
        const merged = mergeDocumentIntoContent(parseContent(content), docForMerge);
        const payload = buildContentForSave(merged, initialType, priceEuros, productName, buttonLabel);
        const serializable = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
        const res = await updatePageServer({
          pageId,
          title,
          content: serializable,
          published: true,
        });
        if (res.ok) {
          setPublished(true);
          setContent(serializable);
          store.getState().markSaved();
          setPersistBaseline({
            title: title.trim(),
            price: priceEuros,
            product: productName,
            button: buttonLabel,
          });
          setSaveStatus("saved");
          window.setTimeout(() => setSaveStatus("idle"), 2000);
        } else {
          setSaveStatus("error");
          setSaveMessage(res.error);
        }
      } catch (e: unknown) {
        setSaveStatus("error");
        setSaveMessage(e instanceof Error ? e.message : "Erreur lors de la publication.");
      } finally {
        setPublishPending(false);
      }
    });
  }, [
    runSaveQueue,
    pageId,
    title,
    content,
    initialType,
    priceEuros,
    productName,
    buttonLabel,
    store,
  ]);

  handleSaveRef.current = handleSave;

  /** Autosave si le canvas, le titre ou le checkout ont changé par rapport au dernier enregistrement. */
  useEffect(() => {
    if (!needsPersistence) return;
    const t = window.setTimeout(() => {
      void handleSaveRef.current();
    }, 30000);
    return () => window.clearTimeout(t);
  }, [needsPersistence, document, title, published, priceEuros, productName, buttonLabel, initialType]);

  const canvasWidth =
    device === "desktop" ? "max-w-none" : device === "tablet" ? "max-w-2xl" : "max-w-sm";

  /** Aperçu public : URL absolue si NEXT_PUBLIC_APP_URL est défini, sinon lien relatif même origine. */
  const previewHref =
    publicPageHref ?? (workspaceSlug && pageSlug ? `/p/${workspaceSlug}/${pageSlug}` : null);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="flex h-[52px] min-h-[52px] shrink-0 items-center gap-2 overflow-x-auto border-b border-creo-gray-200 bg-creo-white px-2 sm:gap-3 sm:px-3 md:px-4 dark:border-creo-blue/20 dark:bg-zinc-950">
        <Link
          href="/dashboard/pages"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "gap-2" })}
        >
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">Dashboard</span>
        </Link>
        <span className="hidden h-6 w-px bg-creo-gray-200 sm:block dark:bg-creo-blue/25" />
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 max-w-[200px] border-transparent px-2 text-creo-md font-semibold text-creo-gray-900 shadow-none focus-visible:ring-1 dark:text-zinc-100 md:max-w-xs"
          aria-label="Titre de la page"
        />
        <BuilderPageStatus published={published} />
        <span
          className="hidden rounded-full bg-zinc-500/10 px-2.5 py-1 text-[12px] font-medium tracking-tight text-zinc-600 md:inline dark:bg-zinc-400/10 dark:text-zinc-400"
          title="Type de page"
        >
          {PAGE_TYPE_LABELS[initialType] ?? initialType}
        </span>
        <div className="ml-auto flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden h-8 w-8 p-0 sm:inline-flex"
            title="Annuler"
            onClick={() => store.getState().undo()}
          >
            <Undo2 className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden h-8 w-8 p-0 sm:inline-flex"
            title="Rétablir"
            onClick={() => store.getState().redo()}
          >
            <Redo2 className="size-4" />
          </Button>
        </div>
        <div className="flex items-center gap-1">
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
                "rounded-lg p-2 transition-colors",
                device === d
                  ? "bg-creo-purple-pale text-creo-blue dark:bg-creo-blue/15 dark:text-creo-blue-soft"
                  : "text-zinc-500 hover:bg-zinc-100/80 dark:text-zinc-400 dark:hover:bg-zinc-800/60"
              )}
              aria-label={d}
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        {published && previewHref ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "inline-flex gap-1",
            })}
            title="Ouvre la page publique dans un nouvel onglet"
          >
            <Eye className="size-4" />
            <span className="hidden sm:inline">Voir en ligne</span>
            <span className="sm:hidden">Aperçu</span>
          </a>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            type="button"
            disabled
            className="inline-flex"
            title="Publie la page pour ouvrir l’aperçu public"
          >
            <Eye className="size-4" />
            <span className="hidden sm:inline">Aperçu</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          type="button"
          className={cn(
            "inline-flex gap-1",
            needsPersistence && saveStatus === "idle" ? "text-amber-700" : ""
          )}
          disabled={saveStatus === "saving" || publishPending}
          onClick={() => void handleSave()}
          title="Sauvegarde automatique 30 s après la dernière modification (si changements non enregistrés)"
        >
          <Save className="size-4" />
          {saveStatus === "saving"
            ? "Enregistrement…"
            : saveStatus === "saved"
              ? "Enregistré"
              : saveStatus === "error"
                ? "Réessayer"
                : needsPersistence
                  ? "Sauvegarder *"
                  : "Sauvegarder"}
        </Button>
        <Button
          variant="default"
          size="sm"
          type="button"
          className={cn(
            "shrink-0 gap-1 bg-creo-purple !text-white hover:bg-creo-purple-light enabled:hover:translate-y-0",
            "dark:bg-creo-purple dark:!text-white dark:hover:bg-creo-purple-light [&_svg]:!text-white [&_svg]:!stroke-white"
          )}
          disabled={publishPending || published}
          onClick={() => void handlePublish()}
        >
          <Globe className="size-4" />
          {published ? "Publié" : publishPending ? "…" : "Publier"}
        </Button>
      </header>

      {saveMessage ? (
        <div className="shrink-0 border-b border-red-100 bg-red-50 px-4 py-2 text-creo-sm text-red-700">
          {saveMessage}
        </div>
      ) : null}

      <div className="min-h-0 flex-1 overflow-hidden">
        <CreoPageEditor
          device={device}
          previewMaxWidth={canvasWidth}
          checkout={
            initialType === "checkout"
              ? {
                  priceEuros,
                  onPriceEurosChange: setPriceEuros,
                  productName,
                  onProductNameChange: setProductName,
                  buttonLabel,
                  onButtonLabelChange: setButtonLabel,
                }
              : null
          }
        />
      </div>
    </div>
  );
}

function useEditorSelector<T>(selector: (s: EditorStore) => T): T {
  const st = usePageEditorStore();
  return useStore(st, selector);
}
