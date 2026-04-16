/**
 * Modèle unique du document page (source de vérité éditeur CRÉO v2).
 * Aligné sur le cahier des charges builder (sections → rows → columns → elements).
 */

export type PageTypeId =
  | "landing"
  | "sales"
  | "checkout"
  | "upsell"
  | "thankyou"
  | "webinar"
  | "blog"
  | "membership"
  | "optin"
  | "custom";

export type FontConfig = {
  family: string;
  weights: number[];
  fallback: string;
};

export type PageMeta = {
  title: string;
  description: string;
  ogImage: string;
  favicon: string;
  customCSS: string;
  customJS: string;
  headerCode: string;
  footerCode: string;
  slug: string;
  fonts: FontConfig[];
  backgroundColor: string;
  backgroundImage: string;
  backgroundVideo: string;
  backgroundOverlay: string;
  maxWidth: number;
  scrollAnimations: boolean;
};

export type GlobalStyles = {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontHeading: string;
  fontBody: string;
  baseFontSize: number;
  buttonRadius: number;
  inputRadius: number;
};

export type GradientConfig = {
  type: "linear" | "radial" | "conic";
  angle: number;
  stops: { color: string; position: number }[];
};

export type BorderConfig = {
  width: number;
  style: "solid" | "dashed" | "dotted" | "double" | "none";
  color: string;
};

export type ShadowConfig = {
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  inset: boolean;
};

export type DividerConfig = {
  type: "none" | "wave" | "triangle" | "curve" | "arrow" | "tilt" | "zigzag" | "cloud";
  color: string;
  height: number;
  flip: boolean;
  zIndex: number;
};

export type TransitionConfig = {
  property: "all" | "color" | "background" | "transform" | "opacity" | "shadow";
  duration: number;
  easing: string;
  delay: number;
};

export type TransformConfig = {
  rotate: number;
  scaleX: number;
  scaleY: number;
  translateX: number;
  translateY: number;
  skewX: number;
  skewY: number;
};

export type FilterConfig = {
  blur: number;
  brightness: number;
  contrast: number;
  grayscale: number;
  sepia: number;
  saturate: number;
  hueRotate: number;
};

export type AnimationConfig = {
  type:
    | "none"
    | "fadeIn"
    | "fadeInUp"
    | "fadeInDown"
    | "fadeInLeft"
    | "fadeInRight"
    | "zoomIn"
    | "zoomOut"
    | "flipX"
    | "flipY"
    | "bounce"
    | "pulse"
    | "shake"
    | "slideInLeft"
    | "slideInRight"
    | "rotateIn";
  trigger: "onLoad" | "onScroll" | "onHover" | "onClick";
  duration: number;
  delay: number;
  easing: "ease" | "ease-in" | "ease-out" | "ease-in-out" | "linear" | "spring";
  repeat: boolean;
  repeatCount: number | "infinite";
  offset: number;
};

export type InteractionConfig = {
  trigger: "hover" | "click" | "focus";
  action: "changeColor" | "changeOpacity" | "scale" | "rotate" | "translate" | "shadow" | "custom";
  value: unknown;
  duration: number;
  easing: string;
};

export type SectionStyle = {
  backgroundColor: string;
  backgroundImage: string;
  backgroundVideo: string;
  backgroundOverlay: { color: string; opacity: number };
  backgroundSize: "cover" | "contain" | "repeat" | "auto";
  backgroundPosition: string;
  backgroundAttachment: "scroll" | "fixed";
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  marginTop: number;
  marginBottom: number;
  borderTop: BorderConfig;
  borderBottom: BorderConfig;
  borderLeft: BorderConfig;
  borderRight: BorderConfig;
  borderRadius: number;
  boxShadow: ShadowConfig;
  dividerTop: DividerConfig;
  dividerBottom: DividerConfig;
  zIndex: number;
};

export type Row = {
  id: string;
  type: "row";
  columns: Column[];
  columnGap: number;
  rowGap: number;
  verticalAlign: "top" | "center" | "bottom" | "stretch";
  reverseOnMobile: boolean;
  columnWidths: {
    desktop: number[];
    tablet: number[];
    mobile: number[];
  };
};

export type ColumnStyle = {
  backgroundColor: string;
  backgroundImage: string;
  padding: [number, number, number, number];
  borderRadius: number;
  border: BorderConfig;
  verticalAlign: "top" | "center" | "bottom";
  minHeight: number;
};

export type Column = {
  id: string;
  type: "column";
  elements: EditorElement[];
  style: ColumnStyle;
  hiddenOn: ("desktop" | "tablet" | "mobile")[];
};

export type ElementType =
  | "heading"
  | "text"
  | "richtext"
  | "list"
  | "blockquote"
  | "code"
  | "image"
  | "video"
  | "audio"
  | "icon"
  | "lottie"
  | "gif"
  | "svg"
  | "button"
  | "link"
  | "form"
  | "input"
  | "textarea"
  | "select"
  | "checkbox"
  | "radio"
  | "optin"
  | "divider"
  | "spacer"
  | "contentbox"
  | "rawhtml"
  | "countdown"
  | "progressbar"
  | "pricedisplay"
  | "testimonial"
  | "testimonialcarousel"
  | "faq"
  | "carousel"
  | "tabs"
  | "accordion"
  | "popup"
  | "socialshare"
  | "socialproof"
  | "stars"
  | "badge"
  | "tag"
  | "embed"
  | "map"
  | "calendly"
  | "iframe"
  | "navbar"
  | "menu"
  | "breadcrumb"
  | "orderform"
  | "orderbump"
  | "paymentform"
  | "ordersummary"
  | "curriculum"
  | "lessonplayer"
  | "quiz"
  | "certificate"
  | "progresstracker";

export type ElementStyle = {
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  paddingTop: number;
  paddingBottom: number;
  paddingLeft: number;
  paddingRight: number;
  width: "auto" | "100%" | number;
  height: "auto" | number;
  maxWidth: number;
  minWidth: number;
  textAlign: "left" | "center" | "right" | "justify";
  alignSelf: "flex-start" | "center" | "flex-end";
  backgroundColor: string;
  backgroundImage: string;
  backgroundGradient: GradientConfig | null;
  borderRadius: number | [number, number, number, number];
  border: BorderConfig;
  boxShadow: ShadowConfig;
  opacity: number;
  fontSize: number;
  fontSizeTablet: number;
  fontSizeMobile: number;
  fontFamily: string;
  fontWeight: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  fontStyle: "normal" | "italic";
  lineHeight: number;
  letterSpacing: number;
  color: string;
  textShadow: string;
  /** Souligné et barré peuvent être combinés (`underline line-through`). */
  textDecoration: "none" | "underline" | "line-through" | "underline line-through";
  textTransform: "none" | "uppercase" | "lowercase" | "capitalize";
  position: "relative" | "absolute" | "sticky";
  zIndex: number;
  transform: TransformConfig;
  filter: FilterConfig;
  overflow: "visible" | "hidden" | "scroll" | "auto";
  cursor: "default" | "pointer" | "crosshair" | "text" | "move" | "not-allowed";
  transition: TransitionConfig;
};

export type EditorElement = {
  id: string;
  type: ElementType;
  content: Record<string, unknown>;
  style: ElementStyle;
  animation: AnimationConfig;
  interactions: InteractionConfig[];
  hiddenOn: ("desktop" | "tablet" | "mobile")[];
  customId: string;
  customClass: string;
  locked: boolean;
};

export type Section = {
  id: string;
  type: "section";
  label: string;
  layout: "full" | "boxed";
  height: "auto" | "viewport" | "fixed";
  fixedHeight?: number;
  verticalAlign: "top" | "center" | "bottom";
  rows: Row[];
  style: SectionStyle;
  sticky: boolean;
  hidden: boolean;
  hiddenOn: ("desktop" | "tablet" | "mobile")[];
  animation: AnimationConfig;
  customId: string;
  customClass: string;
};

export type PageDocument = {
  id: string;
  name: string;
  pageType: PageTypeId;
  meta: PageMeta;
  sections: Section[];
  globalStyles: GlobalStyles;
  version: number;
  lastSaved: string;
};

export type SaveVersion = {
  id: string;
  documentSnapshot: PageDocument;
  timestamp: string;
  label: string;
  thumbnail: string;
  changedBy: string;
};
