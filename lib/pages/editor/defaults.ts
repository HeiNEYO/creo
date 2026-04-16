import type {
  AnimationConfig,
  BorderConfig,
  EditorElement,
  ElementStyle,
  GlobalStyles,
  PageDocument,
  PageMeta,
  Row,
  Section,
  SectionStyle,
  Column,
  ColumnStyle,
} from "@/lib/pages/editor/page-document.types";

export const defaultBorder = (): BorderConfig => ({
  width: 0,
  style: "none",
  color: "transparent",
});

export const defaultPageMeta = (): PageMeta => ({
  title: "",
  description: "",
  ogImage: "",
  favicon: "",
  customCSS: "",
  customJS: "",
  headerCode: "",
  footerCode: "",
  slug: "",
  fonts: [],
  backgroundColor: "#ffffff",
  backgroundImage: "",
  backgroundVideo: "",
  backgroundOverlay: "",
  maxWidth: 1200,
  scrollAnimations: true,
});

/** Base neutre « page blanche » : point de départ modifiable dans Paramètres → Page. */
export const defaultGlobalStyles = (): GlobalStyles => ({
  primaryColor: "#171717",
  secondaryColor: "#737373",
  accentColor: "#2563eb",
  fontHeading: "Inter",
  fontBody: "Inter",
  baseFontSize: 16,
  buttonRadius: 8,
  inputRadius: 6,
});

export const defaultAnimation = (): AnimationConfig => ({
  type: "none",
  trigger: "onLoad",
  duration: 400,
  delay: 0,
  easing: "ease-out",
  repeat: false,
  repeatCount: 1,
  offset: 0,
});

export const defaultElementStyle = (): ElementStyle => ({
  marginTop: 0,
  marginBottom: 0,
  marginLeft: 0,
  marginRight: 0,
  paddingTop: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  paddingRight: 0,
  width: "auto",
  height: "auto",
  maxWidth: 0,
  minWidth: 0,
  textAlign: "left",
  alignSelf: "flex-start",
  backgroundColor: "transparent",
  backgroundImage: "",
  backgroundGradient: null,
  borderRadius: 0,
  border: defaultBorder(),
  boxShadow: { x: 0, y: 0, blur: 0, spread: 0, color: "transparent", inset: false },
  opacity: 1,
  fontSize: 16,
  fontSizeTablet: 16,
  fontSizeMobile: 14,
  fontFamily: "",
  fontWeight: 400,
  fontStyle: "normal",
  lineHeight: 1.5,
  letterSpacing: 0,
  color: "#18181b",
  textShadow: "",
  textDecoration: "none",
  textTransform: "none",
  position: "relative",
  zIndex: 1,
  transform: {
    rotate: 0,
    scaleX: 1,
    scaleY: 1,
    translateX: 0,
    translateY: 0,
    skewX: 0,
    skewY: 0,
  },
  filter: {
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    sepia: 0,
    saturate: 100,
    hueRotate: 0,
  },
  overflow: "visible",
  cursor: "default",
  transition: {
    property: "all",
    duration: 200,
    easing: "ease",
    delay: 0,
  },
});

export const defaultSectionStyle = (): SectionStyle => ({
  backgroundColor: "transparent",
  backgroundImage: "",
  backgroundVideo: "",
  backgroundOverlay: { color: "#000000", opacity: 0 },
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundAttachment: "scroll",
  paddingTop: 48,
  paddingBottom: 48,
  paddingLeft: 24,
  paddingRight: 24,
  marginTop: 0,
  marginBottom: 0,
  borderTop: defaultBorder(),
  borderBottom: defaultBorder(),
  borderLeft: defaultBorder(),
  borderRight: defaultBorder(),
  borderRadius: 0,
  boxShadow: { x: 0, y: 0, blur: 0, spread: 0, color: "transparent", inset: false },
  dividerTop: {
    type: "none",
    color: "#e4e4e7",
    height: 0,
    flip: false,
    zIndex: 1,
  },
  dividerBottom: {
    type: "none",
    color: "#e4e4e7",
    height: 0,
    flip: false,
    zIndex: 1,
  },
  zIndex: 1,
});

export const defaultColumnStyle = (): ColumnStyle => ({
  backgroundColor: "transparent",
  backgroundImage: "",
  padding: [0, 0, 0, 0],
  borderRadius: 0,
  border: defaultBorder(),
  verticalAlign: "top",
  minHeight: 0,
});

export function createEmptyRow(columnCount: number, idGen: () => string): Row {
  const widths = Array.from({ length: columnCount }, () => Math.round(100 / columnCount));
  const columns: Column[] = Array.from({ length: columnCount }, () => ({
    id: idGen(),
    type: "column",
    elements: [],
    style: defaultColumnStyle(),
    hiddenOn: [],
  }));
  return {
    id: idGen(),
    type: "row",
    columns,
    columnGap: 24,
    rowGap: 0,
    verticalAlign: "top",
    reverseOnMobile: false,
    columnWidths: {
      desktop: widths,
      tablet: widths,
      mobile: columns.map(() => 100),
    },
  };
}

export function createEmptySection(idGen: () => string, label = "Section"): Section {
  return {
    id: idGen(),
    type: "section",
    label,
    layout: "boxed",
    height: "auto",
    verticalAlign: "center",
    rows: [createEmptyRow(1, idGen)],
    style: defaultSectionStyle(),
    sticky: false,
    hidden: false,
    hiddenOn: [],
    animation: defaultAnimation(),
    customId: "",
    customClass: "",
  };
}

export function createTextElement(idGen: () => string, text = "Paragraphe"): EditorElement {
  return {
    id: idGen(),
    type: "text",
    content: { html: `<p>${text}</p>` },
    style: defaultElementStyle(),
    animation: defaultAnimation(),
    interactions: [],
    hiddenOn: [],
    customId: "",
    customClass: "",
    locked: false,
  };
}

export function createHeadingElement(idGen: () => string, text = "Titre"): EditorElement {
  return {
    id: idGen(),
    type: "heading",
    content: { text, tag: "h1" as const, link: "" },
    style: { ...defaultElementStyle(), fontSize: 32, fontWeight: 700 },
    animation: defaultAnimation(),
    interactions: [],
    hiddenOn: [],
    customId: "",
    customClass: "",
    locked: false,
  };
}

export function createEmptyDocument(
  idGen: () => string,
  pageType: PageDocument["pageType"],
  name: string
): PageDocument {
  const now = new Date().toISOString();
  return {
    id: idGen(),
    name,
    pageType,
    meta: defaultPageMeta(),
    sections: [],
    globalStyles: defaultGlobalStyles(),
    version: 1,
    lastSaved: now,
  };
}
