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

export function RevenueChart() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
            <stop offset="0%" stopColor="#0033ff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#0033ff" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis
          dataKey="d"
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#71717a", fontSize: 11 }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: "#71717a", fontSize: 11 }}
          tickFormatter={(v) => `${v >= 1000 ? `${v / 1000}k` : v}`}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #e4e4e7",
            fontSize: 13,
          }}
          formatter={(value) => [
            `${Number(value ?? 0).toLocaleString("fr-FR")} €`,
            "CA",
          ]}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke="#0033ff"
          strokeWidth={2}
          fill="url(#creoRev)"
        />
      </AreaChart>
    </div>
  );
}
