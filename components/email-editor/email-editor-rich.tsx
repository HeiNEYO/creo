"use client";

import {
  Bold,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Maximize2,
  Redo2,
  Underline,
  Undo2,
  Upload,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type ReactNode,
} from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveEmailCampaignDesignServer } from "@/lib/emails/actions";
import {
  extractRichBodyFromSavedHtml,
  wrapRichEmailHtml,
} from "@/lib/email-editor/wrap-rich-email-html";

const DEFAULT_BODY = "<p><br></p>";
/** Limite pour intégration base64 dans l’e-mail (délivrabilité / taille du JSON). */
const MAX_IMAGE_FILE_BYTES = 450 * 1024;

type RichDocument = { mode: "rich"; body: string };

function isLegacyBlockDocument(content: unknown): boolean {
  const c = content as Record<string, unknown> | null;
  const doc = c?.document;
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    return false;
  }
  const d = doc as { version?: number; sections?: unknown; mode?: string };
  if (d.mode === "rich") {
    return false;
  }
  return d.version === 2 && Array.isArray(d.sections);
}

function getBodyFromContent(content: unknown): string | null {
  const c = content as Record<string, unknown> | null;
  const doc = c?.document;
  if (!doc || typeof doc !== "object" || Array.isArray(doc)) {
    return null;
  }
  const d = doc as { mode?: string; body?: string };
  if (d.mode === "rich" && typeof d.body === "string" && d.body.trim()) {
    return d.body;
  }
  return null;
}

type Props = {
  campaignId: string;
  initialContent: unknown;
};

function getSelectedImg(editorRoot: HTMLElement): HTMLImageElement | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    return null;
  }
  const r = sel.getRangeAt(0);
  let n: Node | null = r.commonAncestorContainer;
  if (n.nodeType === Node.TEXT_NODE) {
    n = n.parentNode;
  }
  if (n instanceof Element) {
    const el = n.tagName === "IMG" ? n : n.closest("img");
    if (el instanceof HTMLImageElement && editorRoot.contains(el)) {
      return el;
    }
  }
  return null;
}

function getCurrentWidthDisplay(img: HTMLImageElement): string {
  const s = img.style.width?.trim();
  if (s) {
    return s;
  }
  const w = img.getAttribute("width");
  if (w) {
    if (/^\d+$/.test(w)) {
      return `${w}px`;
    }
    return w;
  }
  const nw = img.naturalWidth;
  if (nw > 0) {
    return `${Math.min(nw, 600)}px`;
  }
  return "100%";
}

/** Retourne une valeur CSS largeur utilisable (px ou %). */
function normalizeWidthValue(raw: string): string | null {
  const v = raw.trim().replace(/\s+/g, "");
  if (!v) {
    return null;
  }
  if (/^\d+(\.\d+)?%$/.test(v)) {
    return v;
  }
  if (/^\d+(\.\d+)?px$/i.test(v)) {
    return v.toLowerCase();
  }
  if (/^\d+$/.test(v)) {
    return `${v}px`;
  }
  return null;
}

export function EmailEditorRich({ campaignId, initialContent }: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [legacyBanner, setLegacyBanner] = useState(false);
  const [imageResizeOpen, setImageResizeOpen] = useState(false);
  const [imageWidthInput, setImageWidthInput] = useState("");
  const imageResizeRef = useRef<HTMLImageElement | null>(null);

  const runCommand = useCallback((command: string, value?: string) => {
    const el = editorRef.current;
    if (!el) {
      return;
    }
    el.focus();
    try {
      document.execCommand(command, false, value);
    } catch {
      /* navigateurs récents : commandes limitées */
    }
  }, []);

  const insertLink = useCallback(() => {
    const url = window.prompt("URL du lien (https://…)");
    if (!url?.trim()) {
      return;
    }
    let normalized = url.trim();
    if (!/^https?:\/\//i.test(normalized) && !/^mailto:/i.test(normalized)) {
      normalized = `https://${normalized}`;
    }
    runCommand("createLink", normalized);
  }, [runCommand]);

  const insertImageByUrl = useCallback(() => {
    const url = window.prompt("URL de l’image (HTTPS recommandé)");
    if (!url?.trim()) {
      return;
    }
    const src = url.trim();
    const alt = window.prompt("Texte alternatif (optionnel)") ?? "";
    const img = `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}" style="max-width:100%;height:auto;display:block;border:0;outline:none;" />`;
    runCommand("insertHTML", img);
  }, [runCommand]);

  const closeImageResizePanel = useCallback(() => {
    imageResizeRef.current?.removeAttribute("data-creo-img-active");
    imageResizeRef.current = null;
    setImageResizeOpen(false);
    setImageWidthInput("");
  }, []);

  const openResizeForImage = useCallback((img: HTMLImageElement) => {
    const root = editorRef.current;
    if (!root?.contains(img)) {
      return;
    }
    root.querySelectorAll("img[data-creo-img-active]").forEach((el) => {
      el.removeAttribute("data-creo-img-active");
    });
    img.setAttribute("data-creo-img-active", "1");
    imageResizeRef.current = img;
    setImageWidthInput(getCurrentWidthDisplay(img));
    setImageResizeOpen(true);
    setMsg(null);
  }, []);

  const applyImageWidth = useCallback(() => {
    const img = imageResizeRef.current;
    if (!img || !editorRef.current?.contains(img)) {
      closeImageResizePanel();
      return;
    }
    const normalized = normalizeWidthValue(imageWidthInput);
    if (normalized === null) {
      setMsg("Largeur invalide (ex. 320, 320px, 50 %, 100 %).");
      return;
    }
    img.style.width = normalized;
    img.style.maxWidth = "100%";
    img.style.height = "auto";
    img.style.boxSizing = "border-box";
    img.removeAttribute("width");
    img.removeAttribute("height");
    setMsg(null);
  }, [closeImageResizePanel, imageWidthInput]);

  const openResizeFromToolbar = useCallback(() => {
    const root = editorRef.current;
    if (!root) {
      return;
    }
    const fromSelection = getSelectedImg(root);
    const img = fromSelection ?? imageResizeRef.current;
    if (!img || !root.contains(img)) {
      setMsg("Clique sur une image dans le message, ou place le curseur dessus.");
      return;
    }
    openResizeForImage(img);
  }, [openResizeForImage]);

  const insertImageFromFile = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file || !file.type.startsWith("image/")) {
        return;
      }
      if (file.size > MAX_IMAGE_FILE_BYTES) {
        setMsg(
          `Fichier trop volumineux (max. ${Math.round(MAX_IMAGE_FILE_BYTES / 1024)} Ko). Réduis l’image ou utilise une URL hébergée.`
        );
        return;
      }
      setMsg(null);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result ?? "");
        const alt =
          window.prompt("Texte alternatif (optionnel)", file.name.replace(/\.[^.]+$/, "")) ?? "";
        const img = `<img src="${escapeAttr(dataUrl)}" alt="${escapeAttr(alt)}" style="max-width:100%;height:auto;display:block;border:0;outline:none;" />`;
        runCommand("insertHTML", img);
      };
      reader.readAsDataURL(file);
    },
    [runCommand]
  );

  useEffect(() => {
    if (!imageResizeOpen) {
      return;
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeImageResizePanel();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [imageResizeOpen, closeImageResizePanel]);

  useLayoutEffect(() => {
    const el = editorRef.current;
    if (!el) {
      return;
    }

    closeImageResizePanel();

    const fromDoc = getBodyFromContent(initialContent);
    if (fromDoc) {
      el.innerHTML = fromDoc;
      setLegacyBanner(isLegacyBlockDocument(initialContent));
      return;
    }

    const c = initialContent as Record<string, unknown> | null;
    const htmlStr = typeof c?.html === "string" ? c.html : "";
    if (htmlStr) {
      const extracted = extractRichBodyFromSavedHtml(htmlStr);
      el.innerHTML = extracted ?? DEFAULT_BODY;
    } else {
      el.innerHTML = DEFAULT_BODY;
    }

    setLegacyBanner(isLegacyBlockDocument(initialContent));
  }, [initialContent, closeImageResizePanel]);

  function save() {
    setMsg(null);
    const body = editorRef.current?.innerHTML?.trim() ? editorRef.current.innerHTML : DEFAULT_BODY;
    const htmlBody = wrapRichEmailHtml(body);
    const documentPayload: RichDocument = { mode: "rich", body };
    startTransition(async () => {
      const res = await saveEmailCampaignDesignServer({
        campaignId,
        document: documentPayload,
        htmlBody,
        editorVersion: 3,
      });
      setMsg(res.ok ? "Design enregistré." : res.error);
      if (res.ok) {
        setLegacyBanner(false);
      }
    });
  }

  return (
    <div className="space-y-4">
      {legacyBanner ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-creo-sm text-amber-950 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
          role="status"
        >
          Cette campagne utilisait l’ancien éditeur par blocs. Le contenu n’est pas repris ici.
          Utilise l’éditeur HTML pour récupérer le code, ou recomposer dans cet éditeur.
        </div>
      ) : null}

      <Card className="overflow-hidden">
        <div
          className="flex flex-wrap items-center gap-0.5 border-b border-creo-gray-200 bg-creo-gray-50/80 px-2 py-1.5 dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)]"
          role="toolbar"
          aria-label="Mise en forme"
        >
          <ToolbarIconButton
            label="Gras"
            disabled={pending}
            onClick={() => runCommand("bold")}
            icon={<Bold className="size-4" />}
          />
          <ToolbarIconButton
            label="Italique"
            disabled={pending}
            onClick={() => runCommand("italic")}
            icon={<Italic className="size-4" />}
          />
          <ToolbarIconButton
            label="Souligné"
            disabled={pending}
            onClick={() => runCommand("underline")}
            icon={<Underline className="size-4" />}
          />
          <span className="mx-1 h-6 w-px bg-creo-gray-200 dark:bg-[var(--creo-dashboard-border)]" />
          <ToolbarIconButton
            label="Liste à puces"
            disabled={pending}
            onClick={() => runCommand("insertUnorderedList")}
            icon={<List className="size-4" />}
          />
          <ToolbarIconButton
            label="Liste numérotée"
            disabled={pending}
            onClick={() => runCommand("insertOrderedList")}
            icon={<ListOrdered className="size-4" />}
          />
          <span className="mx-1 h-6 w-px bg-creo-gray-200 dark:bg-[var(--creo-dashboard-border)]" />
          <ToolbarIconButton
            label="Lien"
            disabled={pending}
            onClick={insertLink}
            icon={<Link2 className="size-4" />}
          />
          <ToolbarIconButton
            label="Image depuis l’ordinateur"
            disabled={pending}
            onClick={() => imageFileInputRef.current?.click()}
            icon={<Upload className="size-4" />}
          />
          <input
            ref={imageFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={insertImageFromFile}
          />
          <ToolbarIconButton
            label="Image (URL)"
            disabled={pending}
            onClick={insertImageByUrl}
            icon={<ImageIcon className="size-4" />}
          />
          <ToolbarIconButton
            label="Taille de l’image"
            disabled={pending}
            onClick={openResizeFromToolbar}
            icon={<Maximize2 className="size-4" />}
          />
          <span className="mx-1 h-6 w-px bg-creo-gray-200 dark:bg-[var(--creo-dashboard-border)]" />
          <ToolbarIconButton
            label="Annuler"
            disabled={pending}
            onClick={() => runCommand("undo")}
            icon={<Undo2 className="size-4" />}
          />
          <ToolbarIconButton
            label="Rétablir"
            disabled={pending}
            onClick={() => runCommand("redo")}
            icon={<Redo2 className="size-4" />}
          />
        </div>

        {imageResizeOpen ? (
          <div
            id="image-resize-panel"
            className="flex flex-wrap items-end gap-2 border-b border-creo-gray-200 bg-creo-gray-50/50 px-3 py-2 dark:border-[var(--creo-dashboard-border)] dark:bg-[var(--creo-surface-raised)]"
          >
            <div className="flex min-w-[140px] flex-1 flex-col gap-1 sm:max-w-[220px]">
              <Label htmlFor="email-img-width" className="text-creo-xs">
                Largeur (px ou %)
              </Label>
              <Input
                id="email-img-width"
                value={imageWidthInput}
                onChange={(e) => setImageWidthInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyImageWidth();
                  }
                }}
                placeholder="ex. 320, 50%, 100%"
                disabled={pending}
                className="text-creo-sm"
              />
            </div>
            <div className="flex flex-wrap items-center gap-1 pb-0.5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-creo-xs"
                disabled={pending}
                onClick={() => setImageWidthInput("100%")}
              >
                100 %
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-creo-xs"
                disabled={pending}
                onClick={() => setImageWidthInput("50%")}
              >
                50 %
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-creo-xs"
                disabled={pending}
                onClick={() => setImageWidthInput("320")}
              >
                320 px
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 text-creo-xs"
                disabled={pending}
                onClick={() => setImageWidthInput("600")}
              >
                600 px
              </Button>
            </div>
            <div className="flex gap-2 pb-0.5">
              <Button type="button" size="sm" disabled={pending} onClick={applyImageWidth}>
                Appliquer
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={pending}
                onClick={closeImageResizePanel}
              >
                Fermer
              </Button>
            </div>
          </div>
        ) : null}

        <div
          ref={editorRef}
          className="min-h-[360px] max-w-none px-4 py-3 text-creo-sm leading-relaxed text-creo-gray-900 outline-none dark:text-creo-gray-100 [&_a]:text-creo-purple dark:[&_a]:text-creo-blue-readable [&_a]:underline [&_img]:max-w-full [&_img]:cursor-pointer [&_img]:align-middle [&_img[data-creo-img-active]]:ring-2 [&_img[data-creo-img-active]]:ring-creo-purple [&_img[data-creo-img-active]]:ring-offset-2 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_p]:min-h-[1.25em]"
          contentEditable={!pending}
          suppressContentEditableWarning
          onInput={() => setMsg(null)}
          onClick={(e) => {
            const t = e.target;
            if (t instanceof HTMLImageElement) {
              openResizeForImage(t);
              return;
            }
            const path = e.nativeEvent.composedPath();
            const hitPanel = path.some(
              (n) => n instanceof HTMLElement && n.id === "image-resize-panel"
            );
            if (hitPanel) {
              return;
            }
            closeImageResizePanel();
          }}
        />
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="button" onClick={save} disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer le design"}
        </Button>
        {msg ? (
          <p className="text-creo-sm text-creo-gray-600 dark:text-muted-foreground" role="status">
            {msg}
          </p>
        ) : null}
      </div>

      <p className="text-creo-xs text-creo-gray-500">
        Variables : {"{{first_name}}"}, {"{{last_name}}"}, {"{{email}}"} seront remplacées à
        l’envoi. Images depuis le PC : max. ~450 Ko (sinon héberge le fichier et utilise l’URL).
      </p>
    </div>
  );
}

function ToolbarIconButton({
  label,
  icon,
  onClick,
  disabled,
}: {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="h-9 w-9 shrink-0 p-0"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
    </Button>
  );
}

function escapeAttr(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
