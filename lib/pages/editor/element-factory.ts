import { nanoid } from "nanoid";

import { mergeButtonPresetIntoContent } from "@/lib/pages/editor/button-editor-presets";
import {
  createHeadingElement,
  createTextElement,
  defaultAnimation,
  defaultElementStyle,
} from "@/lib/pages/editor/defaults";
import type { EditorElement, ElementType } from "@/lib/pages/editor/page-document.types";

export function createElementFromType(type: ElementType, idGen: () => string = nanoid): EditorElement {
  switch (type) {
    case "heading":
      return createHeadingElement(idGen, "Titre");
    case "text":
      return createTextElement(idGen, "Paragraphe de texte.");
    case "button":
      return {
        id: idGen(),
        type: "button",
        content: mergeButtonPresetIntoContent("solid", {
          label: "Bouton",
          action: "url",
          url: "",
          newTab: false,
        }) as EditorElement["content"],
        style: { ...defaultElementStyle(), paddingLeft: 24, paddingRight: 24, paddingTop: 12, paddingBottom: 12 },
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    case "divider":
      return {
        id: idGen(),
        type: "divider",
        content: { style: "line" },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    case "image":
      return {
        id: idGen(),
        type: "image",
        content: { src: "", alt: "", objectFit: "cover" as const },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    case "video":
      return {
        id: idGen(),
        type: "video",
        content: { url: "", provider: "youtube" },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    case "faq":
      return {
        id: idGen(),
        type: "faq",
        content: {
          items: [{ q: "Une question fréquente ?", a: "La réponse apparaît ici." }],
        },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    case "optin":
      return {
        id: idGen(),
        type: "optin",
        content: { intro: "", buttonLabel: "S’inscrire", gdpr: "optional" },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    case "countdown":
      return {
        id: idGen(),
        type: "countdown",
        content: { endAt: "" },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    case "paymentform":
      return {
        id: idGen(),
        type: "paymentform",
        content: { locked: true },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: true,
      };
    case "ordersummary":
      return {
        id: idGen(),
        type: "ordersummary",
        content: { readOnly: true },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: true,
      };
    case "richtext":
      return {
        id: idGen(),
        type: "richtext",
        content: { html: "<p>Texte riche</p>" },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    case "list":
      return {
        id: idGen(),
        type: "list",
        content: { items: ["Premier point", "Deuxième point"] },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    case "link":
      return {
        id: idGen(),
        type: "link",
        content: { label: "Lien", url: "https://", newTab: false },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    case "contentbox":
      return {
        id: idGen(),
        type: "contentbox",
        content: { headline: "Bloc contenu", body: "", backgroundColor: "#fafafa" },
        style: defaultElementStyle(),
        animation: defaultAnimation(),
        interactions: [],
        hiddenOn: [],
        customId: "",
        customClass: "",
        locked: false,
      };
    default:
      return createTextElement(idGen, `Élément « ${type} » — à compléter.`);
  }
}
