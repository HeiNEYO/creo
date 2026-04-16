"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useDraggable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2 } from "lucide-react";

import { BlockPreview } from "@/components/builder/block-preview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  countBlocksOfType,
  isCheckoutLockedType,
  type PaletteItem,
} from "@/lib/pages/block-registry";
import { BUILDER_PALETTE, createPageBlock, labelForBlockType, type PageBlock } from "@/lib/pages/page-blocks";
import { cn } from "@/lib/utils";

const CANVAS_EMPTY_ID = "canvas-empty";
const CANVAS_END_ID = "canvas-end";

function groupPalette(items: PaletteItem[]) {
  const map = new Map<string, PaletteItem[]>();
  for (const item of items) {
    const g = item.group;
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(item);
  }
  return Array.from(map.entries());
}

function PaletteItemDraggable({ item }: { item: PaletteItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${item.id}`,
    data: { from: "palette", blockType: item.blockType },
  });

  return (
    <li ref={setNodeRef}>
      <button
        type="button"
        className={cn(
          "flex w-full cursor-grab touch-none items-center gap-2 rounded-creo-md border border-dashed border-creo-gray-200 px-3 py-2 text-left text-creo-sm text-creo-gray-700 hover:border-zinc-300 hover:bg-zinc-50 active:cursor-grabbing",
          isDragging && "opacity-50"
        )}
        {...listeners}
        {...attributes}
      >
        <GripVertical className="size-4 shrink-0 text-creo-gray-400" aria-hidden />
        {item.label}
      </button>
    </li>
  );
}

function CanvasEmptyDrop() {
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_EMPTY_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-[200px] flex-col items-center justify-center rounded-creo-md border-2 border-dashed px-4 py-12 text-center text-creo-sm text-creo-gray-500 transition-colors",
        isOver ? "border-zinc-400 bg-zinc-100" : "border-creo-gray-200"
      )}
    >
      <p className="font-medium text-creo-gray-600">Glisse un bloc depuis la gauche</p>
      <p className="mt-2 text-creo-xs text-creo-gray-400">
        ou utilise les boutons « Ajouter » sur mobile
      </p>
    </div>
  );
}

function CanvasEndDrop() {
  const { setNodeRef, isOver } = useDroppable({ id: CANVAS_END_ID });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "mt-2 min-h-10 rounded-creo-md border border-dashed border-transparent text-center text-creo-xs text-creo-gray-400 transition-colors",
        isOver && "border-zinc-400/80 bg-zinc-100/80 py-2"
      )}
    >
      {isOver ? "Déposer pour ajouter à la fin" : ""}
    </div>
  );
}

function SortableBlockCard({
  block,
  selected,
  onSelect,
  onDelete,
  sortableDisabled,
  deleteDisabled,
}: {
  block: PageBlock;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  sortableDisabled: boolean;
  deleteDisabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
    data: { from: "sortable" },
    disabled: sortableDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-creo-md border bg-creo-white transition-shadow",
        selected
          ? "border-zinc-500 ring-2 ring-zinc-500/20"
          : "border-creo-gray-200 hover:border-creo-gray-300",
        isDragging && "z-10 opacity-90 shadow-lg"
      )}
    >
      <div className="flex gap-1 border-b border-creo-gray-100 bg-creo-gray-50/80 px-2 py-1">
        {sortableDisabled ? (
          <span className="flex size-7 shrink-0 items-center justify-center text-creo-gray-300" title="Ordre verrouillé">
            <GripVertical className="size-4" />
          </span>
        ) : (
          <button
            type="button"
            className="touch-none rounded p-1 text-creo-gray-500 hover:bg-creo-gray-200/80"
            aria-label="Déplacer"
            {...listeners}
            {...attributes}
          >
            <GripVertical className="size-4" />
          </button>
        )}
        <span className="flex flex-1 items-center text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
          {labelForBlockType(block.type)}
        </span>
        {deleteDisabled ? (
          <span className="size-7 shrink-0" />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 w-7 shrink-0 p-0 text-creo-gray-500 hover:text-red-600"
            aria-label="Supprimer le bloc"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="size-3.5" />
          </Button>
        )}
      </div>
      <button type="button" className="w-full p-4 text-left" onClick={onSelect}>
        <BlockPreview block={block} />
      </button>
    </div>
  );
}

function dragOverlayLabel(
  palette: PaletteItem[],
  activeId: string,
  activeData: DragStartEvent["active"]["data"]["current"] | undefined
): string {
  if (activeData && typeof activeData === "object" && "blockType" in activeData) {
    const bt = (activeData as { blockType?: string }).blockType;
    if (bt) return labelForBlockType(bt);
  }
  const id = activeId.replace(/^palette-/, "");
  const item = palette.find((p) => p.id === id);
  return item?.label ?? "Bloc";
}

export type PageBlockEditorProps = {
  blocks: PageBlock[];
  onChange: (blocks: PageBlock[]) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  previewMaxWidth: string;
  /** Palette filtrée par type de page (défaut : page libre). */
  palette?: PaletteItem[];
  /** Désactive tout réordonnancement (ex. checkout). */
  disableReorder?: boolean;
  /** Max de blocs `optin_form` (landing = 1). */
  maxOptinForms?: number;
  onBlockAddBlocked?: (message: string) => void;
};

export function PageBlockEditor({
  blocks,
  onChange,
  selectedId,
  onSelect,
  previewMaxWidth,
  palette = BUILDER_PALETTE,
  disableReorder = false,
  maxOptinForms = 99,
  onBlockAddBlocked,
}: PageBlockEditorProps) {
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activeDragData, setActiveDragData] = useState<
    DragStartEvent["active"]["data"]["current"] | undefined
  >(undefined);
  const [paletteQuery, setPaletteQuery] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {})
  );

  const filteredPalette = useMemo(() => {
    const q = paletteQuery.trim().toLowerCase();
    if (!q) return palette;
    return palette.filter((p) => p.label.toLowerCase().includes(q) || p.group.toLowerCase().includes(q));
  }, [palette, paletteQuery]);

  const ids = useMemo(() => blocks.map((b) => b.id), [blocks]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
    setActiveDragData(event.active.data.current);
  }, []);

  const canAddBlock = useCallback(
    (blockType: string) => {
      if (blockType === "optin_form" && countBlocksOfType(blocks, "optin_form") >= maxOptinForms) {
        onBlockAddBlocked?.("Une seule section opt-in est autorisée sur ce type de page.");
        return false;
      }
      return true;
    },
    [blocks, maxOptinForms, onBlockAddBlocked]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveDragId(null);
      setActiveDragData(undefined);
      if (!over) return;

      const activeData = active.data.current as { from?: string; blockType?: string } | undefined;
      const activeIdStr = String(active.id);
      const overIdStr = String(over.id);
      const fromPalette =
        activeData?.from === "palette" || activeIdStr.startsWith("palette-");

      if (fromPalette) {
        const blockType =
          activeData?.blockType ??
          palette.find((p) => `palette-${p.id}` === activeIdStr)?.blockType;
        if (!blockType) return;
        if (!canAddBlock(blockType)) return;
        const newBlock = createPageBlock(blockType);

        const overIndex = blocks.findIndex((b) => b.id === overIdStr);
        if (overIndex >= 0) {
          const next = [...blocks];
          next.splice(overIndex, 0, newBlock);
          onChange(next);
          onSelect(newBlock.id);
        } else if (overIdStr === CANVAS_EMPTY_ID || overIdStr === CANVAS_END_ID) {
          onChange([...blocks, newBlock]);
          onSelect(newBlock.id);
        }
        return;
      }

      if (disableReorder) return;

      if (activeIdStr === overIdStr) return;
      const oldIndex = blocks.findIndex((b) => b.id === activeIdStr);
      const newIndex = blocks.findIndex((b) => b.id === overIdStr);
      if (oldIndex < 0 || newIndex < 0) return;
      onChange(arrayMove(blocks, oldIndex, newIndex));
    },
    [blocks, canAddBlock, disableReorder, onChange, onSelect, palette]
  );

  const addBlock = useCallback(
    (blockType: string) => {
      if (!canAddBlock(blockType)) return;
      const nb = createPageBlock(blockType);
      onChange([...blocks, nb]);
      onSelect(nb.id);
    },
    [blocks, canAddBlock, onChange, onSelect]
  );

  const deleteBlock = useCallback(
    (id: string) => {
      const next = blocks.filter((b) => b.id !== id);
      onChange(next);
      if (selectedId === id) onSelect(next.length ? next[next.length - 1]!.id : null);
    },
    [blocks, onChange, onSelect, selectedId]
  );

  const grouped = useMemo(() => groupPalette(filteredPalette), [filteredPalette]);

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
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
        <div className="border-b border-creo-gray-100 px-3 pb-2 pt-2">
          <Input
            type="search"
            placeholder="Rechercher un bloc…"
            value={paletteQuery}
            onChange={(e) => setPaletteQuery(e.target.value)}
            className="h-8 text-creo-xs"
            aria-label="Rechercher dans la bibliothèque"
          />
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {grouped.map(([title, items]) => (
            <div key={title} className="mb-4">
              <p className="mb-2 text-creo-xs font-medium uppercase tracking-wide text-creo-gray-500">
                {title}
              </p>
              <ul className="space-y-1">
                {items.map((item) => (
                  <PaletteItemDraggable key={item.id} item={item} />
                ))}
              </ul>
            </div>
          ))}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex gap-1 overflow-x-auto border-b border-creo-gray-200 bg-creo-gray-50 p-2 lg:hidden">
          {filteredPalette.map((item) => (
            <Button
              key={item.id}
              type="button"
              size="sm"
              variant="outline"
              className="shrink-0 text-creo-xs"
              onClick={() => addBlock(item.blockType)}
            >
              + {item.label}
            </Button>
          ))}
        </div>

        <div className="flex flex-1 items-start justify-center overflow-auto p-4 md:p-8">
          <div
            className={cn(
              "min-h-[480px] w-full rounded-creo-lg border border-creo-gray-200 bg-creo-white p-4 shadow-sm transition-all md:p-6",
              previewMaxWidth
            )}
          >
            <SortableContext items={ids} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {blocks.length === 0 ? (
                  <CanvasEmptyDrop />
                ) : (
                  <>
                    {blocks.map((block) => (
                      <SortableBlockCard
                        key={block.id}
                        block={block}
                        selected={selectedId === block.id}
                        onSelect={() => onSelect(block.id)}
                        onDelete={() => deleteBlock(block.id)}
                        sortableDisabled={disableReorder || isCheckoutLockedType(block.type)}
                        deleteDisabled={isCheckoutLockedType(block.type)}
                      />
                    ))}
                    <CanvasEndDrop />
                  </>
                )}
              </div>
            </SortableContext>
            <p className="mt-4 text-center text-creo-xs text-creo-gray-400">
              {blocks.length} bloc{blocks.length !== 1 ? "s" : ""}
              {disableReorder ? " · ordre figé (checkout)" : " · glisser pour réordonner"}
            </p>
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeDragId ? (
          <div className="rounded-creo-md border border-zinc-300 bg-creo-white px-4 py-3 text-creo-sm shadow-lg">
            {dragOverlayLabel(palette, activeDragId, activeDragData)}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
