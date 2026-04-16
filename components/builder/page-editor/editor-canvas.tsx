"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  Grid3x3,
  GripVertical,
  LayoutTemplate,
  Monitor,
  Plus,
  Smartphone,
  Tablet,
  Trash2,
} from "lucide-react";
import { motion } from "framer-motion";

import { EditorElementPreview } from "@/components/builder/page-editor/editor-element-preview";
import { useEditorSelector, usePageEditorStore } from "@/components/builder/page-editor/page-editor-context";
import {
  CREO_CANVAS_EMPTY_ID,
  CREO_CANVAS_INSERT_SECTION_ID,
  creoColumnDropId,
} from "@/lib/pages/editor/dnd-ids";
import { columnStyleToPreviewCss } from "@/lib/pages/editor/column-style-to-css";
import { pageFontStack } from "@/lib/public-pages/page-theme";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Column, EditorElement, Section } from "@/lib/pages/editor/page-document.types";

const BUILDER_ZOOM_OPTIONS = [50, 75, 100, 125] as const;
type BuilderZoomPercent = (typeof BUILDER_ZOOM_OPTIONS)[number];

function parseStoredZoom(v: string | null): BuilderZoomPercent {
  const n = Number(v);
  return (BUILDER_ZOOM_OPTIONS as readonly number[]).includes(n) ? (n as BuilderZoomPercent) : 100;
}

export function EditorCanvas({ previewMaxWidth }: { previewMaxWidth: string }) {
  const store = usePageEditorStore();
  const sections = useEditorSelector((s) => s.document.sections);
  const mode = useEditorSelector((s) => s.mode);
  const selectedId = useEditorSelector((s) => s.selectedId);
  const meta = useEditorSelector((s) => s.document.meta);
  const gs = useEditorSelector((s) => s.document.globalStyles);

  const [showGrid, setShowGrid] = useState(false);
  const [zoomPercent, setZoomPercent] = useState<BuilderZoomPercent>(100);

  useEffect(() => {
    try {
      if (typeof window !== "undefined" && window.sessionStorage.getItem("creo-builder-show-grid") === "1") {
        setShowGrid(true);
      }
      const z = window.sessionStorage.getItem("creo-builder-zoom");
      setZoomPercent(parseStoredZoom(z));
    } catch {
      /* ignore */
    }
  }, []);

  const setZoom = useCallback((z: BuilderZoomPercent) => {
    setZoomPercent(z);
    try {
      window.sessionStorage.setItem("creo-builder-zoom", String(z));
    } catch {
      /* ignore */
    }
  }, []);

  const zoomPercentRef = useRef(zoomPercent);
  zoomPercentRef.current = zoomPercent;

  const canvasWheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = canvasWheelRef.current;
    if (!root) return;

    const onWheel = (e: WheelEvent) => {
      if (!e.altKey) return;
      e.preventDefault();
      e.stopPropagation();
      const cur = zoomPercentRef.current;
      const idx = BUILDER_ZOOM_OPTIONS.indexOf(cur);
      const i = Math.max(0, idx);
      if (e.deltaY < 0) {
        const next = BUILDER_ZOOM_OPTIONS[Math.min(BUILDER_ZOOM_OPTIONS.length - 1, i + 1)];
        if (next !== cur) setZoom(next);
      } else if (e.deltaY > 0) {
        const next = BUILDER_ZOOM_OPTIONS[Math.max(0, i - 1)];
        if (next !== cur) setZoom(next);
      }
    };

    root.addEventListener("wheel", onWheel, { passive: false });
    return () => root.removeEventListener("wheel", onWheel);
  }, [setZoom]);

  const toggleGrid = () => {
    setShowGrid((prev) => {
      const next = !prev;
      try {
        window.sessionStorage.setItem("creo-builder-show-grid", next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const frame =
    mode === "desktop" ? "w-full" : mode === "tablet" ? "max-w-[768px]" : "max-w-[390px]";

  const isDesktop = mode === "desktop";

  const modeLabel = mode === "desktop" ? "Bureau" : mode === "tablet" ? "Tablette" : "Mobile";

  const pageBg = meta.backgroundColor?.trim() || "#ffffff";
  const contentMax = Math.min(1920, Math.max(320, meta.maxWidth || 1200));

  const pageContentStyle: CSSProperties = {
    ...(isDesktop ? { maxWidth: `${contentMax}px` } : {}),
    marginLeft: "auto",
    marginRight: "auto",
    width: "100%",
    fontFamily: pageFontStack(gs.fontBody),
    fontSize: `${Math.min(24, Math.max(12, gs.baseFontSize || 16))}px`,
    color: gs.primaryColor,
    ["--creo-page-primary" as string]: gs.primaryColor,
    ["--creo-page-secondary" as string]: gs.secondaryColor,
    ["--creo-page-accent" as string]: gs.accentColor,
  };

  const previewZoomStyle: CSSProperties & { zoom?: number } = {
    zoom: zoomPercent / 100,
  };

  return (
    <div
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-auto bg-[var(--creo-dashboard-canvas,#fcfcfc)] dark:bg-[var(--creo-dashboard-canvas)]",
        isDesktop ? "p-0" : "p-3"
      )}
    >
      <div
        ref={canvasWheelRef}
        className={cn(
          "flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-creo-lg",
          "border border-zinc-200/90 bg-white dark:border-creo-blue/15 dark:bg-zinc-950",
          "shadow-[var(--creo-shadow-card-rest)]",
          previewMaxWidth,
          frame,
          isDesktop ? "mx-0 max-w-none" : "mx-auto"
        )}
      >
        <CanvasChromeBar
          mode={mode}
          modeLabel={modeLabel}
          showGrid={showGrid}
          onToggleGrid={toggleGrid}
          contentMaxPx={isDesktop ? contentMax : null}
          zoomPercent={zoomPercent}
          onZoomChange={setZoom}
        />

        <div
          className={cn(
            "creo-builder-preview-body relative z-0 min-h-0 w-full flex-1 overflow-auto",
            isDesktop ? "px-0" : "px-1 pb-1"
          )}
          style={{ backgroundColor: pageBg }}
        >
          <div
            className={cn(
              "relative z-[1] mx-auto min-h-full w-full max-w-full space-y-0",
              isDesktop ? "px-4 py-5 sm:px-6 sm:py-6" : "px-3 py-4"
            )}
            style={previewZoomStyle}
          >
            {showGrid ? (
              <div
                className={cn(
                  "pointer-events-none absolute inset-0 z-0 bg-[length:24px_24px] dark:bg-[length:24px_24px]",
                  "bg-[linear-gradient(to_right,rgb(0_0_0/0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_0_0/0.04)_1px,transparent_1px)]",
                  "dark:bg-[linear-gradient(to_right,rgb(255_255_255/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(255_255_255/0.06)_1px,transparent_1px)]"
                )}
                aria-hidden
              />
            ) : null}
            <div className="relative z-[1] space-y-0" style={pageContentStyle}>
              {sections.length === 0 ? (
                <CanvasEmptyDrop />
              ) : (
                sections.map((sec, idx) => (
                  <SectionFrame
                    key={sec.id}
                    section={sec}
                    index={idx}
                    isSelected={selectedId === sec.id}
                    onSelectSection={() => store.getState().select(sec.id, "section")}
                  />
                ))
              )}
              <CanvasInsertSectionDrop sectionsLength={sections.length} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CanvasZoomMenu({
  value,
  onChange,
}: {
  value: BuilderZoomPercent;
  onChange: (z: BuilderZoomPercent) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: globalThis.MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        type="button"
        className="inline-flex items-center gap-1 rounded-full border border-zinc-200/90 bg-white px-2 py-1 text-[10px] font-semibold tabular-nums text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 dark:hover:border-zinc-600 dark:hover:bg-zinc-900 sm:px-2.5 sm:text-[11px]"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Échelle d’affichage"
        title="Zoom de l’aperçu (Alt + molette sur le canvas)"
        onClick={() => setOpen((o) => !o)}
      >
        {value}%
        <ChevronDown
          className={cn("size-3 text-zinc-400 transition-transform dark:text-zinc-500", open && "rotate-180")}
          aria-hidden
        />
      </button>
      {open ? (
        <ul
          className="absolute right-0 top-[calc(100%+6px)] z-[200] min-w-[5.5rem] rounded-creo-md border border-zinc-200/95 bg-white py-1 shadow-[var(--creo-shadow-modal)] dark:border-zinc-700 dark:bg-zinc-900"
          role="listbox"
          aria-label="Niveaux de zoom"
        >
          {BUILDER_ZOOM_OPTIONS.map((pct) => (
            <li key={pct} role="option" aria-selected={pct === value}>
              <button
                type="button"
                className={cn(
                  "flex w-full items-center justify-between px-3 py-1.5 text-left text-[11px] font-medium tabular-nums transition-colors",
                  pct === value
                    ? "bg-creo-purple-pale text-creo-blue dark:bg-creo-blue/15 dark:text-creo-blue-soft"
                    : "text-zinc-700 hover:bg-zinc-50 dark:text-zinc-300 dark:hover:bg-zinc-800/80"
                )}
                onClick={() => {
                  onChange(pct);
                  setOpen(false);
                }}
              >
                {pct}%
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function CanvasChromeBar({
  mode,
  modeLabel,
  showGrid,
  onToggleGrid,
  contentMaxPx,
  zoomPercent,
  onZoomChange,
}: {
  mode: "desktop" | "tablet" | "mobile";
  modeLabel: string;
  showGrid: boolean;
  onToggleGrid: () => void;
  contentMaxPx: number | null;
  zoomPercent: BuilderZoomPercent;
  onZoomChange: (z: BuilderZoomPercent) => void;
}) {
  const DeviceIcon = mode === "desktop" ? Monitor : mode === "tablet" ? Tablet : Smartphone;
  return (
    <div className="relative z-40 flex shrink-0 items-center justify-between gap-2 border-b border-zinc-200/90 bg-zinc-50/95 px-2 py-2 backdrop-blur-sm sm:gap-3 sm:px-3 sm:py-2.5 dark:border-creo-blue/15 dark:bg-zinc-900/95">
      <div className="flex min-w-0 items-center gap-2 sm:gap-2.5">
        <span className="h-5 w-[3px] shrink-0 rounded-full bg-creo-blue" aria-hidden />
        <div className="min-w-0">
          <p className="text-[12px] font-semibold leading-tight tracking-tight text-zinc-900 dark:text-zinc-100">
            Aperçu
          </p>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
            CRÉO
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5 sm:gap-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8 shrink-0 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
            showGrid && "bg-zinc-200/80 text-creo-blue dark:bg-zinc-800 dark:text-creo-blue-soft"
          )}
          aria-pressed={showGrid}
          aria-label={showGrid ? "Masquer la grille d’alignement" : "Afficher la grille d’alignement"}
          title="Grille d’alignement"
          onClick={onToggleGrid}
        >
          <Grid3x3 className="size-3.5" strokeWidth={2} />
        </Button>
        <span className="hidden h-4 w-px bg-zinc-200 sm:block dark:bg-zinc-700" aria-hidden />
        <CanvasZoomMenu value={zoomPercent} onChange={onZoomChange} />
        {contentMaxPx != null ? (
          <span
            className="hidden rounded-full border border-zinc-200/90 bg-white px-2 py-1 text-[10px] font-medium tabular-nums text-zinc-500 shadow-[0_1px_2px_rgba(0,0,0,0.04)] md:inline dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-400 sm:px-2.5 sm:text-[11px]"
            title="Largeur max du contenu (page)"
          >
            max {contentMaxPx}px
          </span>
        ) : null}
        <span className="hidden h-4 w-px bg-zinc-200 lg:block dark:bg-zinc-700" aria-hidden />
        <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200/90 bg-white px-2 py-1 text-[10px] font-medium tabular-nums text-zinc-600 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300 sm:px-2.5 sm:text-[11px]">
          <DeviceIcon className="size-3.5 text-zinc-400 dark:text-zinc-500" strokeWidth={2} aria-hidden />
          {modeLabel}
        </span>
      </div>
    </div>
  );
}

function CanvasEmptyDrop() {
  const { setNodeRef, isOver } = useDroppable({
    id: CREO_CANVAS_EMPTY_ID,
    data: { kind: "canvas-empty" as const },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[min(42vh,360px)] flex-col items-center justify-center rounded-creo-lg border border-dashed px-6 py-12 text-center transition-[border-color,background-color,box-shadow] duration-200",
        isOver
          ? "border-creo-blue/35 bg-creo-purple-pale/50 shadow-[0_0_0_3px_rgba(0,51,255,0.06)] dark:border-creo-blue-soft/35 dark:bg-creo-blue/10 dark:shadow-[0_0_0_3px_rgba(102,136,255,0.08)]"
          : "border-zinc-200/90 bg-zinc-50/40 dark:border-zinc-700/70 dark:bg-zinc-950/40"
      )}
    >
      <div className="mb-4 flex size-11 items-center justify-center rounded-creo-md bg-white shadow-[var(--creo-shadow-card-rest)] ring-1 ring-zinc-200/80 dark:bg-zinc-900 dark:ring-zinc-700/80">
        <LayoutTemplate className="size-5 text-zinc-400 dark:text-zinc-500" strokeWidth={1.75} aria-hidden />
      </div>
      <p className="max-w-[260px] text-creo-sm font-medium leading-snug text-zinc-800 dark:text-zinc-200">
        Dépose une section ou un bloc depuis le panneau de gauche
      </p>
      <p className="mt-2 max-w-[280px] text-creo-xs leading-relaxed text-zinc-500 dark:text-zinc-400">
        La grille section → colonnes se met à jour automatiquement.
      </p>
    </div>
  );
}

function CanvasInsertSectionDrop({ sectionsLength }: { sectionsLength: number }) {
  const { setNodeRef, isOver } = useDroppable({
    id: CREO_CANVAS_INSERT_SECTION_ID,
    data: { kind: "insert-section" as const },
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "mt-1 border-t border-zinc-200/80 px-3 py-4 text-center text-[11px] font-medium transition-colors dark:border-zinc-800",
        isOver
          ? "text-creo-blue dark:text-creo-blue-soft"
          : "text-zinc-400 dark:text-zinc-500"
      )}
    >
      {isOver
        ? "Relâche pour insérer une section"
        : sectionsLength === 0
          ? "Zone d’insertion — glisse une section ici"
          : `${sectionsLength} section${sectionsLength > 1 ? "s" : ""} · insérer sous la page`}
    </div>
  );
}

function ColumnDropArea({
  column,
  flexBasisPct,
  isColumnSelected,
  isColumnHovered,
  mode,
  children,
  onSelectColumn,
}: {
  column: Column;
  flexBasisPct: number;
  isColumnSelected: boolean;
  isColumnHovered: boolean;
  mode: "desktop" | "tablet" | "mobile";
  children: ReactNode;
  onSelectColumn: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: creoColumnDropId(column.id),
    data: { kind: "column", columnId: column.id },
  });

  const colStyle = columnStyleToPreviewCss(column.style);
  const hasCustomBg =
    (column.style.backgroundColor && column.style.backgroundColor !== "transparent") ||
    Boolean(column.style.backgroundImage?.trim());
  const hiddenHere = column.hiddenOn?.includes(mode) ?? false;

  const colFrame = isColumnSelected || isColumnHovered;

  return (
    <div
      ref={setNodeRef}
      role="presentation"
      data-creo-editor-col
      data-editor-id={column.id}
      className={cn(
        "flex min-h-[96px] flex-1 flex-col rounded-[2px] border border-transparent transition-[box-shadow,background-color] duration-150",
        !hasCustomBg && "bg-transparent",
        !hiddenHere && isOver && "bg-creo-blue/[0.08] ring-2 ring-creo-blue/75 dark:bg-creo-blue/12",
        !hiddenHere && !isOver && colFrame && "ring-2 ring-creo-blue ring-offset-0",
        hiddenHere && "opacity-45 ring-2 ring-amber-400/50 ring-offset-0"
      )}
      style={{
        ...colStyle,
        flexBasis: `${flexBasisPct}%`,
        minWidth: "120px",
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelectColumn();
      }}
    >
      {hiddenHere ? (
        <p className="pointer-events-none mb-1 text-center text-[10px] font-medium text-amber-800/90 dark:text-amber-200/80">
          Masquée en {mode === "mobile" ? "mobile" : mode === "tablet" ? "tablette" : "bureau"}
        </p>
      ) : null}
      {children}
    </div>
  );
}

function resolveCanvasHoverTarget(target: EventTarget | null): string | null {
  const t = target as HTMLElement | null;
  if (!t || typeof t.closest !== "function") return null;
  const elNode = t.closest("[data-creo-editor-el]");
  if (elNode) return elNode.getAttribute("data-editor-id");
  const colNode = t.closest("[data-creo-editor-col]");
  if (colNode) return colNode.getAttribute("data-editor-id");
  return null;
}

function SectionFrame({
  section,
  index,
  isSelected,
  onSelectSection,
}: {
  section: Section;
  index: number;
  isSelected: boolean;
  onSelectSection: () => void;
}) {
  const store = usePageEditorStore();
  const selectedId = useEditorSelector((s) => s.selectedId);
  const hoveredId = useEditorSelector((s) => s.hoveredId);
  const mode = useEditorSelector((s) => s.mode);
  const st = section.style;

  const sectionHovered = hoveredId === section.id;
  const showSectionFrame = isSelected || sectionHovered;

  const onCanvasHoverMove = (e: MouseEvent<HTMLDivElement>) => {
    const id = resolveCanvasHoverTarget(e.target);
    if (id) {
      store.getState().setHovered(id);
      return;
    }
    store.getState().setHovered(section.id);
  };

  const onCanvasHoverLeave = (e: MouseEvent<HTMLDivElement>) => {
    const rt = e.relatedTarget as Node | null;
    if (!rt || !e.currentTarget.contains(rt)) {
      store.getState().setHovered(null);
    }
  };

  return (
    <motion.section
      layout
      className={cn(
        "relative overflow-visible rounded-creo-lg transition-[box-shadow] duration-200",
        showSectionFrame ? "shadow-[0_0_0_2px_rgba(0,51,255,0.85)] dark:shadow-[0_0_0_2px_rgba(102,136,255,0.95)]" : ""
      )}
      style={{
        backgroundColor: st.backgroundColor || undefined,
        paddingTop: st.paddingTop,
        paddingBottom: st.paddingBottom,
        paddingLeft: st.paddingLeft,
        paddingRight: st.paddingRight,
      }}
      data-section-id={section.id}
    >
      <div className="flex flex-col" onMouseMove={onCanvasHoverMove} onMouseLeave={onCanvasHoverLeave}>
      {/* Barre d’outils : sélection de section UNIQUEMENT ici (pas de <button> parent autour du contenu — évite les boutons imbriqués) */}
      <div
        className={cn(
          "flex h-8 items-center gap-0.5 border-b border-zinc-200/80 px-1.5 dark:border-creo-blue/15",
          "bg-white/85 backdrop-blur-sm dark:bg-zinc-950/90",
          isSelected || sectionHovered ? "opacity-100" : "opacity-0 hover:opacity-100 focus-within:opacity-100"
        )}
      >
        <button
          type="button"
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-creo-sm text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
            isSelected && "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
          )}
          title="Sélectionner cette section — ordre avec ↑ ↓"
          aria-label="Sélectionner la section"
          onClick={(e) => {
            e.stopPropagation();
            onSelectSection();
          }}
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 truncate text-left text-[11px] font-semibold tracking-tight text-zinc-700 dark:text-zinc-200"
          title="Sélectionner cette section"
          onClick={(e) => {
            e.stopPropagation();
            onSelectSection();
          }}
        >
          {section.label}
        </button>
        <div className="ml-auto flex shrink-0 items-center gap-px">
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            onClick={(e) => {
              e.stopPropagation();
              store.getState().moveSection(section.id, "up");
            }}
            disabled={index === 0}
            aria-label="Monter la section"
            title="Monter"
          >
            <ArrowUp className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
            onClick={(e) => {
              e.stopPropagation();
              store.getState().moveSection(section.id, "down");
            }}
            aria-label="Descendre la section"
            title="Descendre"
          >
            <ArrowDown className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-zinc-500 hover:text-creo-blue dark:text-zinc-400 dark:hover:text-creo-blue-soft"
            onClick={(e) => {
              e.stopPropagation();
              store.getState().addRow(section.id, 2);
            }}
            title="Ajouter une ligne 2 colonnes"
          >
            <Plus className="size-3.5" />
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
            onClick={(e) => {
              e.stopPropagation();
              store.getState().deleteSection(section.id);
            }}
            aria-label="Supprimer la section"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Contenu : pas de <button> englobant — clics isolés sur colonne / bloc */}
      <div className="px-2.5 py-3 md:px-3 md:py-3.5">
        {section.rows.map((row) => (
          <div
            key={row.id}
            className="mb-1.5 flex flex-wrap gap-2 last:mb-0"
            style={{
              gap: row.columnGap,
            }}
          >
            {row.columns.map((col) => (
              <ColumnDropArea
                key={col.id}
                column={col}
                flexBasisPct={row.columnWidths.desktop[row.columns.indexOf(col)] ?? 100}
                isColumnSelected={selectedId === col.id}
                isColumnHovered={hoveredId === col.id}
                mode={mode}
                onSelectColumn={() => {
                  store.getState().select(col.id, "column");
                }}
              >
                {col.elements.length === 0 ? (
                  <p className="py-8 text-center text-[11px] font-medium leading-relaxed text-zinc-400 dark:text-zinc-500">
                    Glisser un bloc ici
                  </p>
                ) : (
                  col.elements.map((el) => (
                    <ElementBlock
                      key={el.id}
                      element={el}
                      selected={selectedId === el.id}
                      onSelect={() => store.getState().select(el.id, "element")}
                    />
                  ))
                )}
              </ColumnDropArea>
            ))}
          </div>
        ))}
      </div>
      </div>
    </motion.section>
  );
}

function ElementBlock({
  element,
  selected,
  onSelect,
}: {
  element: EditorElement;
  selected: boolean;
  onSelect: () => void;
}) {
  const store = usePageEditorStore();
  const hovered = useEditorSelector((s) => s.hoveredId === element.id);
  const elFrame = selected || hovered;

  return (
    <div
      data-creo-editor-el
      data-editor-id={element.id}
      className={cn(
        "group relative mb-2 overflow-visible last:mb-0",
        "rounded-[2px]",
        elFrame ? "ring-2 ring-creo-blue ring-offset-0" : "ring-0"
      )}
    >
      <div
        role="button"
        tabIndex={0}
        className="w-full min-w-0 cursor-pointer rounded-[inherit] px-0 py-0 text-left outline-none focus-visible:ring-2 focus-visible:ring-creo-blue/45 focus-visible:ring-offset-1 dark:focus-visible:ring-creo-blue-soft/50"
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            e.stopPropagation();
            onSelect();
          }
        }}
      >
        <div className="max-w-full overflow-x-auto">
          <EditorElementPreview element={element} />
        </div>
      </div>
      <div
        className={cn(
          "absolute bottom-full left-0 z-20 mb-1 flex h-7 items-center gap-px rounded-md border border-zinc-200/90 bg-white/95 px-0.5 shadow-md backdrop-blur-sm dark:border-creo-blue/20 dark:bg-zinc-900/95",
          "pointer-events-none opacity-0 transition-opacity duration-150",
          "group-hover:pointer-events-auto group-hover:opacity-100",
          selected && "pointer-events-auto opacity-100"
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-[11px] text-zinc-500 hover:text-creo-blue dark:text-zinc-400 dark:hover:text-creo-blue-soft"
          disabled={element.locked}
          onClick={(e) => {
            e.stopPropagation();
            store.getState().duplicateElement(element.id);
          }}
        >
          <Copy className="size-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 px-1.5 text-[11px] text-zinc-500 hover:text-red-600 dark:hover:text-red-400"
          disabled={element.locked}
          onClick={(e) => {
            e.stopPropagation();
            store.getState().deleteElement(element.id);
          }}
        >
          <Trash2 className="size-3" />
        </Button>
      </div>
    </div>
  );
}
