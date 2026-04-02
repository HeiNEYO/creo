"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
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
  primary: "#0033ff",
};

function readChartColors(): ChartColors {
  if (typeof document === "undefined") return FALLBACK;
  const s = getComputedStyle(document.documentElement);
  const grid = s.getPropertyValue("--creo-gray-200").trim();
  const tick = s.getPropertyValue("--creo-gray-500").trim();
  const card = s.getPropertyValue("--card").trim();
  const fg = s.getPropertyValue("--foreground").trim();
  const primary = s.getPropertyValue("--primary").trim();
  return {
    grid: grid || FALLBACK.grid,
    tick: tick || FALLBACK.tick,
    tooltipBorder: grid || FALLBACK.tooltipBorder,
    tooltipBg: card || FALLBACK.tooltipBg,
    tooltipFg: fg || FALLBACK.tooltipFg,
    primary: primary || FALLBACK.primary,
  };
}

export function RevenueChart() {
  const [mounted, setMounted] = useState(false);
  const [colors, setColors] = useState<ChartColors>(FALLBACK);

  useEffect(() => {
    setMounted(true);
    const root = document.documentElement;
    const sync = () => setColors(readChartColors());
    sync();
    const obs = new MutationObserver(sync);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  if (!mounted) {
    return (
      <div
        className="h-[260px] w-full animate-pulse rounded-md bg-creo-gray-100"
        aria-hidden
      />
    );
  }

  return (
    <div className="w-full min-w-0 overflow-x-auto">
      <AreaChart
        width={CHART_W}
        height={CHART_H}
        data={data}
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <defs>
          <linearGradient id="creoRev" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={colors.primary}
              stopOpacity={0.35}
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
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: colors.tick, fontSize: 11 }}
          tickFormatter={(v) => `${v >= 1000 ? `${v / 1000}k` : v}`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: `1px solid ${colors.tooltipBorder}`,
            fontSize: 13,
            backgroundColor: colors.tooltipBg,
            color: colors.tooltipFg,
          }}
          labelStyle={{ color: colors.tooltipFg }}
          formatter={(value) => [
            `${Number(value ?? 0).toLocaleString("fr-FR")} €`,
            "CA",
          ]}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke={colors.primary}
          strokeWidth={2}
          fill="url(#creoRev)"
        />
      </AreaChart>
    </div>
  );
}
