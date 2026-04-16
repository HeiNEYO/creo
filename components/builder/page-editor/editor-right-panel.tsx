"use client";

import { useMemo } from "react";
import { useForm } from "react-hook-form";
import {
  AlignLeft,
  Bold,
  BoxSelect,
  Braces,
  Calendar,
  Clock,
  CreditCard,
  Eye,
  FileText,
  Heading1,
  HelpCircle,
  Image,
  Italic,
  Layers,
  LayoutGrid,
  Library,
  Link2,
  ListOrdered,
  Mail,
  MousePointer2,
  Move,
  Palette,
  Ruler,
  RotateCw,
  Sparkles,
  Square,
  SquareStack,
  Strikethrough,
  Timer,
  Type,
  Underline,
  Video,
  Zap,
} from "lucide-react";

import { useEditorSelector, usePageEditorStore } from "@/components/builder/page-editor/page-editor-context";
import {
  InspectorColorPair,
  InspectorColorSwatch,
  InspectorFormColorField,
} from "@/components/builder/page-editor/inspector-color-field";
import {
  IconAlignColumnBottom,
  IconAlignColumnCenter,
  IconAlignColumnTop,
  IconAlignTextCenter,
  IconAlignTextJustify,
  IconAlignTextLeft,
  IconAlignTextRight,
} from "@/components/builder/page-editor/inspector-align-icons";
import {
  InspectorRow,
  InspectorSection,
  type InspectorSectionIcon,
  inspectorCheckboxCls,
  inspectorControlCls,
  inspectorSelectCls,
  inspectorTextareaCls,
} from "@/components/builder/page-editor/inspector-primitives";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  BUTTON_PRESET_LABELS,
  mergeButtonPresetIntoContent,
  type ButtonStylePresetId,
} from "@/lib/pages/editor/button-editor-presets";
import { redistributeColumnWidths } from "@/lib/pages/editor/column-widths";
import { findColumn, findSection } from "@/lib/pages/editor/tree-utils";
import { PAGE_FONT_PRESETS } from "@/lib/public-pages/page-theme";
import { cn } from "@/lib/utils";
import type {
  Column,
  ColumnStyle,
  EditorElement,
  ElementStyle,
  Row,
  Section,
} from "@/lib/pages/editor/page-document.types";

export type EditorCheckoutBinding = {
  priceEuros: string;
  onPriceEurosChange: (value: string) => void;
  productName: string;
  onProductNameChange: (value: string) => void;
  buttonLabel: string;
  onButtonLabelChange: (value: string) => void;
};

const FONT_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Hériter / défaut" },
  { value: "Inter, system-ui, sans-serif", label: "Inter" },
  { value: "system-ui, sans-serif", label: "Système" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: '"Times New Roman", Times, serif', label: "Times" },
  { value: "Merriweather, Georgia, serif", label: "Merriweather" },
  { value: '"Playfair Display", Georgia, serif', label: "Playfair Display" },
  { value: "Montserrat, system-ui, sans-serif", label: "Montserrat" },
  { value: '"Open Sans", system-ui, sans-serif', label: "Open Sans" },
  { value: "Roboto, system-ui, sans-serif", label: "Roboto" },
  { value: '"Lato", system-ui, sans-serif', label: "Lato" },
  { value: '"Poppins", system-ui, sans-serif', label: "Poppins" },
  { value: '"Source Sans 3", system-ui, sans-serif', label: "Source Sans 3" },
  { value: "Nunito, system-ui, sans-serif", label: "Nunito" },
  { value: '"DM Sans", system-ui, sans-serif', label: "DM Sans" },
];

const FONT_WEIGHT_OPTIONS: { value: ElementStyle["fontWeight"]; label: string }[] = [
  { value: 100, label: "Thin (100)" },
  { value: 200, label: "Extra léger (200)" },
  { value: 300, label: "Léger (300)" },
  { value: 400, label: "Regular (400)" },
  { value: 500, label: "Medium (500)" },
  { value: 600, label: "Semi-bold (600)" },
  { value: 700, label: "Bold (700)" },
  { value: 800, label: "Extra-bold (800)" },
  { value: 900, label: "Black (900)" },
];

function buildTextDecoration(underline: boolean, strike: boolean): ElementStyle["textDecoration"] {
  if (underline && strike) return "underline line-through";
  if (underline) return "underline";
  if (strike) return "line-through";
  return "none";
}

function parseTextDecoration(td: ElementStyle["textDecoration"]): { underline: boolean; strike: boolean } {
  return {
    underline: td.includes("underline"),
    strike: td.includes("line-through"),
  };
}

function toDatetimeLocal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function PanelSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: InspectorSectionIcon;
  children: React.ReactNode;
}) {
  return (
    <InspectorSection title={title} icon={icon}>
      <div className="space-y-0">{children}</div>
    </InspectorSection>
  );
}

function inputFieldCls() {
  return inspectorControlCls();
}

function selectFieldCls() {
  return inspectorSelectCls();
}

function textareaFieldCls() {
  return inspectorTextareaCls();
}

/** Contenu défilant des paramètres (page, section, colonne, bloc) — à intégrer dans la colonne latérale du builder. */
export function EditorPropertiesPanelContent({
  checkout,
  className,
}: {
  checkout?: EditorCheckoutBinding | null;
  className?: string;
}) {
  const selectedId = useEditorSelector((s) => s.selectedId);
  const selectedType = useEditorSelector((s) => s.selectedType);
  const document = useEditorSelector((s) => s.document);

  const selectedElement =
    selectedType === "element" && selectedId
      ? (() => {
          for (const sec of document.sections) {
            for (const row of sec.rows) {
              for (const col of row.columns) {
                const el = col.elements.find((e) => e.id === selectedId);
                if (el) return el;
              }
            }
          }
          return null;
        })()
      : null;

  const selectedSection: Section | null =
    selectedType === "section" && selectedId ? findSection(document, selectedId) ?? null : null;

  const selectedColumnCtx =
    selectedType === "column" && selectedId ? findColumn(document, selectedId) : null;

  return (
    <div
      className={cn(
        "min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain px-5 py-6 antialiased",
        "bg-[#f5f5f7] text-zinc-800 [color-scheme:light] dark:bg-zinc-950 dark:text-zinc-300 dark:[color-scheme:dark]",
        "[&_label]:!text-[12px] [&_label]:!font-normal [&_label]:!text-zinc-600 [&_label]:leading-snug dark:[&_label]:!text-zinc-500",
        className
      )}
    >
      {!selectedId || selectedType === null ? (
        <PageSettingsPanel />
      ) : selectedColumnCtx ? (
        <ColumnSettingsPanel column={selectedColumnCtx.column} row={selectedColumnCtx.row} />
      ) : selectedSection ? (
        <SectionSettingsPanel section={selectedSection} />
      ) : selectedElement ? (
        <ElementSettingsPanel element={selectedElement} />
      ) : (
        <p className="text-[12px] leading-relaxed text-zinc-600 dark:text-zinc-500">
          Sélectionne un bloc sur le canvas.
        </p>
      )}
      {checkout ? (
        <CheckoutStripeFields checkout={checkout} className="mt-6 border-t border-zinc-200/90 pt-5 dark:border-white/[0.08]" />
      ) : null}
    </div>
  );
}

export function CheckoutStripeFields({
  checkout,
  className,
}: {
  checkout: NonNullable<EditorCheckoutBinding>;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2 px-0.5", className)}>
      <InspectorSection title="Checkout Stripe" icon={CreditCard} defaultOpen>
        <InspectorRow label="Prix (EUR)">
          <Input
            id="co-price-xl"
            inputMode="decimal"
            value={checkout.priceEuros}
            onChange={(e) => checkout.onPriceEurosChange(e.target.value)}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Produit">
          <Input
            id="co-name-xl"
            value={checkout.productName}
            onChange={(e) => checkout.onProductNameChange(e.target.value)}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Bouton">
          <Input
            id="co-btn-xl"
            value={checkout.buttonLabel}
            onChange={(e) => checkout.onButtonLabelChange(e.target.value)}
            className={inputFieldCls()}
          />
        </InspectorRow>
      </InspectorSection>
    </div>
  );
}

function PageSettingsPanel() {
  const store = usePageEditorStore();
  const meta = useEditorSelector((s) => s.document.meta);
  const gs = useEditorSelector((s) => s.document.globalStyles);
  const formValues = useMemo(
    () => ({
      title: meta.title,
      description: meta.description,
      maxWidth: meta.maxWidth,
      backgroundColor: meta.backgroundColor || "#ffffff",
      primary: gs.primaryColor,
      secondary: gs.secondaryColor,
      accent: gs.accentColor,
      fontHeading: gs.fontHeading,
      fontBody: gs.fontBody,
      baseFontSize: gs.baseFontSize,
    }),
    [
      meta.title,
      meta.description,
      meta.maxWidth,
      meta.backgroundColor,
      gs.primaryColor,
      gs.secondaryColor,
      gs.accentColor,
      gs.fontHeading,
      gs.fontBody,
      gs.baseFontSize,
    ]
  );
  const { register, handleSubmit } = useForm({
    defaultValues: formValues,
    values: formValues,
  });

  const applyPageSettings = (vals: {
    title: string;
    description: string;
    maxWidth: string | number;
    backgroundColor: string;
    primary: string;
    secondary: string;
    accent: string;
    fontHeading: string;
    fontBody: string;
    baseFontSize: string | number;
  }) => {
    store.getState().updatePageMeta({
      title: vals.title,
      description: vals.description,
      maxWidth: Number(vals.maxWidth) || 1200,
      backgroundColor: vals.backgroundColor,
    });
    store.getState().updateGlobalStyles({
      primaryColor: vals.primary,
      secondaryColor: vals.secondary,
      accentColor: vals.accent,
      fontHeading: vals.fontHeading,
      fontBody: vals.fontBody,
      baseFontSize: Math.min(24, Math.max(12, Number(vals.baseFontSize) || 16)),
    });
  };

  return (
    <div className="space-y-3">
      <form className="space-y-3" onChange={handleSubmit((vals) => applyPageSettings(vals))}>
        <PanelSection
          title="Informations & SEO"
          icon={FileText}
        >
          <InspectorRow label="Titre">
            <Input id="pm-title" {...register("title")} className={inputFieldCls()} />
          </InspectorRow>
          <InspectorRow label="Meta desc.">
            <Textarea id="pm-desc" rows={3} {...register("description")} className={inspectorTextareaCls()} />
          </InspectorRow>
          <InspectorRow label="Largeur max (px)">
            <Input id="pm-mw" type="number" min={320} max={1920} {...register("maxWidth")} className={inputFieldCls()} />
          </InspectorRow>
        </PanelSection>

        <PanelSection
          title="Couleurs & fond"
          icon={Palette}
        >
          <InspectorRow label="Fond de page">
            <InspectorFormColorField id="pm-bg" {...register("backgroundColor")} />
          </InspectorRow>
          <InspectorRow label="Texte principal">
            <InspectorFormColorField id="pm-primary" {...register("primary")} />
          </InspectorRow>
          <InspectorRow label="Texte secondaire">
            <InspectorFormColorField id="pm-secondary" {...register("secondary")} />
          </InspectorRow>
          <InspectorRow label="Accent (liens, CTA)">
            <InspectorFormColorField id="pm-accent" {...register("accent")} />
          </InspectorRow>
        </PanelSection>

        <PanelSection title="Typographie" icon={Type}>
          <InspectorRow label="Police titres">
            <select id="pm-font-h" className={selectFieldCls()} {...register("fontHeading")}>
              {PAGE_FONT_PRESETS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </InspectorRow>
          <InspectorRow label="Police corps">
            <select id="pm-font-body" className={selectFieldCls()} {...register("fontBody")}>
              {PAGE_FONT_PRESETS.map((f) => (
                <option key={`b-${f.value}`} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </InspectorRow>
          <InspectorRow label="Taille base (px)">
            <Input
              id="pm-fs"
              type="number"
              min={12}
              max={24}
              step={1}
              {...register("baseFontSize")}
              className={inputFieldCls()}
            />
          </InspectorRow>
        </PanelSection>
      </form>
    </div>
  );
}

function ColumnSettingsPanel({ column, row }: { column: Column; row: Row }) {
  const store = usePageEditorStore();
  const colIdx = row.columns.findIndex((c) => c.id === column.id);
  const widthPct =
    colIdx >= 0
      ? Math.round((row.columnWidths.desktop[colIdx] ?? 100 / row.columns.length) * 10) / 10
      : 100;
  const st = column.style;
  const [pt, pr, pb, pl] = st.padding;
  const hidden = column.hiddenOn ?? [];

  const bgHex =
    st.backgroundColor?.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(st.backgroundColor)
      ? st.backgroundColor
      : "#ffffff";

  const setStyle = (style: Partial<ColumnStyle>) => store.getState().updateColumn(column.id, { style });

  const toggleHidden = (bp: "desktop" | "tablet" | "mobile", on: boolean) => {
    const cur = column.hiddenOn ?? [];
    const next = on ? (cur.includes(bp) ? cur : [...cur, bp]) : cur.filter((x) => x !== bp);
    store.getState().updateColumn(column.id, { hiddenOn: next });
  };

  return (
    <div className="space-y-2 px-0.5">
      <PanelSection title="Disposition" icon={LayoutGrid}>
        <InspectorRow label="Largeur %">
          <Input
            type="number"
            min={8}
            max={92}
            value={row.columns.length < 2 ? 100 : widthPct}
            disabled={row.columns.length < 2}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (colIdx < 0) return;
              const next = redistributeColumnWidths(row, colIdx, v);
              store.getState().setColumnWidths(row.id, next);
            }}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Align. vertical">
          <select
            className={selectFieldCls()}
            value={st.verticalAlign}
            onChange={(e) =>
              setStyle({ verticalAlign: e.target.value as Column["style"]["verticalAlign"] })
            }
          >
            <option value="top">Haut</option>
            <option value="center">Milieu</option>
            <option value="bottom">Bas</option>
          </select>
        </InspectorRow>
      </PanelSection>

      <PanelSection title="Apparence" icon={Palette}>
        <InspectorRow label="Fond">
          <InspectorColorPair
            colorValue={bgHex}
            onColorChange={(hex) => setStyle({ backgroundColor: hex })}
            textValue={st.backgroundColor === "transparent" ? "" : st.backgroundColor}
            onTextChange={(v) => setStyle({ backgroundColor: v || "transparent" })}
            textPlaceholder="transparent"
            fallbackHex="#ffffff"
          />
        </InspectorRow>
        <InspectorRow label="Image fond">
          <Input
            className={inputFieldCls()}
            placeholder="URL (optionnel)"
            value={st.backgroundImage}
            onChange={(e) => setStyle({ backgroundImage: e.target.value })}
          />
        </InspectorRow>
        <InspectorRow label="Padding V">
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="Haut"
              value={pt}
              onChange={(e) =>
                setStyle({
                  padding: [Number(e.target.value) || 0, pr, pb, pl],
                })
              }
              className={inputFieldCls()}
            />
            <Input
              type="number"
              placeholder="Bas"
              value={pb}
              onChange={(e) =>
                setStyle({
                  padding: [pt, pr, Number(e.target.value) || 0, pl],
                })
              }
              className={inputFieldCls()}
            />
          </div>
        </InspectorRow>
        <InspectorRow label="Padding H">
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="Gauche"
              value={pl}
              onChange={(e) =>
                setStyle({
                  padding: [pt, pr, pb, Number(e.target.value) || 0],
                })
              }
              className={inputFieldCls()}
            />
            <Input
              type="number"
              placeholder="Droite"
              value={pr}
              onChange={(e) =>
                setStyle({
                  padding: [pt, Number(e.target.value) || 0, pb, pl],
                })
              }
              className={inputFieldCls()}
            />
          </div>
        </InspectorRow>
        <InspectorRow label="Min. hauteur">
          <Input
            type="number"
            min={0}
            value={st.minHeight || ""}
            onChange={(e) => setStyle({ minHeight: Number(e.target.value) || 0 })}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Rayon">
          <Input
            type="number"
            min={0}
            value={st.borderRadius}
            onChange={(e) => setStyle({ borderRadius: Math.max(0, Number(e.target.value) || 0) })}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Bordure px">
          <Input
            type="number"
            min={0}
            value={st.border.width}
            onChange={(e) =>
              setStyle({
                border: { ...st.border, width: Math.max(0, Number(e.target.value) || 0) },
              })
            }
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Style bord.">
          <select
            className={selectFieldCls()}
            value={st.border.style}
            onChange={(e) =>
              setStyle({
                border: { ...st.border, style: e.target.value as Column["style"]["border"]["style"] },
              })
            }
          >
            <option value="none">Aucune</option>
            <option value="solid">Plein</option>
            <option value="dashed">Tirets</option>
            <option value="dotted">Pointillés</option>
          </select>
        </InspectorRow>
        <InspectorRow label="Couleur bord.">
          <InspectorColorPair
            colorValue={
              st.border.color?.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(st.border.color)
                ? st.border.color
                : "#18181b"
            }
            onColorChange={(hex) => setStyle({ border: { ...st.border, color: hex } })}
            textValue={st.border.color}
            onTextChange={(v) => setStyle({ border: { ...st.border, color: v } })}
            fallbackHex="#18181b"
          />
        </InspectorRow>
      </PanelSection>

      <PanelSection title="Visibilité" icon={Eye}>
        <InspectorRow label="Masquer sur">
          <div className="flex flex-col items-end gap-1.5">
            {(["desktop", "tablet", "mobile"] as const).map((bp) => (
              <label key={bp} className="flex cursor-pointer items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-500">
                <input
                  type="checkbox"
                  checked={hidden.includes(bp)}
                  onChange={(e) => toggleHidden(bp, e.target.checked)}
                  className={inspectorCheckboxCls()}
                />
                {bp === "desktop" ? "Bureau" : bp === "tablet" ? "Tablette" : "Mobile"}
              </label>
            ))}
          </div>
        </InspectorRow>
      </PanelSection>
    </div>
  );
}

function SectionSettingsPanel({ section }: { section: Section }) {
  const store = usePageEditorStore();
  const st = section.style;
  const bgHex = st.backgroundColor?.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(st.backgroundColor)
    ? st.backgroundColor
    : "#ffffff";

  return (
    <div className="space-y-2 px-0.5">
      <PanelSection title="Section" icon={SquareStack}>
        <InspectorRow label="Nom">
          <Input
            id="sec-label"
            value={section.label}
            onChange={(e) => store.getState().updateSection(section.id, { label: e.target.value })}
            className={inputFieldCls()}
          />
        </InspectorRow>
      </PanelSection>
      <PanelSection title="Apparence" icon={Palette}>
        <InspectorRow label="Fond">
          <InspectorColorPair
            colorValue={bgHex}
            onColorChange={(hex) =>
              store.getState().updateSection(section.id, { style: { backgroundColor: hex } })
            }
            textValue={st.backgroundColor === "transparent" ? "" : st.backgroundColor}
            onTextChange={(v) =>
              store.getState().updateSection(section.id, {
                style: { backgroundColor: v || "transparent" },
              })
            }
            textPlaceholder="#fff ou transparent"
            fallbackHex="#ffffff"
          />
        </InspectorRow>
        <InspectorRow label="Padding V">
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="Haut"
              value={st.paddingTop}
              onChange={(e) =>
                store.getState().updateSection(section.id, { style: { paddingTop: Number(e.target.value) || 0 } })
              }
              className={inputFieldCls()}
            />
            <Input
              type="number"
              placeholder="Bas"
              value={st.paddingBottom}
              onChange={(e) =>
                store.getState().updateSection(section.id, { style: { paddingBottom: Number(e.target.value) || 0 } })
              }
              className={inputFieldCls()}
            />
          </div>
        </InspectorRow>
        <InspectorRow label="Padding H">
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="Gauche"
              value={st.paddingLeft}
              onChange={(e) =>
                store.getState().updateSection(section.id, { style: { paddingLeft: Number(e.target.value) || 0 } })
              }
              className={inputFieldCls()}
            />
            <Input
              type="number"
              placeholder="Droite"
              value={st.paddingRight}
              onChange={(e) =>
                store.getState().updateSection(section.id, { style: { paddingRight: Number(e.target.value) || 0 } })
              }
              className={inputFieldCls()}
            />
          </div>
        </InspectorRow>
      </PanelSection>
      <PanelSection title="Avancé" icon={Sparkles}>
        <InspectorRow label="ID HTML">
          <Input
            id="sec-cid"
            value={section.customId}
            onChange={(e) => store.getState().updateSection(section.id, { customId: e.target.value })}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Classe CSS">
          <Input
            id="sec-ccl"
            value={section.customClass}
            onChange={(e) => store.getState().updateSection(section.id, { customClass: e.target.value })}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Visibilité">
          <label className="flex cursor-pointer items-center justify-end gap-2">
            <input
              type="checkbox"
              checked={section.hidden}
              onChange={(e) => store.getState().updateSection(section.id, { hidden: e.target.checked })}
              className={inspectorCheckboxCls()}
            />
            <span className="text-[11px] text-zinc-600 dark:text-zinc-500">Masquer la section</span>
          </label>
        </InspectorRow>
      </PanelSection>
    </div>
  );
}

/** Alignement : icône seule, bleu CRÉO — pas de cadre carré (style type Framer). */
function alignIconBtn(active: boolean) {
  return cn(
    "flex size-8 shrink-0 items-center justify-center rounded-md border-0 bg-transparent p-0 transition-[opacity,color]",
    active
      ? "text-creo-blue opacity-100 dark:text-creo-blue-soft"
      : "text-creo-blue/40 opacity-90 hover:text-creo-blue hover:opacity-100 dark:text-creo-blue-soft/45 dark:hover:text-creo-blue-soft"
  );
}

function inspectorToggleBtn(active: boolean) {
  return cn(
    "min-w-[2.6rem] rounded-md border px-2 py-1.5 text-[11px] font-semibold tracking-tight transition-all",
    active
      ? "border-creo-blue/55 bg-creo-blue/15 text-[color:var(--creo-blue-soft)]"
      : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-zinc-500 dark:hover:border-white/15 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-300"
  );
}

function ElementSettingsPanel({ element }: { element: EditorElement }) {
  const store = usePageEditorStore();
  const patchStyle = (patch: Partial<ElementStyle>) => store.getState().updateElement(element.id, { style: patch });
  const st = element.style;

  if (element.locked) {
    return (
      <p className="rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[12px] leading-snug text-amber-900 dark:text-amber-200/90">
        Bloc verrouillé (checkout / tunnel) — paramètres limités.
      </p>
    );
  }

  const showTypography = ["heading", "text", "richtext", "list", "link"].includes(element.type);
  const widthMode = st.width === "100%" ? "full" : typeof st.width === "number" ? "px" : "auto";
  const colorForPicker =
    st.color?.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(st.color) ? st.color : "#18181b";

  return (
    <div className="space-y-2 px-0.5">
      <ElementContentSection element={element} />

      <div className="mb-6 border-b border-zinc-200/90 pb-5 dark:border-white/[0.07]">
        <div className="mb-3 flex items-center gap-2.5">
          <AlignLeft
            className="size-[15px] shrink-0 text-zinc-500 dark:text-zinc-500"
            strokeWidth={2}
            aria-hidden
          />
          <span className="text-[13px] font-semibold leading-tight tracking-[-0.02em] text-zinc-900 dark:text-white">
            Alignement
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              ["left", IconAlignTextLeft, "Texte gauche"],
              ["center", IconAlignTextCenter, "Texte centre"],
              ["right", IconAlignTextRight, "Texte droite"],
              ["justify", IconAlignTextJustify, "Texte justifié"],
            ] as const
          ).map(([v, Icon, title]) => (
            <button
              key={v}
              type="button"
              title={title}
              className={alignIconBtn(st.textAlign === v)}
              onClick={() => patchStyle({ textAlign: v })}
            >
              <Icon />
            </button>
          ))}
          <span className="mx-0.5 hidden h-4 w-px bg-zinc-200 dark:bg-white/10 sm:inline" aria-hidden />
          {(
            [
              ["flex-start", IconAlignColumnTop, "Colonne haut"],
              ["center", IconAlignColumnCenter, "Colonne milieu"],
              ["flex-end", IconAlignColumnBottom, "Colonne bas"],
            ] as const
          ).map(([v, Icon, title]) => (
            <button
              key={v}
              type="button"
              title={title}
              className={alignIconBtn(st.alignSelf === v)}
              onClick={() => patchStyle({ alignSelf: v })}
            >
              <Icon />
            </button>
          ))}
        </div>
      </div>

      <InspectorSection title="Position" icon={Move}>
        <InspectorRow label="Type">
          <select
            className={selectFieldCls()}
            value={st.position}
            onChange={(e) => patchStyle({ position: e.target.value as ElementStyle["position"] })}
          >
            <option value="relative">Relatif</option>
            <option value="absolute">Absolu</option>
            <option value="sticky">Sticky</option>
          </select>
        </InspectorRow>
        <InspectorRow label="Plan (z-index)">
          <Input
            type="number"
            value={st.zIndex}
            onChange={(e) => patchStyle({ zIndex: Number(e.target.value) || 0 })}
            className={inputFieldCls()}
          />
        </InspectorRow>
      </InspectorSection>

      <InspectorSection title="Taille & espacements" icon={Ruler}>
        <InspectorRow label="Largeur">
          <div className="flex gap-1">
            <select
              className={cn(selectFieldCls(), "w-[40%] shrink-0")}
              value={widthMode}
              onChange={(e) => {
                const v = e.target.value;
                if (v === "auto") patchStyle({ width: "auto" });
                else if (v === "full") patchStyle({ width: "100%" });
                else patchStyle({ width: typeof st.width === "number" ? st.width : 320 });
              }}
            >
              <option value="auto">Auto</option>
              <option value="full">100 %</option>
              <option value="px">Px</option>
            </select>
            {widthMode === "px" ? (
              <Input
                type="number"
                min={1}
                className={inputFieldCls()}
                value={typeof st.width === "number" ? st.width : 320}
                onChange={(e) => patchStyle({ width: Math.max(1, Number(e.target.value) || 320) })}
              />
            ) : null}
          </div>
        </InspectorRow>
        <InspectorRow label="Hauteur">
          <div className="flex gap-1">
            <select
              className={cn(selectFieldCls(), "w-[40%] shrink-0")}
              value={st.height === "auto" ? "auto" : "px"}
              onChange={(e) =>
                patchStyle({
                  height:
                    e.target.value === "auto"
                      ? "auto"
                      : typeof st.height === "number"
                        ? st.height
                        : 200,
                })
              }
            >
              <option value="auto">Auto</option>
              <option value="px">Px</option>
            </select>
            {st.height !== "auto" ? (
              <Input
                type="number"
                min={1}
                className={inputFieldCls()}
                value={typeof st.height === "number" ? st.height : 200}
                onChange={(e) => patchStyle({ height: Math.max(1, Number(e.target.value) || 200) })}
              />
            ) : null}
          </div>
        </InspectorRow>
        <InspectorRow label="Max (px)">
          <Input
            type="number"
            min={0}
            placeholder="0 = illimité"
            value={st.maxWidth || ""}
            onChange={(e) => patchStyle({ maxWidth: Number(e.target.value) || 0 })}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Min (px)">
          <Input
            type="number"
            min={0}
            value={st.minWidth || ""}
            onChange={(e) => patchStyle({ minWidth: Number(e.target.value) || 0 })}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Marge V">
          <div className="flex gap-1">
            <Input
              type="number"
              title="Haut"
              placeholder="H"
              value={st.marginTop}
              onChange={(e) => patchStyle({ marginTop: Number(e.target.value) || 0 })}
              className={inputFieldCls()}
            />
            <Input
              type="number"
              title="Bas"
              placeholder="B"
              value={st.marginBottom}
              onChange={(e) => patchStyle({ marginBottom: Number(e.target.value) || 0 })}
              className={inputFieldCls()}
            />
          </div>
        </InspectorRow>
        <InspectorRow label="Marge H">
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="G"
              value={st.marginLeft}
              onChange={(e) => patchStyle({ marginLeft: Number(e.target.value) || 0 })}
              className={inputFieldCls()}
            />
            <Input
              type="number"
              placeholder="D"
              value={st.marginRight}
              onChange={(e) => patchStyle({ marginRight: Number(e.target.value) || 0 })}
              className={inputFieldCls()}
            />
          </div>
        </InspectorRow>
        <InspectorRow label="Padding V">
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="H"
              value={st.paddingTop}
              onChange={(e) => patchStyle({ paddingTop: Number(e.target.value) || 0 })}
              className={inputFieldCls()}
            />
            <Input
              type="number"
              placeholder="B"
              value={st.paddingBottom}
              onChange={(e) => patchStyle({ paddingBottom: Number(e.target.value) || 0 })}
              className={inputFieldCls()}
            />
          </div>
        </InspectorRow>
        <InspectorRow label="Padding H">
          <div className="flex gap-1">
            <Input
              type="number"
              placeholder="G"
              value={st.paddingLeft}
              onChange={(e) => patchStyle({ paddingLeft: Number(e.target.value) || 0 })}
              className={inputFieldCls()}
            />
            <Input
              type="number"
              placeholder="D"
              value={st.paddingRight}
              onChange={(e) => patchStyle({ paddingRight: Number(e.target.value) || 0 })}
              className={inputFieldCls()}
            />
          </div>
        </InspectorRow>
        {element.type === "image" ? (
          <InspectorRow label="Image">
            <ImageExtraFields element={element} />
          </InspectorRow>
        ) : null}
      </InspectorSection>

      <InspectorSection
        title="Effets"
        icon={Sparkles}
        defaultOpen={false}
      >
        <InspectorRow label="Ombre texte">
          <Input
            placeholder="ex. 0 1px 2px rgba(0,0,0,0.1)"
            value={st.textShadow}
            onChange={(e) => patchStyle({ textShadow: e.target.value })}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Flou (filtre)">
          <Input
            type="number"
            min={0}
            max={40}
            value={st.filter.blur}
            onChange={(e) =>
              patchStyle({ filter: { ...st.filter, blur: Math.max(0, Number(e.target.value) || 0) } })
            }
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Ombre (flou)">
          <Input
            type="number"
            min={0}
            value={st.boxShadow.blur}
            onChange={(e) =>
              patchStyle({
                boxShadow: { ...st.boxShadow, blur: Math.max(0, Number(e.target.value) || 0) },
              })
            }
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Ombre Y">
          <Input
            type="number"
            value={st.boxShadow.y}
            onChange={(e) =>
              patchStyle({ boxShadow: { ...st.boxShadow, y: Number(e.target.value) || 0 } })
            }
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Couleur ombre">
          <InspectorColorPair
            colorValue={
              st.boxShadow.color?.startsWith("#") && /^#[0-9A-Fa-f]{6,8}$/.test(st.boxShadow.color)
                ? st.boxShadow.color.slice(0, 7)
                : "#000000"
            }
            onColorChange={(hex) => patchStyle({ boxShadow: { ...st.boxShadow, color: hex } })}
            textValue={st.boxShadow.color === "transparent" ? "" : st.boxShadow.color}
            onTextChange={(v) => patchStyle({ boxShadow: { ...st.boxShadow, color: v || "transparent" } })}
            textPlaceholder="rgba(...)"
            fallbackHex="#000000"
          />
        </InspectorRow>
      </InspectorSection>

      <InspectorSection title="Calque" icon={Layers} defaultOpen={false}>
        <InspectorRow label="Fond">
          <InspectorColorPair
            colorValue={
              st.backgroundColor?.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(st.backgroundColor)
                ? st.backgroundColor
                : "#ffffff"
            }
            onColorChange={(hex) => patchStyle({ backgroundColor: hex })}
            textValue={st.backgroundColor === "transparent" ? "" : st.backgroundColor}
            onTextChange={(v) => patchStyle({ backgroundColor: v || "transparent" })}
            fallbackHex="#ffffff"
          />
        </InspectorRow>
        <InspectorRow label="Rayon">
          <Input
            type="number"
            min={0}
            value={typeof st.borderRadius === "number" ? st.borderRadius : 0}
            onChange={(e) => patchStyle({ borderRadius: Math.max(0, Number(e.target.value) || 0) })}
            className={inputFieldCls()}
          />
        </InspectorRow>
      </InspectorSection>

      <InspectorSection title="Curseur" icon={MousePointer2} defaultOpen={false}>
        <InspectorRow label="Type">
          <select
            className={selectFieldCls()}
            value={st.cursor}
            onChange={(e) => patchStyle({ cursor: e.target.value as ElementStyle["cursor"] })}
          >
            <option value="default">Défaut</option>
            <option value="pointer">Pointeur</option>
            <option value="text">Texte</option>
            <option value="move">Déplacer</option>
            <option value="crosshair">Précision</option>
            <option value="not-allowed">Interdit</option>
          </select>
        </InspectorRow>
        <InspectorRow label="Débordement">
          <select
            className={selectFieldCls()}
            value={st.overflow}
            onChange={(e) => patchStyle({ overflow: e.target.value as ElementStyle["overflow"] })}
          >
            <option value="visible">Visible</option>
            <option value="hidden">Masqué</option>
            <option value="scroll">Défilement</option>
            <option value="auto">Auto</option>
          </select>
        </InspectorRow>
      </InspectorSection>

      <InspectorSection title="Transforme" icon={RotateCw} defaultOpen={false}>
        <InspectorRow label="Rotation (°)">
          <Input
            type="number"
            step={1}
            value={st.transform.rotate}
            onChange={(e) =>
              patchStyle({ transform: { ...st.transform, rotate: Number(e.target.value) || 0 } })
            }
            className={inputFieldCls()}
          />
        </InspectorRow>
      </InspectorSection>

      <InspectorSection title="Apparence" icon={Eye}>
        <InspectorRow label="Opacité">
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={st.opacity}
              onChange={(e) => patchStyle({ opacity: Number(e.target.value) })}
              className={cn(
                "h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-800 accent-[color:var(--creo-blue)]",
                "[&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-0 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-[0_1px_3px_rgba(0,0,0,0.35)]",
                "[&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-white"
              )}
            />
            <Input
              type="number"
              min={0}
              max={1}
              step={0.05}
              className={cn(inputFieldCls(), "w-14 shrink-0 px-1 text-center")}
              value={st.opacity}
              onChange={(e) =>
                patchStyle({ opacity: Math.min(1, Math.max(0, Number(e.target.value) || 0)) })
              }
            />
          </div>
        </InspectorRow>
        <InspectorRow label="Visible">
          <div className="flex justify-end gap-1">
            <button
              type="button"
              className={inspectorToggleBtn(st.opacity > 0)}
              onClick={() => patchStyle({ opacity: st.opacity > 0 ? st.opacity : 1 })}
            >
              Oui
            </button>
            <button
              type="button"
              className={inspectorToggleBtn(st.opacity === 0)}
              onClick={() => patchStyle({ opacity: 0 })}
            >
              Non
            </button>
          </div>
        </InspectorRow>
      </InspectorSection>

      {showTypography ? (
        <InspectorSection title="Texte" icon={Type}>
          <InspectorRow label="Police">
            <select
              className={selectFieldCls()}
              value={st.fontFamily}
              onChange={(e) => patchStyle({ fontFamily: e.target.value })}
            >
              {FONT_OPTIONS.map((o) => (
                <option key={o.label} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </InspectorRow>
          <InspectorRow label="Graisse">
            <select
              className={selectFieldCls()}
              value={String(st.fontWeight)}
              onChange={(e) =>
                patchStyle({ fontWeight: Number(e.target.value) as ElementStyle["fontWeight"] })
              }
            >
              {FONT_WEIGHT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </InspectorRow>
          <InspectorRow label="Style">
            <div className="flex flex-wrap items-center justify-end gap-0.5">
              <button
                type="button"
                className={alignIconBtn(st.fontWeight >= 600)}
                title="Gras"
                aria-pressed={st.fontWeight >= 600}
                onClick={() =>
                  patchStyle({ fontWeight: st.fontWeight >= 600 ? 400 : 700 })
                }
              >
                <Bold className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                className={alignIconBtn(st.fontStyle === "italic")}
                title="Italique"
                aria-pressed={st.fontStyle === "italic"}
                onClick={() =>
                  patchStyle({ fontStyle: st.fontStyle === "italic" ? "normal" : "italic" })
                }
              >
                <Italic className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                className={alignIconBtn(parseTextDecoration(st.textDecoration).underline)}
                title="Souligné"
                aria-pressed={parseTextDecoration(st.textDecoration).underline}
                onClick={() => {
                  const d = parseTextDecoration(st.textDecoration);
                  patchStyle({ textDecoration: buildTextDecoration(!d.underline, d.strike) });
                }}
              >
                <Underline className="size-4" strokeWidth={2} />
              </button>
              <button
                type="button"
                className={alignIconBtn(parseTextDecoration(st.textDecoration).strike)}
                title="Barré"
                aria-pressed={parseTextDecoration(st.textDecoration).strike}
                onClick={() => {
                  const d = parseTextDecoration(st.textDecoration);
                  patchStyle({ textDecoration: buildTextDecoration(d.underline, !d.strike) });
                }}
              >
                <Strikethrough className="size-4" strokeWidth={2} />
              </button>
            </div>
          </InspectorRow>
          <InspectorRow label="Couleur">
            <InspectorColorPair
              colorValue={colorForPicker}
              onColorChange={(hex) => patchStyle({ color: hex })}
              textValue={st.color?.startsWith("#") ? st.color : st.color || ""}
              onTextChange={(v) => patchStyle({ color: v.trim() || "#18181b" })}
              textPlaceholder="#18181b"
              fallbackHex="#18181b"
            />
          </InspectorRow>
          <InspectorRow label="Taille (px)">
            <Input
              type="number"
              min={8}
              max={120}
              value={st.fontSize}
              onChange={(e) => patchStyle({ fontSize: Number(e.target.value) || 16 })}
              className={inputFieldCls()}
            />
          </InspectorRow>
          <InspectorRow label="Interlettre (px)">
            <Input
              type="number"
              step={0.25}
              value={st.letterSpacing}
              onChange={(e) => patchStyle({ letterSpacing: Number(e.target.value) || 0 })}
              className={inputFieldCls()}
            />
          </InspectorRow>
          <InspectorRow label="Interligne">
            <Input
              type="number"
              step={0.05}
              min={0.8}
              max={3}
              value={st.lineHeight}
              onChange={(e) => patchStyle({ lineHeight: Number(e.target.value) || 1.5 })}
              className={inputFieldCls()}
            />
          </InspectorRow>
          <InspectorRow label="Casse">
            <select
              className={selectFieldCls()}
              value={st.textTransform}
              onChange={(e) => patchStyle({ textTransform: e.target.value as ElementStyle["textTransform"] })}
            >
              <option value="none">Normale</option>
              <option value="uppercase">Majuscules</option>
              <option value="lowercase">Minuscules</option>
              <option value="capitalize">Capitales</option>
            </select>
          </InspectorRow>
        </InspectorSection>
      ) : null}

      <InspectorSection title="Bordure" icon={Square} defaultOpen={false}>
        <InspectorRow label="Épaisseur">
          <Input
            type="number"
            min={0}
            value={st.border.width}
            onChange={(e) =>
              patchStyle({ border: { ...st.border, width: Math.max(0, Number(e.target.value) || 0) } })
            }
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Style">
          <select
            className={selectFieldCls()}
            value={st.border.style}
            onChange={(e) =>
              patchStyle({ border: { ...st.border, style: e.target.value as ElementStyle["border"]["style"] } })
            }
          >
            <option value="none">Aucune</option>
            <option value="solid">Plein</option>
            <option value="dashed">Tirets</option>
            <option value="dotted">Pointillés</option>
            <option value="double">Double</option>
          </select>
        </InspectorRow>
        <InspectorRow label="Couleur">
          <InspectorColorPair
            colorValue={
              st.border.color?.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(st.border.color)
                ? st.border.color
                : "#18181b"
            }
            onColorChange={(hex) => patchStyle({ border: { ...st.border, color: hex } })}
            textValue={st.border.color}
            onTextChange={(v) => patchStyle({ border: { ...st.border, color: v } })}
            fallbackHex="#18181b"
          />
        </InspectorRow>
      </InspectorSection>

      <InspectorSection title="Avancé" icon={Braces} defaultOpen={false}>
        <InspectorRow label="ID HTML">
          <Input
            value={element.customId}
            onChange={(e) => store.getState().updateElement(element.id, { customId: e.target.value })}
            className={inputFieldCls()}
          />
        </InspectorRow>
        <InspectorRow label="Classe CSS">
          <Input
            value={element.customClass}
            onChange={(e) => store.getState().updateElement(element.id, { customClass: e.target.value })}
            className={inputFieldCls()}
          />
        </InspectorRow>
      </InspectorSection>
    </div>
  );
}

function ImageExtraFields({ element }: { element: EditorElement }) {
  const store = usePageEditorStore();
  const c = element.content as { objectFit?: string };
  return (
    <select
      className={selectFieldCls()}
      value={c.objectFit ?? "cover"}
      onChange={(e) =>
        store.getState().updateElement(element.id, {
          content: { ...element.content, objectFit: e.target.value },
        })
      }
    >
      <option value="cover">Couvrir (cover)</option>
      <option value="contain">Contenir (contain)</option>
      <option value="fill">Étirer (fill)</option>
      <option value="none">Aucun</option>
    </select>
  );
}

function ElementContentSection({ element }: { element: EditorElement }) {
  const store = usePageEditorStore();

  if (element.type === "heading") {
    const text = String((element.content as { text?: string }).text ?? "");
    const tag = String((element.content as { tag?: string }).tag ?? "h1");
    return (
      <PanelSection title="Contenu" icon={Heading1}>
        <div>
          <Label>Texte</Label>
          <Input
            value={text}
            onChange={(e) =>
              store.getState().updateElement(element.id, {
                content: { ...element.content, text: e.target.value },
              })
            }
            className={inputFieldCls()}
          />
        </div>
        <div>
          <Label>Balise</Label>
          <select
            className={cn("mt-1", selectFieldCls())}
            value={tag}
            onChange={(e) =>
              store.getState().updateElement(element.id, {
                content: { ...element.content, tag: e.target.value },
              })
            }
          >
            {["h1", "h2", "h3", "h4", "h5", "h6"].map((t) => (
              <option key={t} value={t}>
                {t.toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </PanelSection>
    );
  }

  if (element.type === "text" || element.type === "richtext") {
    const html = String((element.content as { html?: string }).html ?? "");
    return (
      <PanelSection title="Contenu" icon={FileText}>
        <Textarea
          rows={8}
          value={html}
          onChange={(e) =>
            store.getState().updateElement(element.id, {
              content: { ...element.content, html: e.target.value },
            })
          }
          className={cn("font-mono text-creo-xs", textareaFieldCls())}
        />
      </PanelSection>
    );
  }

  if (element.type === "list") {
    const c = element.content as { items?: string[] };
    const lines = Array.isArray(c.items) && c.items.length ? c.items.join("\n") : "";
    return (
      <PanelSection title="Contenu" icon={ListOrdered}>
        <Label>Points (un par ligne)</Label>
        <Textarea
          rows={6}
          value={lines}
          onChange={(e) => {
            const items = e.target.value
              .split("\n")
              .map((s) => s.trim())
              .filter(Boolean);
            store.getState().updateElement(element.id, {
              content: { ...c, items: items.length ? items : [""] },
            });
          }}
          className={cn("mt-1", textareaFieldCls())}
        />
      </PanelSection>
    );
  }

  if (element.type === "link") {
    const c = element.content as { label?: string; url?: string; newTab?: boolean };
    return (
      <PanelSection title="Contenu" icon={Link2}>
        <Label>Libellé</Label>
        <Input
          value={String(c.label ?? "")}
          onChange={(e) => store.getState().updateElement(element.id, { content: { ...c, label: e.target.value } })}
          className={inputFieldCls()}
        />
        <Label className="mt-2">URL</Label>
        <Input
          value={String(c.url ?? "")}
          onChange={(e) => store.getState().updateElement(element.id, { content: { ...c, url: e.target.value } })}
          className={inputFieldCls()}
        />
        <label className="mt-2 flex items-center gap-2 text-[12px] text-zinc-500">
          <input
            type="checkbox"
            checked={Boolean(c.newTab)}
            onChange={(e) => store.getState().updateElement(element.id, { content: { ...c, newTab: e.target.checked } })}
            className={inspectorCheckboxCls()}
          />
          Nouvel onglet
        </label>
      </PanelSection>
    );
  }

  if (element.type === "contentbox") {
    const c = element.content as { headline?: string; body?: string; backgroundColor?: string };
    const bg = String(c.backgroundColor ?? "#fafafa");
    const bgHex = bg.startsWith("#") && /^#[0-9A-Fa-f]{6}$/.test(bg) ? bg : "#fafafa";
    return (
      <PanelSection title="Contenu" icon={SquareStack}>
        <Label>Titre</Label>
        <Input
          value={String(c.headline ?? "")}
          onChange={(e) => store.getState().updateElement(element.id, { content: { ...c, headline: e.target.value } })}
          className={inputFieldCls()}
        />
        <Label className="mt-2">Texte</Label>
        <Textarea
          rows={4}
          value={String(c.body ?? "")}
          onChange={(e) => store.getState().updateElement(element.id, { content: { ...c, body: e.target.value } })}
          className={inputFieldCls()}
        />
        <Label className="mt-2">Couleur de fond</Label>
        <InspectorColorPair
          colorValue={bgHex}
          onColorChange={(hex) => store.getState().updateElement(element.id, { content: { ...c, backgroundColor: hex } })}
          textValue={bg}
          onTextChange={(v) => store.getState().updateElement(element.id, { content: { ...c, backgroundColor: v } })}
          fallbackHex="#fafafa"
        />
      </PanelSection>
    );
  }

  if (element.type === "button") {
    const c = element.content as Record<string, unknown>;
    const patch = (updates: Record<string, unknown>) =>
      store.getState().updateElement(element.id, { content: { ...c, ...updates } });
    const presetKeys = Object.keys(BUTTON_PRESET_LABELS) as ButtonStylePresetId[];
    const preset = (typeof c.preset === "string" ? c.preset : "solid") as ButtonStylePresetId;
    const num = (v: unknown, fb: number) => (typeof v === "number" && !Number.isNaN(v) ? v : fb);
    const str = (v: unknown, fb: string) => (typeof v === "string" ? v : fb);

    return (
      <>
        <PanelSection title="Contenu & action" icon={MousePointer2}>
          <div className="flex flex-col gap-3.5">
            <div>
              <Label>Libellé</Label>
              <Input
                placeholder="Libellé"
                value={String(c.label ?? "")}
                onChange={(e) => patch({ label: e.target.value })}
                className={cn("mt-1", inputFieldCls())}
              />
            </div>
            <div>
              <Label>Action</Label>
              <select
                className={cn("mt-1", selectFieldCls())}
                value={String(c.action ?? "url")}
                onChange={(e) => patch({ action: e.target.value })}
              >
                <option value="url">URL</option>
                <option value="scroll">Ancre</option>
              </select>
            </div>
            <div>
              <Label>URL ou #id</Label>
              <Input
                className={cn("mt-1", inputFieldCls())}
                placeholder="URL ou #id"
                value={String(c.url ?? "")}
                onChange={(e) => patch({ url: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-creo-sm">
              <input
                type="checkbox"
                checked={Boolean(c.newTab)}
                onChange={(e) => patch({ newTab: e.target.checked })}
                className={inspectorCheckboxCls()}
              />
              Nouvel onglet
            </label>
          </div>
        </PanelSection>

        <PanelSection title="Préréglages" icon={Library}>
          <div className="grid grid-cols-2 gap-3">
            {presetKeys.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  store.getState().updateElement(element.id, {
                    content: mergeButtonPresetIntoContent(id, c),
                  })
                }
                className={cn(
                  "rounded-md border px-2.5 py-2.5 text-left text-[12px] font-semibold tracking-[-0.01em] transition-all duration-150",
                  preset === id
                    ? "border-creo-blue/55 bg-creo-blue/12 text-[color:var(--creo-blue-soft)] shadow-[inset_0_0_0_1px_rgba(0,51,255,0.15)]"
                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-900 dark:border-white/10 dark:bg-[#1a1a1a] dark:text-zinc-400 dark:hover:border-white/15 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-200"
                )}
              >
                {BUTTON_PRESET_LABELS[id]}
              </button>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Couleurs" icon={Palette}>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-zinc-500">Fond</Label>
              <InspectorColorSwatch
                value={str(c.bgColor, "#18181b").startsWith("#") ? str(c.bgColor, "#18181b") : "#18181b"}
                onChange={(hex) => patch({ bgColor: hex })}
                fallbackHex="#18181b"
                aria-label="Couleur de fond"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-zinc-500">Texte</Label>
              <InspectorColorSwatch
                value={str(c.textColor, "#ffffff").startsWith("#") ? str(c.textColor, "#ffffff") : "#ffffff"}
                onChange={(hex) => patch({ textColor: hex })}
                fallbackHex="#ffffff"
                aria-label="Couleur du texte"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-zinc-500">Survol — fond</Label>
              <InspectorColorSwatch
                value={str(c.hoverBgColor, "#27272a").startsWith("#") ? str(c.hoverBgColor, "#27272a") : "#27272a"}
                onChange={(hex) => patch({ hoverBgColor: hex })}
                fallbackHex="#27272a"
                aria-label="Couleur de fond au survol"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-medium text-zinc-500">Survol — texte</Label>
              <InspectorColorSwatch
                value={str(c.hoverTextColor, "#ffffff").startsWith("#") ? str(c.hoverTextColor, "#ffffff") : "#ffffff"}
                onChange={(hex) => patch({ hoverTextColor: hex })}
                fallbackHex="#ffffff"
                aria-label="Couleur du texte au survol"
              />
            </div>
          </div>
        </PanelSection>

        <PanelSection title="Survol & transition" icon={Zap}>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Zoom (échelle 1–1,2)</Label>
              <Input
                type="number"
                step={0.01}
                min={1}
                max={1.2}
                value={num(c.hoverScale, 1.03)}
                onChange={(e) => patch({ hoverScale: Number(e.target.value) || 1 })}
                className={inputFieldCls()}
              />
            </div>
            <div>
              <Label>Durée (ms)</Label>
              <Input
                type="number"
                min={0}
                max={2000}
                value={num(c.transitionMs, 200)}
                onChange={(e) => patch({ transitionMs: Number(e.target.value) || 200 })}
                className={inputFieldCls()}
              />
            </div>
          </div>
        </PanelSection>

        <PanelSection title="Contours & biseau" icon={BoxSelect}>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <Label className="text-[10px]">Haut px</Label>
              <Input
                type="number"
                min={0}
                value={num(c.borderTopWidth, 0)}
                onChange={(e) => patch({ borderTopWidth: Number(e.target.value) || 0 })}
                className={inputFieldCls()}
              />
            </div>
            <div>
              <Label className="text-[10px]">Bas px</Label>
              <Input
                type="number"
                min={0}
                value={num(c.borderBottomWidth, 0)}
                onChange={(e) => patch({ borderBottomWidth: Number(e.target.value) || 0 })}
                className={inputFieldCls()}
              />
            </div>
            <div>
              <Label className="text-[10px]">Gauche px</Label>
              <Input
                type="number"
                min={0}
                value={num(c.borderLeftWidth, 0)}
                onChange={(e) => patch({ borderLeftWidth: Number(e.target.value) || 0 })}
                className={inputFieldCls()}
              />
            </div>
            <div>
              <Label className="text-[10px]">Droite px</Label>
              <Input
                type="number"
                min={0}
                value={num(c.borderRightWidth, 0)}
                onChange={(e) => patch({ borderRightWidth: Number(e.target.value) || 0 })}
                className={inputFieldCls()}
              />
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-zinc-500">Bordure</Label>
              <InspectorColorSwatch
                value={str(c.borderColor, "#18181b").startsWith("#") ? str(c.borderColor, "#18181b") : "#18181b"}
                onChange={(hex) => patch({ borderColor: hex })}
                fallbackHex="#18181b"
                aria-label="Couleur bordure"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-zinc-500">Bord haut</Label>
              <InspectorColorSwatch
                value={str(c.borderTopColor, "#18181b").startsWith("#") ? str(c.borderTopColor, "#18181b") : "#18181b"}
                onChange={(hex) => patch({ borderTopColor: hex })}
                fallbackHex="#18181b"
                aria-label="Couleur bord haut"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-medium text-zinc-500">Bord bas</Label>
              <InspectorColorSwatch
                value={str(c.borderBottomColor, "#18181b").startsWith("#") ? str(c.borderBottomColor, "#18181b") : "#18181b"}
                onChange={(hex) => patch({ borderBottomColor: hex })}
                fallbackHex="#18181b"
                aria-label="Couleur bord bas"
              />
            </div>
          </div>
          <div className="mt-2 grid gap-2">
            <div>
              <Label className="text-creo-xs">Reflet biseau (haut)</Label>
              <Input
                className={inputFieldCls()}
                placeholder="rgba(255,255,255,0.12)"
                value={str(c.bevelHighlight, "rgba(255,255,255,0.12)")}
                onChange={(e) => patch({ bevelHighlight: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-creo-xs">Ombre biseau (bas)</Label>
              <Input
                className={inputFieldCls()}
                placeholder="rgba(0,0,0,0.25)"
                value={str(c.bevelShadow, "rgba(0,0,0,0.25)")}
                onChange={(e) => patch({ bevelShadow: e.target.value })}
              />
            </div>
          </div>
        </PanelSection>
      </>
    );
  }

  if (element.type === "image") {
    const c = element.content as { src?: string; alt?: string };
    return (
      <PanelSection title="Contenu" icon={Image}>
        <Label>URL</Label>
        <Input
          value={String(c.src ?? "")}
          onChange={(e) => store.getState().updateElement(element.id, { content: { ...c, src: e.target.value } })}
          className={inputFieldCls()}
        />
        <Label className="mt-2">Alt</Label>
        <Input
          value={String(c.alt ?? "")}
          onChange={(e) => store.getState().updateElement(element.id, { content: { ...c, alt: e.target.value } })}
          className={inputFieldCls()}
        />
      </PanelSection>
    );
  }

  if (element.type === "video") {
    const c = element.content as { url?: string };
    return (
      <PanelSection title="Contenu" icon={Video}>
        <Label>URL YouTube</Label>
        <Input
          value={String(c.url ?? "")}
          onChange={(e) => store.getState().updateElement(element.id, { content: { ...c, url: e.target.value } })}
          className={inputFieldCls()}
        />
      </PanelSection>
    );
  }

  if (element.type === "countdown") {
    const c = element.content as { endAt?: string };
    const endAt = typeof c.endAt === "string" ? c.endAt : "";
    const parsed = endAt ? new Date(endAt) : null;
    const readable =
      parsed && !Number.isNaN(parsed.getTime())
        ? parsed.toLocaleString("fr-FR", { dateStyle: "full", timeStyle: "short" })
        : null;
    return (
      <PanelSection title="Compte à rebours" icon={Timer}>
        <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-white/10 dark:bg-zinc-900/80">
          <div className="mb-3 flex items-center gap-2.5">
            <Calendar
              className="size-[15px] shrink-0 text-zinc-500 dark:text-zinc-500"
              strokeWidth={2}
              aria-hidden
            />
            <span className="text-[13px] font-semibold leading-tight text-zinc-900 dark:text-white">
              Date et heure de fin
            </span>
          </div>
          <Input
            id={`cd-end-${element.id}`}
            type="datetime-local"
            value={toDatetimeLocal(endAt)}
            onChange={(e) => {
              const v = e.target.value;
              store.getState().updateElement(element.id, {
                content: { ...c, endAt: v ? new Date(v).toISOString() : "" },
              });
            }}
            className={cn(inputFieldCls(), "h-9 font-medium")}
          />
        </div>
        {readable ? (
          <p className="mt-4 flex items-center gap-2 text-[12px] leading-snug text-zinc-600 dark:text-zinc-400">
            <Clock className="size-3.5 shrink-0 text-zinc-400 dark:text-zinc-500" strokeWidth={2} aria-hidden />
            <span>{readable}</span>
          </p>
        ) : (
          <p className="mt-4 text-[12px] leading-snug text-amber-800 dark:text-amber-200/85">
            Sélectionne une date pour activer le décompte.
          </p>
        )}
      </PanelSection>
    );
  }

  if (element.type === "optin") {
    const c = element.content as { intro?: string; buttonLabel?: string };
    return (
      <PanelSection title="Contenu" icon={Mail}>
        <Label>Texte</Label>
        <Textarea
          rows={3}
          value={String(c.intro ?? "")}
          onChange={(e) =>
            store.getState().updateElement(element.id, { content: { ...c, intro: e.target.value } })
          }
          className={inputFieldCls()}
        />
        <Label className="mt-2">Bouton</Label>
        <Input
          value={String(c.buttonLabel ?? "")}
          onChange={(e) =>
            store.getState().updateElement(element.id, { content: { ...c, buttonLabel: e.target.value } })
          }
          className={inputFieldCls()}
        />
      </PanelSection>
    );
  }

  if (element.type === "faq") {
    const c = element.content as { items?: { q: string; a: string }[] };
    const items = Array.isArray(c.items) && c.items.length ? c.items : [{ q: "", a: "" }];
    const first = items[0]!;
    return (
      <PanelSection title="Contenu" icon={HelpCircle}>
        <Label>Question</Label>
        <Input
          value={first.q}
          onChange={(e) => {
            const next = [{ ...first, q: e.target.value }, ...items.slice(1)];
            store.getState().updateElement(element.id, { content: { ...c, items: next } });
          }}
          className={inputFieldCls()}
        />
        <Label className="mt-2">Réponse</Label>
        <Textarea
          rows={4}
          value={first.a}
          onChange={(e) => {
            const next = [{ ...first, a: e.target.value }, ...items.slice(1)];
            store.getState().updateElement(element.id, { content: { ...c, items: next } });
          }}
          className={inputFieldCls()}
        />
      </PanelSection>
    );
  }

  return null;
}
