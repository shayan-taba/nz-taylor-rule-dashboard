// src/components/analytics/ScatterPlots.tsx

"use client";
import { useMemo }      from "react";
import { useAppStore } from "../../store/appStore";
import { useChartData } from "../../hooks/useChartData";
import {
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Line, ComposedChart,
} from "recharts";

const MEASURE_LABELS: Record<string, string> = {
  cpiApc:            "CPI Headline",
  inflationTrimmed:  "Trimmed Mean",
  inflationSectoral: "Sectoral",
  inflationCoreAvg:  "Core Avg",
};

// Simple Pearson correlation
function pearson(pairs: [number, number][]): number {
  const n  = pairs.length;
  if (n < 2) return 0;
  const mx = pairs.reduce((a, [x]) => a + x, 0) / n;
  const my = pairs.reduce((a, [, y]) => a + y, 0) / n;
  const num = pairs.reduce((a, [x, y]) => a + (x - mx) * (y - my), 0);
  const den = Math.sqrt(
    pairs.reduce((a, [x]) => a + Math.pow(x - mx, 2), 0) *
    pairs.reduce((a, [, y]) => a + Math.pow(y - my, 2), 0)
  );
  return den === 0 ? 0 : num / den;
}

// OLS line: y = a + b*x, returns points spanning xMin→xMax
function olsLine(
  pairs: [number, number][],
  xMin: number,
  xMax: number,
): { x: number; y: number }[] {
  const n  = pairs.length;
  if (n < 2) return [];
  const mx = pairs.reduce((a, [x]) => a + x, 0) / n;
  const my = pairs.reduce((a, [, y]) => a + y, 0) / n;
  const b  =
    pairs.reduce((a, [x, y]) => a + (x - mx) * (y - my), 0) /
    pairs.reduce((a, [x])    => a + Math.pow(x - mx, 2), 0);
  const a = my - b * mx;
  return [
    { x: xMin, y: a + b * xMin },
    { x: xMax, y: a + b * xMax },
  ];
}

interface ScatterPanelProps {
  title:  string;
  xLabel: string;
  yLabel: string;
  pairs:  [number, number][];
  xUnit?: string;
}

function ScatterPanel({ title, xLabel, yLabel, pairs, xUnit = "%" }: ScatterPanelProps) {
  const r = pearson(pairs);

  const { dots, trendLine, xMin, xMax } = useMemo(() => {
    if (!pairs.length) return { dots: [], trendLine: [], xMin: 0, xMax: 1 };
    const xs   = pairs.map(([x]) => x);
    const xMin = Math.min(...xs);
    const xMax = Math.max(...xs);
    const dots = pairs.map(([x, y]) => ({ x, y }));
    const trendLine = olsLine(pairs, xMin, xMax);
    return { dots, trendLine, xMin, xMax };
  }, [pairs]);

  const rColor =
    Math.abs(r) > 0.6 ? "var(--accent)" :
    Math.abs(r) > 0.3 ? "var(--text-2)" :
    "var(--text-3)";

  return (
    <div style={{
      background:    "var(--bg-2)",
      border:        "1px solid var(--border)",
      padding:       "16px",
      display:       "flex",
      flexDirection: "column",
      flex:          1,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ fontSize: "10px", letterSpacing: "0.08em", color: "var(--text-3)" }}>
            {title}
          </div>
          <div style={{ fontSize: "9px", color: "var(--text-3)", marginTop: 2 }}>
            {xLabel} vs {yLabel}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "9px", color: "var(--text-3)", letterSpacing: "0.06em" }}>PEARSON r</div>
          <div style={{ fontSize: "18px", fontWeight: 300, color: rColor, letterSpacing: "-0.02em" }}>
            {r >= 0 ? "+" : ""}{r.toFixed(2)}
          </div>
        </div>
      </div>

      {!dots.length ? (
        <div style={{ color: "var(--text-3)", fontSize: "11px", padding: "20px 0", textAlign: "center" }}>
          No data
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart margin={{ top: 4, right: 4, bottom: 16, left: -10 }}>
            <CartesianGrid strokeDasharray="0" stroke="var(--border)" />
            <XAxis
              dataKey="x"
              type="number"
              domain={["auto", "auto"]}
              tick={{ fontSize: 9, fill: "var(--text-3)", fontFamily: "inherit" }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
              tickFormatter={(v) => `${v}${xUnit}`}
              label={{ value: xLabel, position: "insideBottom", offset: -8, fontSize: 9, fill: "var(--text-3)" }}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={["auto", "auto"]}
              tick={{ fontSize: 9, fill: "var(--text-3)", fontFamily: "inherit" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v > 0 ? "+" : ""}${v.toFixed(1)}pp`}
              width={52}
              label={{ value: "Deviation", angle: -90, position: "insideLeft", offset: 10, fontSize: 9, fill: "var(--text-3)" }}
            />
            <ReferenceLine y={0} stroke="var(--border-2)" strokeWidth={1} />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0]?.payload as { x: number; y: number };
                return (
                  <div style={{ background: "var(--bg-3)", border: "1px solid var(--border-2)", padding: "8px 12px", fontSize: "10px" }}>
                    <div style={{ color: "var(--text-2)" }}>{xLabel}: {d?.x?.toFixed(2)}{xUnit}</div>
                    <div style={{ color: "var(--text)"   }}>Deviation: {d?.y > 0 ? "+" : ""}{d?.y?.toFixed(2)}pp</div>
                  </div>
                );
              }}
            />
            {/* Scatter dots */}
            <Scatter
              data={dots}
              fill="var(--accent)"
              fillOpacity={0.5}
              r={3}
            />
            {/* OLS trend line */}
            <Line
              data={trendLine}
              dataKey="y"
              stroke="var(--accent-2)"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 3"
              legendType="none"
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function ScatterPlots() {
  const data             = useChartData();
  const inflationMeasure = useAppStore((s) => s.inflationMeasure);

  const {
    inflPairs, uratePairs, nzdPairs,
  } = useMemo(() => {
    const inflPairs:  [number, number][] = [];
    const uratePairs: [number, number][] = [];
    const nzdPairs:   [number, number][] = [];

    for (const row of data) {
      if (row.deviation === null) continue;
      if (row.inflation !== null) inflPairs.push([row.inflation, row.deviation]);
      if (row.urate     !== null) uratePairs.push([row.urate,    row.deviation]);
      if (row.nzdUsd    !== null) nzdPairs.push([row.nzdUsd,     row.deviation]);
    }

    return { inflPairs, uratePairs, nzdPairs };
  }, [data]);

  return (
    <div style={{
      background: "var(--bg-2)",
      border:     "1px solid var(--border)",
      padding:    "20px",
    }}>
      <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 16 }}>
        DEVIATION CORRELATES
      </div>
      <div style={{ display: "flex", gap: 1 }}>
        <ScatterPanel
          title="DEVIATION vs INFLATION"
          xLabel={MEASURE_LABELS[inflationMeasure] ?? "Inflation"}
          yLabel="Deviation"
          pairs={inflPairs}
        />
        <ScatterPanel
          title="DEVIATION vs UNEMPLOYMENT"
          xLabel="Unemployment Rate"
          yLabel="Deviation"
          pairs={uratePairs}
        />
        <ScatterPanel
          title="DEVIATION vs NZD/USD"
          xLabel="NZD/USD"
          yLabel="Deviation"
          pairs={nzdPairs}
          xUnit=""
        />
      </div>
    </div>
  );
}