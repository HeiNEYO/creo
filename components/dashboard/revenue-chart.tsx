"use client";

import { useEffect, useId, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

type ChartRow = { d: string; v: number; prevV?: number };

const data: ChartRow[] = [
  { d: "Lun", v: 2100 },
  { d: "Mar", v: 2800 },
  { d: "Mer", v: 2400 },
  { d: "Jeu", v: 3200 },
  { d: "Ven", v: 3800 },
  { d: "Sam", v: 2900 },
  { d: "Dim", v: 3500 },
];

/** Largeur fixe pour éviter ResponsiveContainer (mesures -1 / hydratation fragile). */
const CHART_W = 640;
const CHART_H = 260;

type ChartColors = {
  grid: string;
  tick: string;
  tooltipBorder: string;
  tooltipBg: string;
  tooltipFg: string;
  primary: string;
};

const FALLBACK: ChartColors = {
  grid: "#e4e4e7",
  tick: "#71717a",
  tooltipBorder: "#e4e4e7",
  tooltipBg: "#ffffff",
  tooltipFg: "#0b0b0b",
  primary: "#2563eb",
};

/** Palette fixe pour dashboard type Shopify / Stripe (bleu sobre). */
const LIGHT_SURFACE: ChartColors = {
  grid: "#e3e5e8",
  tick: "#616161",
  tooltipBorder: "#e3e5e8",
  tooltipBg: "#ffffff",
  tooltipFg: "#202223",
  primary: "#2563eb",
};

function readChartColors(): ChartColors {
  if (typeof document === "undefined") return FALLBACK;
  const s = getComputedStyle(document.documentElement);
  const grid = s.getPropertyValue("--creo-gray-200").trim();
  const tick = s.getPropertyValue("--creo-gray-500").trim();
  const card = s.getPropertyValue("--card").trim();
  const fg = s.getPropertyValue("--foreground").trim();
  /** Lisible en clair (#0033ff) et en sombre (#93a8ff via --creo-blue-readable). */
  const primary =
    s.getPropertyValue("--creo-blue-readable").trim() ||
    s.getPropertyValue("--primary").trim();
  return {
    grid: grid || FALLBACK.grid,
    tick: tick || FALLBACK.tick,
    tooltipBorder: grid || FALLBACK.tooltipBorder,
    tooltipBg: card || FALLBACK.tooltipBg,
    tooltipFg: fg || FALLBACK.tooltipFg,
    primary: primary || FALLBACK.primary,
  };
}

type RevenueChartProps = {
  /** `light` = couleurs type admin clair (ignore le thème global). */
  appearance?: "auto" | "light";
  /**
   * Points à tracer. Si omis, courbe de démonstration (compat).
   * Tableau vide = état vide (pas de démo).
   */
  series?: { d: string; v: number; prevV?: number }[] | null;
  dataLabel?: string;
  /** Libellé série comparaison (tooltip). */
  comparisonLabel?: string;
  valueSuffix?: string;
  /** Affiche les valeurs entières (ex. vues) au lieu du format monétaire. */
  valueIsInteger?: boolean;
  /** Message sous le graphique vide. */
  emptyLabel?: string;
  /** Courbes lissées (monotone) — laisser `false` par défaut pour les autres écrans. */
  smoothCurve?: boolean;
  /** Remplit la largeur du parent (conteneur responsive) au lieu d’une largeur fixe. */
  fullWidth?: boolean;
};

export function RevenueChart({
  appearance = "auto",
  series,
  dataLabel = "CA",
  comparisonLabel = "Période préc.",
  valueSuffix = " €",
  valueIsInteger = false,
  emptyLabel = "Aucune donnée sur la période.",
  smoothCurve = false,
  fullWidth = false,
}: RevenueChartProps) {
  const gradId = useId().replace(/:/g, "");
  const [mounted, setMounted] = useState(false);
  const [colors, setColors] = useState<ChartColors>(
    appearance === "light" ? LIGHT_SURFACE : FALLBACK
  );

  useEffect(() => {
    setMounted(true);
    if (appearance === "light") {
      setColors(LIGHT_SURFACE);
      return;
    }
    const root = document.documentElement;
    const sync = () => setColors(readChartColors());
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, [appearance]);

  const useDemoFallback = series === undefined;
  const chartData: ChartRow[] = useDemoFallback ? data : (series ?? []);
  const showComparison =
    chartData.length > 0 &&
    chartData.some((row) => typeof row.prevV === "number");

  /**
   * `linear` = segments droits (défaut ailleurs). `monotone` = angles adoucis, sans activer
   * les splines « natural » qui peuvent passer sous l’axe.
   */
  const curveType = smoothCurve ? ("monotone" as const) : ("linear" as const);

  if (!mounted) {
    return (
      <div
        className={cn(
          "h-[260px] w-full animate-pulse rounded-[var(--creo-dashboard-card-radius)]",
          appearance === "light" ? "bg-[#ebebeb]" : "bg-creo-gray-100"
        )}
        aria-hidden
      />
    );
  }

  if (chartData.length === 0 && !useDemoFallback) {
    return (
      <div
        className={cn(
          "flex h-[260px] w-full items-center justify-center rounded-[var(--creo-dashboard-card-radius)] border border-dashed border-[#e3e5e8] text-[13px] text-[#8c9196] dark:border-[var(--creo-dashboard-border)] dark:text-creo-gray-500",
        )}
      >
        {emptyLabel}
      </div>
    );
  }

  const chartMargin = fullWidth
    ? { top: 8, right: 4, left: 0, bottom: 4 }
    : { top: 8, right: 8, left: -16, bottom: 0 };

  const chartBody = (
    <AreaChart
      width={fullWidth ? undefined : CHART_W}
      height={fullWidth ? undefined : CHART_H}
      data={chartData}
      margin={chartMargin}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={colors.primary}
            stopOpacity={0.28}
          />
          <stop
            offset="100%"
            stopColor={colors.primary}
            stopOpacity={0}
          />
        </linearGradient>
      </defs>
      <CartesianGrid
        strokeDasharray="3 3"
        stroke={colors.grid}
        vertical={false}
      />
      <XAxis
        dataKey="d"
        axisLine={false}
        tickLine={false}
        tick={{ fill: colors.tick, fontSize: 11 }}
        interval="preserveStartEnd"
        minTickGap={8}
      />
      <YAxis
        domain={[0, "auto"]}
        allowDataOverflow={false}
        width={fullWidth ? 36 : undefined}
        axisLine={false}
        tickLine={false}
        tick={{ fill: colors.tick, fontSize: 11 }}
        tickFormatter={(v) =>
          valueIsInteger
            ? `${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`
            : `${v >= 1000 ? `${v / 1000}k` : v}`
        }
      />
      <Tooltip
        contentStyle={{
          borderRadius: 12,
          border: `1px solid ${colors.tooltipBorder}`,
          fontSize: 13,
          backgroundColor: colors.tooltipBg,
          color: colors.tooltipFg,
        }}
        labelStyle={{ color: colors.tooltipFg }}
        formatter={(value, name) => [
          `${Number(value ?? 0).toLocaleString("fr-FR")}${valueSuffix}`,
          String(name),
        ]}
      />
      <Area
        type={curveType}
        dataKey="v"
        name={dataLabel}
        stroke={colors.primary}
        strokeWidth={2}
        fill={`url(#${gradId})`}
        connectNulls
      />
      {showComparison ? (
        <Line
          type={curveType}
          dataKey="prevV"
          stroke={appearance === "light" ? "#9ca3af" : colors.tick}
          strokeWidth={1.5}
          strokeDasharray="5 4"
          dot={false}
          isAnimationActive={false}
          name={comparisonLabel}
        />
      ) : null}
    </AreaChart>
  );

  if (fullWidth) {
    return (
      <div className="h-[260px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          {chartBody}
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      {chartBody}
    </div>
  );
}
