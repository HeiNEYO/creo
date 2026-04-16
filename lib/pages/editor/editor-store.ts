import { current } from "immer";
import { nanoid } from "nanoid";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

import { createEmptyRow, createEmptySection } from "@/lib/pages/editor/defaults";
import { createElementFromType } from "@/lib/pages/editor/element-factory";
import type {
  Column,
  ColumnStyle,
  EditorElement,
  ElementStyle,
  ElementType,
  GlobalStyles,
  PageDocument,
  PageMeta,
  Section,
  SectionStyle,
} from "@/lib/pages/editor/page-document.types";
import { findColumn, findElement } from "@/lib/pages/editor/tree-utils";

const MAX_HISTORY = 20;

export type EditorSelectionType = "section" | "row" | "column" | "element" | null;

export type RightPanelTab = "style" | "content" | "advanced" | "page";
export type ViewportMode = "desktop" | "tablet" | "mobile";

export type EditorState = {
  document: PageDocument;
  selectedId: string | null;
  selectedType: EditorSelectionType;
  hoveredId: string | null;
  mode: ViewportMode;
  zoom: number;
  rightPanel: RightPanelTab;
  history: PageDocument[];
  historyIndex: number;
  isDragging: boolean;
  dragSource: "sidebar" | "canvas" | null;
  /** Pour ignorer le clic palette juste après un drop DnD réussi. */
  lastPaletteDnDAt: number;
  dirty: boolean;
};

function snapshot(doc: PageDocument): PageDocument {
  return JSON.parse(JSON.stringify(doc)) as PageDocument;
}

function recordHistory(s: EditorState) {
  const doc = JSON.parse(JSON.stringify(current(s.document))) as PageDocument;
  const hist = current(s.history).slice(0, s.historyIndex + 1);
  hist.push(doc);
  const trimmed = hist.length > MAX_HISTORY ? hist.slice(-MAX_HISTORY) : hist;
  s.history = trimmed;
  s.historyIndex = trimmed.length - 1;
}

export type EditorActions = {
  hydrate: (doc: PageDocument) => void;
  setDocumentName: (name: string) => void;
  select: (id: string | null, type: EditorSelectionType) => void;
  setHovered: (id: string | null) => void;
  setMode: (mode: ViewportMode) => void;
  setZoom: (zoom: number) => void;
  setRightPanel: (tab: RightPanelTab) => void;
  setDragging: (v: boolean, source?: "sidebar" | "canvas" | null) => void;
  /** Appeler après un drop palette → canvas pour éviter un second ajout au clic. */
  markPaletteDnD: () => void;
  markSaved: () => void;

  updatePageMeta: (meta: Partial<PageMeta>) => void;
  updateGlobalStyles: (styles: Partial<GlobalStyles>) => void;

  addSection: (index: number, label?: string) => void;
  updateSection: (id: string, updates: SectionPatch) => void;
  deleteSection: (id: string) => void;
  moveSection: (id: string, direction: "up" | "down") => void;

  addRow: (sectionId: string, columnCount: number) => void;
  setColumnWidths: (rowId: string, desktop: number[]) => void;
  updateColumn: (columnId: string, updates: ColumnPatch) => void;

  addElement: (element: EditorElement, columnId: string, index: number) => void;
  /** Insère un élément depuis la palette ; `columnId` null = nouvelle section en bas du document (une colonne). */
  insertElementFromPalette: (type: ElementType, columnId: string | null) => void;
  updateElement: (id: string, updates: ElementPatch) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveElementInColumn: (elementId: string, columnId: string, newIndex: number) => void;

  undo: () => void;
  redo: () => void;
};

export type EditorStore = EditorState & EditorActions;

/** Fusion partielle du style de section (évite d’écraser tout `style`). */
export type SectionPatch = Omit<Partial<Section>, "style"> & { style?: Partial<SectionStyle> };

/** Mise à jour d’une colonne (style fusionné, `padding` remplacé si fourni en entier [t,r,b,l]). */
export type ColumnPatch = Omit<Partial<Column>, "style" | "elements"> & {
  style?: Partial<ColumnStyle> & { padding?: [number, number, number, number] };
};

export type ElementPatch = Omit<Partial<EditorElement>, "style" | "content"> & {
  style?: Partial<ElementStyle>;
  content?: Record<string, unknown>;
};

export function createEditorStore(initialDocument: PageDocument) {
  const initial: EditorState = {
    document: initialDocument,
    selectedId: null,
    selectedType: null,
    hoveredId: null,
    mode: "desktop",
    zoom: 100,
    rightPanel: "page",
    history: [snapshot(initialDocument)],
    historyIndex: 0,
    isDragging: false,
    dragSource: null,
    lastPaletteDnDAt: 0,
    dirty: false,
  };

  return create<EditorStore>()(
    immer((set) => ({
      ...initial,

      hydrate: (doc) =>
        set((s) => {
          s.document = doc;
          s.history = [snapshot(doc)];
          s.historyIndex = 0;
          s.selectedId = null;
          s.selectedType = null;
          s.lastPaletteDnDAt = 0;
          s.dirty = false;
        }),

      setDocumentName: (name) =>
        set((s) => {
          s.document.name = name;
          s.dirty = true;
          recordHistory(s);
        }),

      select: (id, type) =>
        set((s) => {
          s.selectedId = id;
          s.selectedType = type;
        }),

      setHovered: (id) =>
        set((s) => {
          s.hoveredId = id;
        }),

      setMode: (mode) =>
        set((s) => {
          s.mode = mode;
        }),

      setZoom: (zoom) =>
        set((s) => {
          s.zoom = Math.min(200, Math.max(50, zoom));
        }),

      setRightPanel: (tab) =>
        set((s) => {
          s.rightPanel = tab;
        }),

      setDragging: (v, source = null) =>
        set((s) => {
          s.isDragging = v;
          s.dragSource = source;
        }),

      markPaletteDnD: () =>
        set((s) => {
          s.lastPaletteDnDAt = Date.now();
        }),

      markSaved: () =>
        set((s) => {
          s.dirty = false;
        }),

      updatePageMeta: (meta) =>
        set((s) => {
          Object.assign(s.document.meta, meta);
          s.dirty = true;
          recordHistory(s);
        }),

      updateGlobalStyles: (styles) =>
        set((s) => {
          Object.assign(s.document.globalStyles, styles);
          s.dirty = true;
          recordHistory(s);
        }),

      addSection: (index, label) =>
        set((s) => {
          const sec = createEmptySection(() => nanoid(), label ?? "Section");
          s.document.sections.splice(index, 0, sec);
          s.dirty = true;
          recordHistory(s);
        }),

      updateSection: (id, updates) =>
        set((s) => {
          const sec = s.document.sections.find((x) => x.id === id);
          if (!sec) return;
          const { style, ...rest } = updates;
          if (style) Object.assign(sec.style, style);
          Object.assign(sec, rest);
          s.dirty = true;
          recordHistory(s);
        }),

      deleteSection: (id) =>
        set((s) => {
          s.document.sections = s.document.sections.filter((x) => x.id !== id);
          if (s.selectedId === id) {
            s.selectedId = null;
            s.selectedType = null;
          }
          s.dirty = true;
          recordHistory(s);
        }),

      moveSection: (id, direction) =>
        set((s) => {
          const i = s.document.sections.findIndex((x) => x.id === id);
          if (i < 0) return;
          const j = direction === "up" ? i - 1 : i + 1;
          if (j < 0 || j >= s.document.sections.length) return;
          const arr = s.document.sections;
          [arr[i], arr[j]] = [arr[j]!, arr[i]!];
          s.dirty = true;
          recordHistory(s);
        }),

      addRow: (sectionId, columnCount) =>
        set((s) => {
          const sec = s.document.sections.find((x) => x.id === sectionId);
          if (!sec) return;
          sec.rows.push(createEmptyRow(columnCount, () => nanoid()));
          s.dirty = true;
          recordHistory(s);
        }),

      setColumnWidths: (rowId, desktop) =>
        set((s) => {
          for (const sec of s.document.sections) {
            const row = sec.rows.find((r) => r.id === rowId);
            if (row) {
              row.columnWidths.desktop = desktop;
              row.columnWidths.tablet = desktop;
              break;
            }
          }
          s.dirty = true;
          recordHistory(s);
        }),

      updateColumn: (columnId, updates) =>
        set((s) => {
          for (const sec of s.document.sections) {
            for (const row of sec.rows) {
              const col = row.columns.find((c) => c.id === columnId);
              if (!col) continue;
              const { style, ...rest } = updates;
              if (style) {
                const { border, padding, ...styleRest } = style;
                Object.assign(col.style, styleRest);
                if (padding && Array.isArray(padding) && padding.length === 4) {
                  col.style.padding = [...padding] as [number, number, number, number];
                }
                if (border && typeof border === "object") {
                  Object.assign(col.style.border, border);
                }
              }
              Object.assign(col, rest);
              s.dirty = true;
              recordHistory(s);
              return;
            }
          }
        }),

      addElement: (element, columnId, index) =>
        set((s) => {
          const hit = findColumn(s.document, columnId);
          if (!hit) return;
          hit.column.elements.splice(index, 0, element);
          s.dirty = true;
          recordHistory(s);
        }),

      insertElementFromPalette: (type, columnId) =>
        set((s) => {
          const el = createElementFromType(type, nanoid);
          let targetColId = columnId;
          if (targetColId && !findColumn(s.document, targetColId)) {
            targetColId = null;
          }
          if (!targetColId) {
            const sec = createEmptySection(
              () => nanoid(),
              `Section ${s.document.sections.length + 1}`
            );
            s.document.sections.push(sec);
            targetColId = sec.rows[0]!.columns[0]!.id;
          }
          const hit = findColumn(s.document, targetColId);
          if (!hit) return;
          hit.column.elements.push(el);
          /** Pas de sélection auto : l’utilisateur reste sur l’onglet Structure après un glisser-déposer palette. */
          s.dirty = true;
          recordHistory(s);
        }),

      updateElement: (id, updates) =>
        set((s) => {
          const hit = findElement(s.document, id);
          if (!hit) return;
          const { style, content, ...rest } = updates;
          if (style) Object.assign(hit.element.style, style);
          if (content && typeof content === "object") {
            Object.assign(hit.element.content as object, content);
          }
          Object.assign(hit.element, rest);
          s.dirty = true;
          recordHistory(s);
        }),

      deleteElement: (id) =>
        set((s) => {
          const hit = findElement(s.document, id);
          if (!hit || hit.element.locked) return;
          hit.column.elements.splice(hit.index, 1);
          if (s.selectedId === id) {
            s.selectedId = null;
            s.selectedType = null;
          }
          s.dirty = true;
          recordHistory(s);
        }),

      duplicateElement: (id) =>
        set((s) => {
          const hit = findElement(s.document, id);
          if (!hit || hit.element.locked) return;
          const copy = JSON.parse(JSON.stringify(hit.element)) as EditorElement;
          copy.id = nanoid();
          hit.column.elements.splice(hit.index + 1, 0, copy);
          s.dirty = true;
          recordHistory(s);
        }),

      moveElementInColumn: (elementId, columnId, newIndex) =>
        set((s) => {
          const from = findElement(s.document, elementId);
          const toCol = findColumn(s.document, columnId);
          if (!from || !toCol || from.element.locked) return;
          from.column.elements.splice(from.index, 1);
          const insertAt = Math.min(Math.max(0, newIndex), toCol.column.elements.length);
          toCol.column.elements.splice(insertAt, 0, from.element);
          s.dirty = true;
          recordHistory(s);
        }),

      undo: () =>
        set((s) => {
          if (s.historyIndex <= 0) return;
          s.historyIndex -= 1;
          s.document = snapshot(s.history[s.historyIndex]!);
          s.dirty = true;
        }),

      redo: () =>
        set((s) => {
          if (s.historyIndex >= s.history.length - 1) return;
          s.historyIndex += 1;
          s.document = snapshot(s.history[s.historyIndex]!);
          s.dirty = true;
        }),
    }))
  );
}

export type EditorStoreApi = ReturnType<typeof createEditorStore>;
