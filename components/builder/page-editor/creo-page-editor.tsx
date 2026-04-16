"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useCallback, useEffect, useState } from "react";

import { EditorCanvas } from "@/components/builder/page-editor/editor-canvas";
import { EditorLeftPanel, getPaletteItemLabel } from "@/components/builder/page-editor/editor-left-panel";
import type { EditorCheckoutBinding } from "@/components/builder/page-editor/editor-right-panel";
import { usePageEditorStore } from "@/components/builder/page-editor/page-editor-context";
import {
  CREO_CANVAS_EMPTY_ID,
  CREO_CANVAS_INSERT_SECTION_ID,
  isSectionPaletteDrag,
  parseColumnDropId,
  parsePaletteDragId,
} from "@/lib/pages/editor/dnd-ids";
import type { ViewportMode } from "@/lib/pages/editor/editor-store";
import { cn } from "@/lib/utils";

type Device = "desktop" | "tablet" | "mobile";

export type { EditorCheckoutBinding };

export function CreoPageEditor({
  device,
  previewMaxWidth,
  checkout,
}: {
  device: Device;
  previewMaxWidth: string;
  checkout?: EditorCheckoutBinding | null;
}) {
  const store = usePageEditorStore();
  const [overlayLabel, setOverlayLabel] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  useEffect(() => {
    const mode: ViewportMode = device;
    store.getState().setMode(mode);
  }, [device, store]);

  const onDragStart = useCallback(
    (e: DragStartEvent) => {
      const id = String(e.active.id);
      if (isSectionPaletteDrag(id)) {
        setOverlayLabel("Section");
        store.getState().setDragging(true, "sidebar");
        return;
      }
      const t = parsePaletteDragId(id);
      if (t) {
        setOverlayLabel(getPaletteItemLabel(t));
        store.getState().setDragging(true, "sidebar");
      }
    },
    [store]
  );

  const resetDragUi = useCallback(() => {
    setOverlayLabel(null);
    store.getState().setDragging(false, null);
  }, [store]);

  const onDragEnd = useCallback(
    (e: DragEndEvent) => {
      const { active, over } = e;
      resetDragUi();
      if (!over) return;

      const activeId = String(active.id);
      const overId = String(over.id);

      if (isSectionPaletteDrag(activeId)) {
        if (overId === CREO_CANVAS_EMPTY_ID || overId === CREO_CANVAS_INSERT_SECTION_ID) {
          const n = store.getState().document.sections.length;
          store.getState().addSection(n, `Section ${n + 1}`);
        }
        return;
      }

      const type = parsePaletteDragId(activeId);
      if (!type) return;

      if (overId === CREO_CANVAS_EMPTY_ID || overId === CREO_CANVAS_INSERT_SECTION_ID) {
        store.getState().insertElementFromPalette(type, null);
        store.getState().markPaletteDnD();
        return;
      }
      const colId = parseColumnDropId(overId);
      if (colId) {
        store.getState().insertElementFromPalette(type, colId);
        store.getState().markPaletteDnD();
      }
    },
    [resetDragUi, store]
  );

  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={resetDragUi}
      >
        <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden">
          <EditorLeftPanel checkout={checkout} />
          <EditorCanvas previewMaxWidth={previewMaxWidth} />
        </div>
        <DragOverlay dropAnimation={null}>
        {overlayLabel ? (
          <div
            className={cn(
              "flex max-w-[240px] items-center gap-2 rounded-none border-[0.5px] border-zinc-200/35 bg-white px-3 py-2 shadow-lg",
              "text-creo-sm font-medium text-zinc-800 dark:border-zinc-600/35 dark:bg-zinc-900 dark:text-zinc-100"
            )}
          >
            {overlayLabel}
          </div>
        ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
