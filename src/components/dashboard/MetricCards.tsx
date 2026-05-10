"use client";
import { useMemo }                       from "react";
import { useAppStore } from "../../store/appStore";
import { useChartData, useLagInfo } from "../../hooks/useChartData";
import { ExportButton } from "./ExportButton";

const MEASURE_LABELS: Record<string, string> = {
  cpiApc:            "CPI HEADLINE",
  inflationTrimmed:  "TRIMMED MEAN",
  inflationSectoral: "SECTORAL",
  inflationCoreAvg:  "CORE AVG",
};

function fmt(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined) return "—";
  return v.toFixed(decimals) + "%";
}

function fmtSigned(v: number | null | undefined, decimals = 2): string {
  if (v === null || v === undefined) return "—";
  return (v >= 0 ? "+" : "") + v.toFixed(decimals) + "%";
}

function ordinal(n: number): string {
  return n === 1 ? "1 quarter" : `${n} quarters`;
}

function toQLabel(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `Q${Math.ceil((d.getUTCMonth() + 1) / 3)} ${d.getUTCFullYear()}`;
}

interface CardProps {
  label:    string;
  value:    string;
  // Secondary value shown smaller below main value
  subValue?: string;
  subValueLabel?: string;
  // Status line at bottom
  statusLine?: string;
  statusColor?: string;
  accent?:  boolean;
  positive?: boolean | null;
}

function Card({
  label, value, subValue, subValueLabel,
  statusLine, statusColor, accent, positive,
}: CardProps) {
  const mainColor =
    accent             ? "var(--accent)"  :
    positive === true  ? "var(--dovish)"  :
    positive === false ? "var(--hawkish)" :
    "var(--text)";

  return (
    <div style={{
      background:    "var(--bg-2)",
      border:        "1px solid var(--border)",
      padding:       "16px 20px",
      display:       "flex",
      flexDirection: "column",
      gap:           0,
      flex:          1,
      minWidth:      140,
    }}>
      {/* Label */}
      <span style={{
        fontSize:      "9px",
        letterSpacing: "0.12em",
        color:         "var(--text-3)",
        marginBottom:  6,
      }}>
        {label}
      </span>

      {/* Main value */}
      <span style={{
        fontSize:      "24px",
        fontWeight:    300,
        color:         mainColor,
        letterSpacing: "-0.02em",
        lineHeight:    1,
        marginBottom:  subValue ? 6 : 0,
      }}>
        {value}
      </span>

      {/* Sub value (latest available when lagging) */}
      {subValue && (
        <div style={{
          display:       "flex",
          alignItems:    "baseline",
          gap:           6,
          paddingTop:    6,
          borderTop:     "1px solid var(--border)",
          marginTop:     2,
        }}>
          <span style={{ fontSize: "10px", color: "var(--text-3)" }}>
            {subValueLabel}
          </span>
          <span style={{
            fontSize:   "13px",
            fontWeight: 400,
            color:      "var(--text-2)",
          }}>
            {subValue}
          </span>
        </div>
      )}

      {/* Status / lag note */}
      {statusLine && (
        <span style={{
          fontSize:   "10px",
          color:      statusColor ?? "var(--text-3)",
          marginTop:  6,
          lineHeight: 1.4,
        }}>
          {statusLine}
        </span>
      )}
    </div>
  );
}

export function MetricCards() {
  const data             = useChartData();
  const inflationMeasure = useAppStore((s) => s.inflationMeasure);
  const lagInfo          = useLagInfo();
  const rawSeries        = useAppStore((s) => s.rawSeries);

  // Latest OCR — always current, no lag
  const latestOcr = rawSeries.filter((r) => r.ocr !== null).at(-1);
  const ocrValue  = latestOcr?.ocr ?? null;
  const ocrDate   = latestOcr?.date.split("T")[0] ?? null;

  // Mean deviation over window
  const meanDeviation = useMemo(() => {
    const devs = data.map((d) => d.deviation).filter((v): v is number => v !== null);
    if (!devs.length) return null;
    return devs.reduce((a, b) => a + b, 0) / devs.length;
  }, [data]);

  // Latest output gap — always current from MPS
  const latestGap = rawSeries.filter((r) => r.outputGap !== null).at(-1);

  // ---- Build card props ----

  // TAYLOR RULE card
  const { taylor, deviation, inflation } = lagInfo;
  const taylorLag = taylor.quartersLag;
  const taylorCurrentDate = taylor.currentDate;

  // The "current" taylor would require current inflation — if inflation lags,
  // the latest computed taylor also lags by the same amount.
  // Show latest computed value + note if lagging.
  const taylorStatusLine = taylorLag > 0
    ? `As of ${toQLabel(taylor.valueDate)} — ${ordinal(taylorLag)} behind (inflation data pending)`
    : undefined;

  // Also show what the latest OCR is for that same date, for comparison
  // Find the OCR for the taylor date
  const ocrAtTaylorDate = taylor.valueDate
    ? rawSeries.find((r) => r.date.split("T")[0] === taylor.valueDate)?.ocr ?? null
    : null;

  // DEVIATION card
  const devLag = deviation.quartersLag;
  const devStatusLine = devLag > 0
    ? `As of ${toQLabel(deviation.valueDate)} — ${ordinal(devLag)} behind`
    : deviation.value !== null
      ? deviation.value >= 0 ? "More hawkish than rule" : "More dovish than rule"
      : undefined;

  const devPositive = deviation.value !== null ? deviation.value < 0 : null;

  // INFLATION card
  const inflLag = inflation.quartersLag;
  const inflStatusLine = inflLag > 0
    ? `As of ${toQLabel(inflation.valueDate)} — ${ordinal(inflLag)} behind current quarter`
    : undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <div style={{ display: "flex", gap: 1, flexWrap: "wrap" }}>

        {/* OCR — always current */}
        <Card
          label={`OCR — ${toQLabel(ocrDate)}`}
          value={fmt(ocrValue)}
          accent
        />

        {/* Taylor Rule — may lag if non-headline inflation selected */}
        <Card
          label="TAYLOR RULE"
          value={fmt(taylor.value)}
          subValue={
            taylorLag > 0 && ocrAtTaylorDate !== null
              ? fmt(ocrAtTaylorDate)
              : undefined
          }
          subValueLabel={taylorLag > 0 ? `OCR ${toQLabel(taylor.valueDate)}` : undefined}
          statusLine={taylorStatusLine}
          statusColor={taylorLag > 0 ? "var(--accent-2)" : undefined}
        />

        {/* Deviation — same lag as taylor */}
        <Card
          label="DEVIATION (OCR − TAYLOR)"
          value={deviation.value !== null ? fmtSigned(deviation.value) : "—"}
          subValue={
            devLag > 0 && ocrAtTaylorDate !== null && taylor.value !== null
              ? fmtSigned(ocrAtTaylorDate - taylor.value)
              : undefined
          }
          subValueLabel={devLag > 0 ? `At ${toQLabel(deviation.valueDate)}` : undefined}
          statusLine={devStatusLine}
          statusColor={devLag > 0 ? "var(--accent-2)" : undefined}
          positive={devPositive}
        />

        {/* Mean deviation — window */}
        <Card
          label="MEAN DEVIATION (WINDOW)"
          value={meanDeviation !== null ? fmtSigned(meanDeviation) : "—"}
          positive={meanDeviation !== null ? meanDeviation < 0 : null}
        />

        {/* Inflation — may lag */}
        <Card
          label={MEASURE_LABELS[inflationMeasure] ?? "INFLATION"}
          value={fmt(inflation.value)}
          subValue={
            inflLag > 0 && latestOcr
              ? fmt(latestOcr.cpiApc)
              : undefined
          }
          subValueLabel={inflLag > 0 ? `CPI Headline ${toQLabel(taylorCurrentDate)}` : undefined}
          statusLine={inflStatusLine}
          statusColor={inflLag > 0 ? "var(--accent-2)" : undefined}
        />

        {/* Output gap — always current */}
        <Card
          label={`OUTPUT GAP — ${toQLabel(latestGap?.date.split("T")[0] ?? null)}`}
          value={fmt(latestGap?.outputGap)}
        />

      </div>

      {/* Export row */}
      <div style={{
        display:        "flex",
        justifyContent: "flex-end",
        alignItems:     "center",
        padding:        "8px 0",
        gap:            8,
      }}>
        <span style={{ fontSize: "10px", color: "var(--text-3)", letterSpacing: "0.08em" }}>
          EXPORT WINDOW DATA
        </span>
        <ExportButton format="csv"  />
        <ExportButton format="json" />
      </div>
    </div>
  );
}
