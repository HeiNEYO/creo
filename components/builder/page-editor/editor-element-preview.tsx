"use client";

import { renderPublicBlock } from "@/components/public/public-block-renderer";
import { elementStyleToPreviewCss } from "@/lib/pages/editor/element-style-to-css";
import { elementToPageBlock } from "@/lib/pages/editor/flatten-to-legacy-blocks";
import type { EditorElement } from "@/lib/pages/editor/page-document.types";

/** Rendu WYSIWYG aligné sur la page publique + styles d’élément. */
export function EditorElementPreview({ element }: { element: EditorElement }) {
  const block = elementToPageBlock(element);
  return (
    <div
      className="pointer-events-none min-w-0 select-none [&_a]:pointer-events-none [&_button]:pointer-events-none [&_iframe]:pointer-events-none [&_img]:pointer-events-none [&_input]:pointer-events-none"
      style={elementStyleToPreviewCss(element.style)}
    >
      {renderPublicBlock(block, element.id, null, null)}
    </div>
  );
}
