"use client";

import { useDraggable } from "@dnd-kit/core";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";
import {
  BookText,
  ChevronDown,
  CreditCard,
  FileText,
  Heading1,
  Image,
  Layers,
  LayoutGrid,
  Link2,
  List,
  Mail,
  Minus,
  MousePointer,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Square,
  Timer,
  Type,
  Video,
} from "lucide-react";

import {
  EditorPropertiesPanelContent,
  type EditorCheckoutBinding,
} from "@/components/builder/page-editor/editor-right-panel";
import { useEditorSelector } from "@/components/builder/page-editor/page-editor-context";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { EditorSelectionType } from "@/lib/pages/editor/editor-store";
import { creoPaletteDragId, CREO_PALETTE_SECTION_ID } from "@/lib/pages/editor/dnd-ids";
import type { ElementType } from "@/lib/pages/editor/page-document.types";

type LibItem = { type: ElementType; label: string; icon: typeof Type };

const CATEGORIES: { title: string; items: LibItem[] }[] = [
  {
    title: "Texte & typo",
    items: [
      { type: "heading", label: "Titre", icon: Heading1 },
      { type: "text", label: "Paragraphe", icon: FileText },
      { type: "richtext", label: "Texte riche", icon: BookText },
      { type: "list", label: "Liste", icon: List },
    ],
  },
  {
    title: "Médias",
    items: [
      { type: "image", label: "Image", icon: Image },
      { type: "video", label: "Vidéo", icon: Video },
    ],
  },
  {
    title: "Interactif",
    items: [
      { type: "button", label: "Bouton", icon: MousePointer },
      { type: "link", label: "Lien", icon: Link2 },
    ],
  },
  {
    title: "Formulaires",
    items: [{ type: "optin", label: "Opt-in", icon: Mail }],
  },
  {
    title: "Mise en page",
    items: [
      { type: "divider", label: "Séparateur", icon: Minus },
      { type: "contentbox", label: "Bloc contenu", icon: Square },
    ],
  },
  {
    title: "Conversion",
    items: [
      { type: "countdown", label: "Compte à rebours", icon: Timer },
      { type: "faq", label: "FAQ", icon: ChevronDown },
    ],
  },
  {
    title: "Commerce",
    items: [
      { type: "ordersummary", label: "Récap commande", icon: ShoppingCart },
      { type: "paymentform", label: "Paiement", icon: CreditCard },
    ],
  },
];

export function getPaletteItemLabel(type: ElementType): string {
  for (const cat of CATEGORIES) {
    const found = cat.items.find((i) => i.type === type);
    if (found) return found.label;
  }
  return type;
}

function propertiesSubtitle(selectedId: string | null, selectedType: EditorSelectionType): string {
  if (!selectedId || selectedType === null) return "Meta & SEO de la page";
  switch (selectedType) {
    case "section":
      return "Section sélectionnée";
    case "row":
      return "Ligne";
    case "column":
      return "Colonne";
    case "element":
      return "Bloc sélectionné";
    default:
      return "Réglages";
  }
}

type SidebarTab = "structure" | "properties";

const SIDEBAR_WIDTH_KEY = "creo-builder-sidebar-width";
/** Largeur par défaut = minimum (comportement d’origine). */
const SIDEBAR_MIN_PX = 284;
/** Extension max (~+156px) — assez d’espace sans envahir l’écran. */
const SIDEBAR_MAX_PX = 440;

function clampSidebarWidth(n: number): number {
  return Math.min(SIDEBAR_MAX_PX, Math.max(SIDEBAR_MIN_PX, Math.round(n)));
}

function SectionPaletteRow() {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: CREO_PALETTE_SECTION_ID,
    data: { source: "palette" as const, kind: "section" as const },
  });

  return (
    <li>
      <div
        ref={setNodeRef}
        className={cn(
          "flex w-full cursor-grab touch-none items-center gap-2 rounded-[10px] border border-zinc-200/70 bg-white px-3 py-2.5 text-left text-[13px] font-semibold tracking-[-0.01em] text-zinc-800 transition-colors active:cursor-grabbing dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-200",
          isDragging && "opacity-40"
        )}
        title="Glisse sur la zone « Nouvelle section » ou sur le canvas vide"
        {...listeners}
        {...attributes}
      >
        <Layers className="size-4 shrink-0" />
        Section
      </div>
    </li>
  );
}

function PaletteItemRow({ type, label, icon: Icon }: LibItem) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: creoPaletteDragId(type),
    data: { source: "palette" as const, elementType: type },
  });

  return (
    <li>
      <div
        ref={setNodeRef}
        className={cn(
          "flex w-full cursor-grab touch-none items-center gap-2 rounded-[10px] border border-transparent px-3 py-2 text-left text-[13px] tracking-[-0.01em] text-zinc-800 transition-colors hover:bg-zinc-200/45 active:cursor-grabbing dark:text-zinc-200 dark:hover:bg-zinc-800/55",
          isDragging && "opacity-40"
        )}
        title="Glisser vers une colonne du canvas"
        {...listeners}
        {...attributes}
      >
        <Icon className="size-4 shrink-0 text-zinc-600 dark:text-zinc-400" />
        {label}
      </div>
    </li>
  );
}

export function EditorLeftPanel({ checkout }: { checkout?: EditorCheckoutBinding | null }) {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<SidebarTab>("structure");
  const [sidebarWidthPx, setSidebarWidthPx] = useState(SIDEBAR_MIN_PX);
  const [sidebarResizing, setSidebarResizing] = useState(false);
  const selectedId = useEditorSelector((s) => s.selectedId);
  const selectedType = useEditorSelector((s) => s.selectedType);
  const prevSelectedId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_WIDTH_KEY);
      if (raw == null) return;
      const n = Number.parseInt(raw, 10);
      if (!Number.isNaN(n)) setSidebarWidthPx(clampSidebarWidth(n));
    } catch {
      /* ignore */
    }
  }, []);

  const onResizePointerDown = useCallback(
    (e: ReactMouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setSidebarResizing(true);
      const startX = e.clientX;
      const startW = sidebarWidthPx;
      const prevUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";

      const onMove = (ev: globalThis.MouseEvent) => {
        const delta = ev.clientX - startX;
        setSidebarWidthPx(clampSidebarWidth(startW + delta));
      };
      const onUp = () => {
        setSidebarResizing(false);
        document.body.style.userSelect = prevUserSelect;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        setSidebarWidthPx((w) => {
          const next = clampSidebarWidth(w);
          try {
            localStorage.setItem(SIDEBAR_WIDTH_KEY, String(next));
          } catch {
            /* ignore */
          }
          return next;
        });
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [sidebarWidthPx]
  );

  useEffect(() => {
    if (prevSelectedId.current === undefined) {
      prevSelectedId.current = selectedId;
      return;
    }
    const prev = prevSelectedId.current;
    prevSelectedId.current = selectedId;

    if (prev != null && !selectedId) {
      setTab("structure");
      return;
    }
    if (selectedId && selectedId !== prev) {
      setTab("properties");
    }
  }, [selectedId]);

  return (
    <aside
      className="relative hidden h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-zinc-200/70 bg-[#f5f5f7] dark:border-creo-blue/15 dark:bg-zinc-950 lg:flex"
      style={{ width: `min(100%, ${sidebarWidthPx}px)` }}
    >
      {/* Encoche discrète au milieu du bord — visible au survol de la zone ou pendant le drag */}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-valuemin={SIDEBAR_MIN_PX}
        aria-valuemax={SIDEBAR_MAX_PX}
        aria-valuenow={sidebarWidthPx}
        title="Redimensionner le panneau"
        className="group/resizer absolute right-0 top-0 z-20 flex h-full w-3 translate-x-1/2 cursor-col-resize items-center justify-center touch-none"
        onMouseDown={onResizePointerDown}
      >
        <span
          className={cn(
            "pointer-events-none h-14 w-[3px] shrink-0 rounded-full transition-[background-color,box-shadow] duration-150",
            sidebarResizing
              ? "bg-zinc-500/55 shadow-[0_0_0_1px_rgba(0,0,0,0.06)] dark:bg-zinc-400/45"
              : "bg-transparent group-hover/resizer:bg-zinc-400/45 group-hover/resizer:shadow-sm dark:group-hover/resizer:bg-zinc-500/45"
          )}
          aria-hidden
        />
      </div>
      <div className="shrink-0 space-y-2.5 border-b border-zinc-200/50 px-4 py-3.5 dark:border-zinc-800/80">
        <div
          className="relative flex h-8 gap-0.5 rounded-lg border border-zinc-200/25 bg-zinc-200/15 p-[3px] dark:border-zinc-700/30 dark:bg-zinc-800/20"
          role="tablist"
          aria-label="Panneau latéral"
        >
          <motion.span
            aria-hidden
            className="pointer-events-none absolute top-[3px] bottom-[3px] rounded-[5px] bg-white/88 ring-1 ring-zinc-200/35 dark:bg-zinc-800/75 dark:ring-zinc-600/25"
            initial={false}
            animate={{
              left: tab === "structure" ? 3 : "calc(50% + 1px)",
            }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            style={{ width: "calc(50% - 4px)" }}
          />
          <button
            type="button"
            role="tab"
            aria-selected={tab === "structure"}
            onClick={() => setTab("structure")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1 rounded-[5px] py-1 text-[11.5px] font-semibold tracking-[-0.01em] transition-colors duration-200",
              tab === "structure"
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            )}
          >
            <LayoutGrid className="size-3 shrink-0 opacity-[0.72]" aria-hidden />
            Structure
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "properties"}
            onClick={() => setTab("properties")}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center gap-1 rounded-[5px] py-1 text-[11.5px] font-semibold tracking-[-0.01em] transition-colors duration-200",
              tab === "properties"
                ? "text-zinc-900 dark:text-zinc-100"
                : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-500 dark:hover:text-zinc-300"
            )}
          >
            <SlidersHorizontal className="size-3 shrink-0 opacity-[0.72]" aria-hidden />
            Paramètres
          </button>
        </div>
        {tab === "structure" ? (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-zinc-400" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher…"
              className="h-9 rounded-[10px] border-zinc-200/80 bg-white pl-9 text-[13px] shadow-none dark:border-zinc-700 dark:bg-zinc-900"
            />
          </div>
        ) : (
          <p className="px-0.5 text-[12px] leading-snug tracking-[-0.01em] text-zinc-500 dark:text-zinc-400">
            {propertiesSubtitle(selectedId, selectedType)}
          </p>
        )}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        {tab === "structure" ? (
          <motion.div
            key="structure-panel"
            role="tabpanel"
            initial={{ opacity: 0.88 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.88 }}
            transition={{ duration: 0.14, ease: [0.33, 1, 0.68, 1] }}
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4"
          >
            <div className="mb-4">
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                Glisser-déposer
              </p>
              <ul className="space-y-0.5">
                <SectionPaletteRow />
              </ul>
            </div>
            {CATEGORIES.map((cat) => {
              const items = cat.items.filter(
                (it) =>
                  !q.trim() ||
                  it.label.toLowerCase().includes(q.toLowerCase()) ||
                  cat.title.toLowerCase().includes(q.toLowerCase())
              );
              if (!items.length) return null;
              return (
                <div key={cat.title} className="mb-4">
                  <p className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-500">
                    {cat.title}
                  </p>
                  <ul className="space-y-0.5">
                    {items.map((it) => (
                      <PaletteItemRow key={it.type} type={it.type} label={it.label} icon={it.icon} />
                    ))}
                  </ul>
                </div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key="properties-panel"
            role="tabpanel"
            initial={{ opacity: 0.88 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.88 }}
            transition={{ duration: 0.14, ease: [0.33, 1, 0.68, 1] }}
            className="flex min-h-0 flex-1 flex-col overflow-hidden"
          >
            <EditorPropertiesPanelContent checkout={checkout} />
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
}
