"use client";
import { useMemo }     from "react";
import { useAppStore } from "../../store/appStore";
import { useChartData } from "../../store/useChartData";

interface CardProps {
  label:    string;
  value:    string;
  sub?:     string;
  accent?:  boolean;
  positive?: boolean | null; // null = neutral
}

function Card({ label, value, sub, accent, positive }: CardProps) {
  const color =
    accent    ? "var(--accent)" :
    positive === true  ? "var(--dovish)" :
    positive === false ? "var(--hawkish)" :
    "var(--text)";

  return (
    <div style={{
      background:   "var(--bg-2)",
      border:       "1px solid var(--border)",
      padding:      "16px 20px",
      display:      "flex",
      flexDirection: "column",
      gap:          4,
      flex:         1,
      minWidth:     140,
    }}>
      <span style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--text-3)", fontFamily: "inherit" }}>
        {label}
      </span>
      <span style={{ fontSize: "24px", fontWeight: 300, color, letterSpacing: "-0.02em" }}>
        {value}
      </span>
      {sub && (
        <span style={{ fontSize: "10px", color: "var(--text-3)" }}>{sub}</span>
      )}
    </div>
  );
}

function fmt(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined) return "—";
  return v.toFixed(decimals) + "%";
}

export function MetricCards() {
  const data            = useChartData();
  const inflationMeasure = useAppStore((s) => s.inflationMeasure);

  const latest = data[data.length - 1];

  const meanDeviation = useMemo(() => {
    const devs = data.map((d) => d.deviation).filter((v): v is number => v !== null);
    if (!devs.length) return null;
    return devs.reduce((a, b) => a + b, 0) / devs.length;
  }, [data]);

  const inflationLabel: Record<string, string> = {
    cpiApc:            "CPI YoY",
    inflationTrimmed:  "Trimmed Mean",
    inflationSectoral: "Sectoral",
    inflationCoreAvg:  "Core Avg",
  };

  const dev = latest?.deviation ?? null;

  return (
    <div style={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      <Card label="OCR"          value={fmt(latest?.ocr)}        accent />
      <Card label="TAYLOR RULE"  value={fmt(latest?.taylorRate)}  />
      <Card
        label="CURRENT DEVIATION"
        value={dev !== null ? (dev >= 0 ? "+" : "") + fmt(dev) : "—"}
        sub={dev !== null ? (dev >= 0 ? "More hawkish than rule" : "More dovish than rule") : undefined}
        positive={dev !== null ? dev < 0 : null}
      />
      <Card
        label="MEAN DEVIATION (WINDOW)"
        value={meanDeviation !== null ? (meanDeviation >= 0 ? "+" : "") + fmt(meanDeviation) : "—"}
        positive={meanDeviation !== null ? meanDeviation < 0 : null}
      />
      <Card label={inflationLabel[inflationMeasure] ?? "INFLATION"} value={fmt(latest?.inflation)} />
      <Card label="OUTPUT GAP"   value={fmt(latest?.outputGap)} />
    </div>
  );
}