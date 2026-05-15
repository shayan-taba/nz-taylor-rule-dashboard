// src/components/analytics/DeviationStatsPanel.tsx

"use client";
import { useMemo } from "react";
import { useChartData } from "../../hooks/useChartData";

function StatRow({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "baseline",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <span
        style={{
          fontSize: "10px",
          color: "var(--text-3)",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "13px",
          color: color ?? "var(--text)",
          fontWeight: 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function fmt(v: number | null, decimals = 2, signed = false): string {
  if (v === null) return "—";
  const s = v.toFixed(decimals);
  return signed && v > 0 ? `+${s}pp` : `${s}pp`;
}

export function DeviationStatsPanel() {
  const data = useChartData();

  const stats = useMemo(() => {
    const devs = data
      .map((d) => ({ date: d.label, value: d.deviation }))
      .filter((d): d is { date: string; value: number } => d.value !== null);

    if (!devs.length) return null;

    const vals = devs.map((d) => d.value);
    const n = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / n;
    const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const std = Math.sqrt(variance);
    const skew =
      std === 0
        ? 0
        : vals.reduce((a, b) => a + Math.pow((b - mean) / std, 3), 0) / n;

    const maxDev = devs.reduce((a, b) => (b.value > a.value ? b : a));
    const minDev = devs.reduce((a, b) => (b.value < a.value ? b : a));

    const pctAbove = (vals.filter((v) => v > 0).length / n) * 100;
    const pctBelow = (vals.filter((v) => v < 0).length / n) * 100;

    return { mean, std, skew, maxDev, minDev, pctAbove, pctBelow, n };
  }, [data]);

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.1em",
          color: "var(--text-3)",
          marginBottom: 16,
        }}
      >
        DEVIATION STATISTICS
      </div>

      {!stats ? (
        <div style={{ color: "var(--text-3)", fontSize: "11px" }}>
          No data in selected window
        </div>
      ) : (
        <>
          <StatRow label="OBSERVATIONS" value={`${stats.n} quarters`} />
          <StatRow
            label="MEAN DEVIATION"
            value={fmt(stats.mean, 2, true)}
            color={stats.mean > 0 ? "var(--hawkish)" : "var(--dovish)"}
          />
          <StatRow label="STD DEVIATION" value={`${stats.std.toFixed(2)}pp`} />
          <StatRow label="SKEWNESS" value={stats.skew.toFixed(3)} />
          <StatRow
            label="LARGEST HAWKISH"
            value={`${fmt(stats.maxDev.value, 2, true)} — ${stats.maxDev.date}`}
            color="var(--hawkish)"
          />
          <StatRow
            label="LARGEST DOVISH"
            value={`${fmt(stats.minDev.value, 2, true)} — ${stats.minDev.date}`}
            color="var(--dovish)"
          />
          <StatRow
            label="QUARTERS HAWKISH"
            value={`${stats.pctAbove.toFixed(1)}%`}
            color="var(--hawkish)"
          />
          <StatRow
            label="QUARTERS DOVISH"
            value={`${stats.pctBelow.toFixed(1)}%`}
            color="var(--dovish)"
          />

          {/* Visual bar showing hawkish/dovish split */}
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                fontSize: "9px",
                color: "var(--text-3)",
                letterSpacing: "0.1em",
                marginBottom: 6,
              }}
            >
              HAWKISH / DOVISH SPLIT
            </div>
            <div
              style={{
                display: "flex",
                height: 6,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${stats.pctAbove}%`,
                  background: "var(--hawkish)",
                  opacity: 0.8,
                }}
              />
              <div
                style={{
                  width: `${stats.pctBelow}%`,
                  background: "var(--dovish)",
                  opacity: 0.8,
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "9px",
                color: "var(--text-3)",
                marginTop: 4,
              }}
            >
              <span>Hawkish {stats.pctAbove.toFixed(0)}%</span>
              <span>Dovish {stats.pctBelow.toFixed(0)}%</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
