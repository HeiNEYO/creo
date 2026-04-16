import type { Column, EditorElement, PageDocument, Row, Section } from "@/lib/pages/editor/page-document.types";

export function findSection(doc: PageDocument, sectionId: string): Section | undefined {
  return doc.sections.find((s) => s.id === sectionId);
}

export function findColumn(doc: PageDocument, columnId: string): { section: Section; row: Row; column: Column } | null {
  for (const section of doc.sections) {
    for (const row of section.rows) {
      const col = row.columns.find((c) => c.id === columnId);
      if (col) return { section, row, column: col };
    }
  }
  return null;
}

export function findElement(
  doc: PageDocument,
  elementId: string
): { section: Section; row: Row; column: Column; element: EditorElement; index: number } | null {
  for (const section of doc.sections) {
    for (const row of section.rows) {
      for (const column of row.columns) {
        const index = column.elements.findIndex((e) => e.id === elementId);
        if (index >= 0) {
          return { section, row, column, element: column.elements[index]!, index };
        }
      }
    }
  }
  return null;
}
