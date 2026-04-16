"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useStore } from "zustand";

import { createEditorStore, type EditorStoreApi } from "@/lib/pages/editor/editor-store";
import type { PageDocument } from "@/lib/pages/editor/page-document.types";

const PageEditorStoreContext = createContext<EditorStoreApi | null>(null);

export function PageEditorProvider({
  pageId,
  initialDocument,
  children,
}: {
  pageId: string;
  initialDocument: PageDocument;
  children: ReactNode;
}) {
  void pageId;
  const store = useMemo(() => createEditorStore(initialDocument), [initialDocument]);

  return (
    <PageEditorStoreContext.Provider value={store}>{children}</PageEditorStoreContext.Provider>
  );
}

export function usePageEditorStore(): EditorStoreApi {
  const store = useContext(PageEditorStoreContext);
  if (!store) {
    throw new Error("usePageEditorStore doit être utilisé dans PageEditorProvider");
  }
  return store;
}

export function useEditorSelector<T>(selector: (s: import("@/lib/pages/editor/editor-store").EditorStore) => T): T {
  const store = usePageEditorStore();
  return useStore(store, selector);
}
