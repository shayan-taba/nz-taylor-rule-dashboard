"use client";
import { useChartData } from "../../hooks/useChartData";
import {
  ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { ChartTooltip } from "../ui/Tooltip";

function tickFilter(data: { label: string }[], maxTicks = 14) {
  if (data.length <= maxTicks) return (_: string, i: number) => data[i]?.label ?? "";
  const step = Math.ceil(data.length / maxTicks);
  return (_: string, i: number) => (i % step === 0 ? data[i]?.label ?? "" : "");
}

export function RollingStatsChart() {
  const data      = useChartData();
  const formatter = tickFilter(data);

  return (
    <div style={{
      background: "var(--bg-2)",
      border:     "1px solid var(--border)",
      padding:    "20px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-3)" }}>
          ROLLING 4-QUARTER STATISTICS
        </span>
        <div style={{ display: "flex", gap: 20, fontSize: "10px", color: "var(--text-2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 16, height: 2, background: "var(--accent)" }} />
            <span>Rolling Mean Deviation</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 16, height: 2, background: "var(--accent-2)" }} />
            <span>Rolling Std Dev</span>
          </div>
        </div>
      </div>

      {/* Two stacked panels sharing the same x-axis */}
      <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>

        {/* Panel 1: rolling mean */}
        <ResponsiveContainer width="100%" height={180}>
          <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="0" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickFormatter={formatter}
              tick={{ fontSize: 9, fill: "var(--text-3)", fontFamily: "inherit" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--text-3)", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}pp`}
              width={52}
            />
            <Tooltip content={<ChartTooltip />} />
            <ReferenceLine y={0} stroke="var(--border-2)" strokeWidth={1} />
            <Area
              dataKey="rollingMean4q"
              name="Rolling Mean"
              stroke="var(--accent)"
              fill="var(--accent)"
              fillOpacity={0.08}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Panel 2: rolling std */}
        <ResponsiveContainer width="100%" height={140}>
          <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="0" stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickFormatter={formatter}
              tick={{ fontSize: 9, fill: "var(--text-3)", fontFamily: "inherit" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 9, fill: "var(--text-3)", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v.toFixed(1)}pp`}
              width={52}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              dataKey="rollingStd4q"
              name="Rolling Std Dev"
              stroke="var(--accent-2)"
              fill="var(--accent-2)"
              fillOpacity={0.08}
              strokeWidth={2}
              dot={false}
              connectNulls
            />
          </ComposedChart>
        </ResponsiveContainer>

      </div>
    </div>
  );
}