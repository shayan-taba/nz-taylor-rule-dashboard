"use client";
import {
  ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import { useAppStore } from "../../store/appStore";
import { useChartData } from "../../store/useChartData";
import { ChartTooltip } from "../../store/Tooltip";

// Show every Nth label to avoid crowding
function tickFilter(data: { label: string }[], maxTicks = 12) {
  if (data.length <= maxTicks) return (v: string) => v;
  const step = Math.ceil(data.length / maxTicks);
  return (_: string, i: number) => (i % step === 0 ? data[i]?.label ?? "" : "");
}

export function MainChart() {
  const showInertial = useAppStore((s) => s.showInertial);
  const data         = useChartData();

  // Pi* step changes — for reference lines
  const piStarChanges = data.reduce<{ date: string; value: number }[]>((acc, row, i) => {
    if (i === 0) return [{ date: row.date, value: row.piStar ?? 2 }];
    if (row.piStar !== data[i - 1].piStar) acc.push({ date: row.date, value: row.piStar ?? 2 });
    return acc;
  }, []);

  const formatter = tickFilter(data);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-3)" }}>
          INTEREST RATES — %
        </span>
        {/* Legend */}
        <div style={{ display: "flex", gap: 16, fontSize: "10px", color: "var(--text-2)" }}>
          {[
            { color: "var(--ocr)",      label: "OCR (Actual)" },
            { color: "var(--taylor)",   label: "Taylor Rule" },
            { color: "var(--inertial)", label: "Inertial Taylor" },
            { color: "var(--pi-star)",  label: "π* Target" },
          ].map(({ color, label }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <div style={{ width: 16, height: 2, background: color }} />
              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={300}>
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

          {/* π* as faint step line */}
          <Line
            dataKey="piStar"
            name="π* Target"
            stroke="var(--pi-star)"
            strokeWidth={1}
            dot={false}
            strokeDasharray="2 4"
            connectNulls
          />

          {showInertial && (
            <Line
              dataKey="inertialRate"
              name="Inertial Taylor"
              stroke="var(--inertial)"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 3"
              connectNulls
            />
          )}

          <Line
            dataKey="taylorRate"
            name="Taylor Rule"
            stroke="var(--taylor)"
            strokeWidth={2}
            dot={false}
            strokeDasharray="6 3"
            connectNulls
          />

          <Line
            dataKey="ocr"
            name="OCR (Actual)"
            stroke="var(--ocr)"
            strokeWidth={2.5}
            dot={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}