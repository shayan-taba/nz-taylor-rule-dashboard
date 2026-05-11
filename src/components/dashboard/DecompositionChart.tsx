"use client";
import {
  ComposedChart, Bar, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { useChartData } from "../../hooks/useChartData";
import { tickFilter } from "../../lib/chart";
import { ChartTooltip } from "../ui/Tooltip";

export function DecompositionChart() {
  const data      = useChartData();
  const formatter = tickFilter(data);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-3)" }}>
          TAYLOR RULE DECOMPOSITION — %
        </span>
        <div style={{ display: "flex", gap: 16, fontSize: "10px", color: "var(--text-2)" }}>
          {[
            { color: "#3b82f6", label: "Neutral Rate (r*)" },
            { color: "#f59e0b", label: "Inflation Gap" },
            { color: "#10b981", label: "Output Gap" },
            { color: "var(--ocr)", label: "OCR" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 10, height: 10, background: color, opacity: 0.8 }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
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
            tickFormatter={(v) => `${v}%`}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} />

          <Bar dataKey="compNeutral"   name="Neutral Rate"   stackId="a" fill="#3b82f6" fillOpacity={0.85} />
          <Bar dataKey="compInfGap"    name="Inflation Gap"  stackId="a" fill="#f59e0b" fillOpacity={0.85} />
          <Bar dataKey="compOutputGap" name="Output Gap"     stackId="a" fill="#10b981" fillOpacity={0.85} />

          <Line
            dataKey="ocr"
            name="OCR"
            stroke="var(--ocr)"
            strokeWidth={2}
            dot={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}