// src/components/analytics/DeviationHistogram.tsx

"use client";
import { useMemo } from "react";
import { useChartData } from "../../hooks/useChartData";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";

const BIN_WIDTH = 0.5; // pp

interface HistBin {
  midpoint: number;
  label: string;
  count: number;
  color: string;
}

function buildHistogram(vals: number[]): HistBin[] {
  if (!vals.length) return [];
  const min = Math.floor(Math.min(...vals) / BIN_WIDTH) * BIN_WIDTH;
  const max = Math.ceil(Math.max(...vals) / BIN_WIDTH) * BIN_WIDTH;
  const bins: HistBin[] = [];

  for (
    let edge = min;
    edge < max;
    edge = Math.round((edge + BIN_WIDTH) * 100) / 100
  ) {
    const lo = edge;
    const hi = Math.round((edge + BIN_WIDTH) * 100) / 100;
    const mid = Math.round((lo + BIN_WIDTH / 2) * 100) / 100;
    const count = vals.filter((v) => v >= lo && v < hi).length;
    bins.push({
      midpoint: mid,
      label: `${lo > 0 ? "+" : ""}${lo.toFixed(1)}`,
      count,
      color: mid >= 0 ? "var(--hawkish)" : "var(--dovish)",
    });
  }

  return bins;
}

// Normal distribution PDF
function normalPdf(x: number, mean: number, std: number): number {
  return (
    (1 / (std * Math.sqrt(2 * Math.PI))) *
    Math.exp(-0.5 * Math.pow((x - mean) / std, 2))
  );
}

export function DeviationHistogram() {
  const data = useChartData();

  const { bins, normalCurve, mean, std } = useMemo(() => {
    const vals = data
      .map((d) => d.deviation)
      .filter((v): v is number => v !== null);

    if (!vals.length) return { bins: [], normalCurve: [], mean: 0, std: 1 };

    const n = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const std = Math.sqrt(
      vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n,
    );

    const bins = buildHistogram(vals);

    // Scale normal curve to match histogram counts
    const scale = n * BIN_WIDTH;
    const normalCurve = bins.map((b) => ({
      label: b.label,
      normal: Math.round(normalPdf(b.midpoint, mean, std) * scale * 10) / 10,
    }));

    return { bins, normalCurve, mean, std };
  }, [data]);

  // Merge bins + normal into one array for recharts
  const chartData = bins.map((b, i) => ({
    ...b,
    normal: normalCurve[i]?.normal ?? 0,
  }));

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            color: "var(--text-3)",
          }}
        >
          DEVIATION DISTRIBUTION — bin width 0.5pp
        </span>
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: "10px",
            color: "var(--text-2)",
          }}
        >
          <span style={{ color: "var(--hawkish)" }}>■ Hawkish</span>
          <span style={{ color: "var(--dovish)" }}>■ Dovish</span>
          <span style={{ color: "var(--accent)" }}>— Normal</span>
        </div>
      </div>

      {!chartData.length ? (
        <div
          style={{
            color: "var(--text-3)",
            fontSize: "11px",
            padding: "40px 0",
            textAlign: "center",
          }}
        >
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={chartData}
            margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
          >
            <CartesianGrid
              strokeDasharray="0"
              stroke="var(--border)"
              vertical={false}
            />
            <XAxis
              dataKey="label"
              tick={{
                fontSize: 9,
                fill: "var(--text-3)",
                fontFamily: "inherit",
              }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              label={{
                value: "Deviation (pp)",
                position: "insideBottom",
                offset: -2,
                fontSize: 9,
                fill: "var(--text-3)",
              }}
            />
            <YAxis
              tick={{
                fontSize: 9,
                fill: "var(--text-3)",
                fontFamily: "inherit",
              }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                const labelString =
                  typeof label === "number" ? label.toFixed(1) : label;
                return (
                  <div
                    style={{
                      background: "var(--bg-3)",
                      border: "1px solid var(--border-2)",
                      padding: "8px 12px",
                      fontSize: "11px",
                    }}
                  >
                    <div style={{ color: "var(--text-2)", marginBottom: 4 }}>
                      {labelString}pp to{" "}
                      {(parseFloat(labelString) + BIN_WIDTH).toFixed(1)}pp
                    </div>
                    <div style={{ color: "var(--text)" }}>
                      {payload[0]?.value} quarters
                    </div>
                  </div>
                );
              }}
            />
            <ReferenceLine
              x={mean > 0 ? `+${mean.toFixed(1)}` : mean.toFixed(1)}
              stroke="var(--accent)"
              strokeDasharray="3 3"
              strokeWidth={1}
            />
            <Bar dataKey="count" name="Quarters" radius={[1, 1, 0, 0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} fillOpacity={0.75} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}

      <div
        style={{
          fontSize: "10px",
          color: "var(--text-3)",
          marginTop: 8,
          display: "flex",
          gap: 20,
        }}
      >
        <span>
          Mean:{" "}
          <span style={{ color: "var(--text-2)" }}>
            {mean > 0 ? "+" : ""}
            {mean.toFixed(2)}pp
          </span>
        </span>
        <span>
          Std Dev:{" "}
          <span style={{ color: "var(--text-2)" }}>{std.toFixed(2)}pp</span>
        </span>
      </div>
    </div>
  );
}
