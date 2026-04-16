"use client";

import { createPortal } from "react-dom";
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEventHandler,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { Circle, Contrast, ImageIcon, Minus, Pipette, Square, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  buildConicGradient,
  buildLinearGradient,
  buildRadialGradient,
  clamp,
  detectFillKind,
  hexDisplay,
  hexToRgb,
  hsvToRgb,
  parseLinearGradient,
  parseSolidToHsvAlpha,
  previewBackgroundCss,
  rgbToHex,
  rgbToHsv,
  solidToCss,
  type FillKind,
} from "@/lib/builder/inspector-fill-color";

const HUE_BG =
  "linear-gradient(to right,#f00 0%,#ff0 17%,#0f0 33%,#0ff 50%,#00f 67%,#f0f 83%,#f00 100%)";

function stopToHex(s: string, fallback: string): string {
  const t = s.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t;
  const rgb = hexToRgb(t);
  if (rgb) return rgbToHex(rgb.r, rgb.g, rgb.b);
  return fallback;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  fallbackHex?: string;
  title?: string;
  /** Blur du déclencheur (bouton) ; compatible avec les handlers RHF typés sur input. */
  onBlur?: FocusEventHandler<Element>;
};

export const InspectorFillPair = forwardRef<HTMLButtonElement, Props>(function InspectorFillPair(
  { value, onChange, fallbackHex = "#000000", title = "Remplissage", onBlur },
  ref
) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const setRefs = useCallback(
    (el: HTMLButtonElement | null) => {
      triggerRef.current = el;
      if (typeof ref === "function") ref(el);
      else if (ref) (ref as MutableRefObject<HTMLButtonElement | null>).current = el;
    },
    [ref]
  );

  const openAt = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const w = 300;
    const left = clamp(r.left, 8, typeof window !== "undefined" ? window.innerWidth - w - 8 : r.left);
    setPos({ top: r.bottom + 6, left });
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const display = hexDisplay(value, fallbackHex);
  const isClear = !value.trim() || value.trim() === "transparent";
  const swatchBg = isClear
    ? undefined
    : previewBackgroundCss(value, fallbackHex);

  return (
    <>
      <button
        ref={setRefs}
        type="button"
        className={cn(
          "flex h-9 w-full min-w-0 max-w-full items-center gap-2 rounded-creo-md border border-zinc-200/90 bg-zinc-100/90 px-2.5 py-1.5 text-left transition-[border-color,box-shadow] hover:border-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-creo-blue/35 dark:border-zinc-700 dark:bg-zinc-800/90 dark:hover:border-zinc-600"
        )}
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => (open ? setOpen(false) : openAt())}
        onBlur={onBlur}
      >
        <span
          className="size-5 shrink-0 rounded-md border border-zinc-300/90 shadow-inner dark:border-zinc-600"
          style={
            isClear
              ? {
                  backgroundImage:
                    "linear-gradient(45deg,#d4d4d8 25%,transparent 25%,transparent 75%,#d4d4d8 75%),linear-gradient(45deg,#d4d4d8 25%,transparent 25%,transparent 75%,#d4d4d8 75%)",
                  backgroundSize: "6px 6px",
                  backgroundPosition: "0 0, 3px 3px",
                }
              : value.trim().startsWith("url(") || /gradient/i.test(value)
                ? { backgroundImage: swatchBg, backgroundSize: "cover", backgroundPosition: "center" }
                : { backgroundColor: swatchBg }
          }
        />
        <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-medium tabular-nums text-zinc-800 dark:text-zinc-200">
          {display}
        </span>
        <span
          role="button"
          tabIndex={-1}
          className="flex size-6 shrink-0 items-center justify-center rounded-md text-zinc-400 transition-colors hover:bg-zinc-200/80 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-200"
          onClick={(e) => {
            e.stopPropagation();
            onChange("transparent");
          }}
          title="Effacer"
        >
          <X className="size-3.5" strokeWidth={2} />
        </span>
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <>
              <button
                type="button"
                className="fixed inset-0 z-[90] cursor-default bg-black/20 dark:bg-black/40"
                aria-label="Fermer"
                onClick={() => setOpen(false)}
              />
              <div
                className="fixed z-[100] w-[min(300px,calc(100vw-16px))] rounded-creo-lg border border-zinc-200/95 bg-white p-3 shadow-[var(--creo-shadow-modal)] dark:border-zinc-700 dark:bg-zinc-900"
                style={{ top: pos.top, left: pos.left }}
                role="dialog"
                aria-label={title}
              >
                <FillPanelContent
                  value={value}
                  onChange={onChange}
                  fallbackHex={fallbackHex}
                  title={title}
                  onClose={() => setOpen(false)}
                />
              </div>
            </>,
            document.body
          )
        : null}
    </>
  );
});

function FillPanelContent({
  value,
  onChange,
  fallbackHex = "#000000",
  title,
  onClose,
}: Props & { onClose: () => void }) {
  const uid = useId();
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const [kind, setKind] = useState<FillKind>(() => detectFillKind(value));

  const [h, setH] = useState(0);
  const [s, setS] = useState(0);
  const [v, setV] = useState(0);
  const [a, setA] = useState(1);
  const [hexInput, setHexInput] = useState("000000");
  const [opacityPct, setOpacityPct] = useState(100);

  const [linAngle, setLinAngle] = useState(90);
  const [g1, setG1] = useState("#000000");
  const [g2, setG2] = useState("#ffffff");
  const [imageUrl, setImageUrl] = useState("");

  const svRef = useRef<HTMLDivElement>(null);
  const skipPush = useRef(false);

  const hydrateFromValue = useCallback(() => {
    skipPush.current = true;
    const k = detectFillKind(value);
    setKind(k);
    if (k === "solid") {
      const p = parseSolidToHsvAlpha(value, fallbackHex);
      setH(p.h);
      setS(p.s);
      setV(p.v);
      setA(p.a);
      const { r, g, b } = hsvToRgb(p.h, p.s, p.v);
      setHexInput(rgbToHex(r, g, b).slice(1).toUpperCase());
      setOpacityPct(Math.round(p.a * 100));
    } else if (k === "linear") {
      const p = parseLinearGradient(value);
      if (p) {
        setLinAngle(p.angle);
        setG1(stopToHex(p.c1, "#000000"));
        setG2(stopToHex(p.c2, "#ffffff"));
      }
    } else if (k === "radial" || k === "conic") {
      const inner = value.replace(/^(radial|conic)-gradient\s*\(/i, "").replace(/\)\s*$/, "");
      const stops = inner.split(",").map((x) => x.trim());
      if (stops.length >= 2) {
        setG1(stopToHex(stops[0].replace(/\s+\d+%$/, "").trim(), "#000000"));
        setG2(stopToHex(stops[stops.length - 1].replace(/\s+\d+%$/, "").trim(), "#ffffff"));
      }
    } else if (k === "image") {
      const m = value.match(/url\s*\(\s*["']?([^)"']+)["']?\s*\)/i);
      setImageUrl(m?.[1]?.trim() ?? "");
    }
    queueMicrotask(() => {
      skipPush.current = false;
    });
  }, [value, fallbackHex]);

  useEffect(() => {
    hydrateFromValue();
  }, [hydrateFromValue]);

  useEffect(() => {
    if (skipPush.current || kind === "image") return;
    let next: string;
    if (kind === "solid") next = solidToCss(h, s, v, a);
    else if (kind === "linear") next = buildLinearGradient(linAngle, g1, g2);
    else if (kind === "radial") next = buildRadialGradient(g1, g2);
    else next = buildConicGradient(g1, g2);
    if (next.trim() === value.trim()) return;
    onChangeRef.current(next);
  }, [kind, h, s, v, a, linAngle, g1, g2, value]);

  useEffect(() => {
    if (kind !== "solid" || skipPush.current) return;
    const { r, g, b } = hsvToRgb(h, s, v);
    setHexInput(rgbToHex(r, g, b).slice(1).toUpperCase());
    setOpacityPct(Math.round(a * 100));
  }, [kind, h, s, v, a]);

  const pickSv = useCallback((clientX: number, clientY: number) => {
    const el = svRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = clamp((clientX - r.left) / r.width, 0, 1);
    const y = clamp((clientY - r.top) / r.height, 0, 1);
    setS(x);
    setV(1 - y);
  }, []);

  const onSvPointer = (e: React.PointerEvent) => {
    if (e.buttons !== 1 && e.type !== "pointerdown") return;
    pickSv(e.clientX, e.clientY);
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const applyHexFromInput = () => {
    const raw = hexInput.replace(/^#/, "").trim();
    if (!/^[0-9A-Fa-f]{6}$/.test(raw)) return;
    const rgb = hexToRgb(`#${raw}`);
    if (!rgb) return;
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    setH(hsv.h);
    setS(hsv.s);
    setV(hsv.v);
  };

  const eyedropper = async () => {
    try {
      const E = (window as unknown as { EyeDropper?: new () => { open: () => Promise<{ sRGBHex: string }> } })
        .EyeDropper;
      if (!E) return;
      const ed = new E();
      const r = await ed.open();
      if (r?.sRGBHex) {
        const rgb = hexToRgb(r.sRGBHex);
        if (rgb) {
          const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
          setKind("solid");
          setH(hsv.h);
          setS(hsv.s);
          setV(hsv.v);
          setHexInput(rgbToHex(rgb.r, rgb.g, rgb.b).slice(1).toUpperCase());
        }
      }
    } catch {
      /* annulé */
    }
  };

  const kindBtn = (k: FillKind, icon: ReactNode, label: string) => (
    <button
      key={k}
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={kind === k}
      className={cn(
        "flex size-8 items-center justify-center rounded-creo-sm border-0 bg-transparent text-zinc-500 transition-colors dark:text-zinc-400",
        kind === k
          ? "bg-zinc-200 text-creo-blue dark:bg-zinc-800 dark:text-creo-blue-soft"
          : "hover:bg-zinc-100 hover:text-zinc-800 dark:hover:bg-zinc-800/80 dark:hover:text-zinc-200"
      )}
      onClick={() => setKind(k)}
    >
      {icon}
    </button>
  );

  const solidRgb = solidToCss(h, s, v, 1);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-100">{title}</p>
        <button
          type="button"
          className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800 dark:hover:text-zinc-200"
          aria-label="Fermer"
          onClick={onClose}
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex items-center justify-center gap-0.5 rounded-creo-md bg-zinc-100/90 p-1 dark:bg-zinc-800/90">
        {kindBtn("solid", <Square className="size-3.5" strokeWidth={2} />, "Uni")}
        {kindBtn("linear", <Minus className="size-3.5 rotate-90" strokeWidth={2} />, "Dégradé linéaire")}
        {kindBtn("radial", <Circle className="size-3.5" strokeWidth={2} />, "Dégradé radial")}
        {kindBtn("conic", <Contrast className="size-3.5" strokeWidth={2} />, "Dégradé conique")}
        {kindBtn("image", <ImageIcon className="size-3.5" strokeWidth={2} />, "Image")}
      </div>

      {kind === "solid" ? (
        <>
          <div
            ref={svRef}
            className="relative h-36 w-full cursor-crosshair rounded-creo-md border border-zinc-200/80 touch-none dark:border-zinc-600"
            style={{
              background: `
                linear-gradient(to top, #000, transparent),
                linear-gradient(to right, #fff, hsl(${h}, 100%, 50%))
              `,
            }}
            onPointerDown={onSvPointer}
            onPointerMove={(e) => e.buttons === 1 && pickSv(e.clientX, e.clientY)}
          >
            <span
              className="pointer-events-none absolute size-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md"
              style={{
                left: `${s * 100}%`,
                top: `${(1 - v) * 100}%`,
              }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="sr-only" htmlFor={`${uid}-hue`}>
              Teinte
            </label>
            <input
              id={`${uid}-hue`}
              type="range"
              min={0}
              max={360}
              step={1}
              value={h}
              onChange={(e) => setH(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full accent-creo-blue dark:accent-creo-blue-soft"
              style={{ background: HUE_BG }}
            />
            <div
              className="relative h-2 w-full overflow-hidden rounded-full border border-zinc-200/80 dark:border-zinc-600"
              style={{
                backgroundImage: `repeating-conic-gradient(#d4d4d8 0% 25%, #fafafa 0% 50%) 0/10px 10px, linear-gradient(to right, transparent, ${solidRgb})`,
              }}
            >
              <label className="sr-only" htmlFor={`${uid}-alpha`}>
                Opacité
              </label>
              <input
                id={`${uid}-alpha`}
                type="range"
                min={0}
                max={100}
                value={Math.round(a * 100)}
                onChange={(e) => setA(Number(e.target.value) / 100)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div
                className="pointer-events-none absolute inset-y-0 w-0.5 bg-white shadow"
                style={{ left: `${a * 100}%`, transform: "translateX(-50%)" }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                HEX
              </label>
              <Input
                className="h-8 border-zinc-200 bg-zinc-50 font-mono text-[11px] dark:border-zinc-700 dark:bg-zinc-800"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value.replace(/[^0-9A-Fa-f]/g, "").slice(0, 6))}
                onBlur={applyHexFromInput}
                onKeyDown={(e) => e.key === "Enter" && applyHexFromInput()}
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Opacité
              </label>
              <Input
                className="h-8 border-zinc-200 bg-zinc-50 font-mono text-[11px] dark:border-zinc-700 dark:bg-zinc-800"
                value={`${opacityPct}%`}
                onChange={(e) => {
                  const n = parseInt(e.target.value.replace(/%/g, ""), 10);
                  if (!Number.isNaN(n)) {
                    const c = clamp(n, 0, 100);
                    setOpacityPct(c);
                    setA(c / 100);
                  }
                }}
                onBlur={() => setOpacityPct(Math.round(a * 100))}
              />
            </div>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <div>
              <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Format
              </label>
              <div className="flex h-8 items-center rounded-md border border-zinc-200 bg-zinc-50 px-2 text-[11px] text-zinc-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                HEX
              </div>
            </div>
            <div className="flex flex-col justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-10 border-zinc-200 p-0 dark:border-zinc-700"
                title="Pipette (navigateur récent)"
                onClick={() => void eyedropper()}
              >
                <Pipette className="size-4" />
              </Button>
            </div>
          </div>
        </>
      ) : null}

      {kind === "linear" ? (
        <div className="space-y-2">
          <label className="text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Angle (°)
          </label>
          <input
            type="range"
            min={0}
            max={360}
            value={linAngle}
            onChange={(e) => setLinAngle(Number(e.target.value))}
            className="h-2 w-full cursor-pointer accent-creo-blue dark:accent-creo-blue-soft"
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <span className="mb-1 block text-[10px] text-zinc-500 dark:text-zinc-400">Début</span>
              <input
                type="color"
                value={/^#[0-9A-Fa-f]{6}$/.test(g1) ? g1 : "#000000"}
                onChange={(e) => setG1(e.target.value)}
                className="h-8 w-full cursor-pointer rounded-md border border-zinc-200 dark:border-zinc-600"
              />
            </div>
            <div>
              <span className="mb-1 block text-[10px] text-zinc-500 dark:text-zinc-400">Fin</span>
              <input
                type="color"
                value={/^#[0-9A-Fa-f]{6}$/.test(g2) ? g2 : "#ffffff"}
                onChange={(e) => setG2(e.target.value)}
                className="h-8 w-full cursor-pointer rounded-md border border-zinc-200 dark:border-zinc-600"
              />
            </div>
          </div>
        </div>
      ) : null}

      {kind === "radial" || kind === "conic" ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <span className="mb-1 block text-[10px] text-zinc-500 dark:text-zinc-400">Centre</span>
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(g1) ? g1 : "#000000"}
              onChange={(e) => setG1(e.target.value)}
              className="h-8 w-full cursor-pointer rounded-md border border-zinc-200 dark:border-zinc-600"
            />
          </div>
          <div>
            <span className="mb-1 block text-[10px] text-zinc-500 dark:text-zinc-400">Bord</span>
            <input
              type="color"
              value={/^#[0-9A-Fa-f]{6}$/.test(g2) ? g2 : "#ffffff"}
              onChange={(e) => setG2(e.target.value)}
              className="h-8 w-full cursor-pointer rounded-md border border-zinc-200 dark:border-zinc-600"
            />
          </div>
        </div>
      ) : null}

      {kind === "image" ? (
        <div>
          <label className="mb-1 block text-[10px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            URL de l’image
          </label>
          <Input
            className="h-8 border-zinc-200 bg-zinc-50 text-[11px] dark:border-zinc-700 dark:bg-zinc-800"
            placeholder="https://…"
            value={imageUrl}
            onChange={(e) => {
              const u = e.target.value;
              setImageUrl(u);
              skipPush.current = true;
              onChangeRef.current(u.trim() ? `url("${u.trim()}")` : "transparent");
              queueMicrotask(() => {
                skipPush.current = false;
              });
            }}
          />
        </div>
      ) : null}

      <Button
        type="button"
        variant="outline"
        className="h-9 w-full border-zinc-200 text-[11px] font-medium dark:border-zinc-700"
        onClick={() => {
          const p = parseSolidToHsvAlpha(fallbackHex, fallbackHex);
          setKind("solid");
          setH(p.h);
          setS(p.s);
          setV(p.v);
          setA(p.a);
          const { r, g, b } = hsvToRgb(p.h, p.s, p.v);
          setHexInput(rgbToHex(r, g, b).slice(1).toUpperCase());
          setOpacityPct(Math.round(p.a * 100));
          onChangeRef.current(fallbackHex);
        }}
      >
        Réinitialiser
      </Button>
    </div>
  );
}
