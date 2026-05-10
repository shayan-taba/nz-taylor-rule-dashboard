"use client";
import {
  ComposedChart, Area, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useChartData } from "../../hooks/useChartData";
import { ChartTooltip } from "../ui/Tooltip";

function tickFilter(data: { label: string }[], maxTicks = 12) {
  if (data.length <= maxTicks) return (v: string) => v;
  const step = Math.ceil(data.length / maxTicks);
  return (_: string, i: number) => (i % step === 0 ? data[i]?.label ?? "" : "");
}

export function DeviationChart() {
  const data      = useChartData();
  const formatter = tickFilter(data);

  // Split into hawkish (positive) and dovish (negative) for dual colouring
  const enriched = data.map((row) => ({
    ...row,
    devPositive: row.deviation !== null && row.deviation > 0  ? row.deviation : null,
    devNegative: row.deviation !== null && row.deviation <= 0 ? row.deviation : null,
  }));

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-3)" }}>
          OCR DEVIATION FROM TAYLOR RULE — pp
        </span>
        <div style={{ display: "flex", gap: 16, fontSize: "10px" }}>
          <span style={{ color: "var(--hawkish)" }}>▲ Hawkish (OCR &gt; Taylor)</span>
          <span style={{ color: "var(--dovish)"  }}>▼ Dovish  (OCR &lt; Taylor)</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <ComposedChart data={enriched} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="0" stroke="var(--border)" />
          <XAxis
            dataKey="label"
            tickFormatter={formatter}
            tick={{ fontSize: 10, fill: "var(--text-3)", fontFamily: "inherit" }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "var(--text-3)", fontFamily: "inherit" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}pp`}
            width={48}
          />
          <Tooltip content={<ChartTooltip />} />
          <ReferenceLine y={0} stroke="var(--border-2)" strokeWidth={1} />

          <Area
            dataKey="devPositive"
            name="Hawkish deviation"
            fill="var(--hawkish)"
            fillOpacity={0.25}
            stroke="var(--hawkish)"
            strokeWidth={1.5}
            connectNulls={false}
          />
          <Area
            dataKey="devNegative"
            name="Dovish deviation"
            fill="var(--dovish)"
            fillOpacity={0.25}
            stroke="var(--dovish)"
            strokeWidth={1.5}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}