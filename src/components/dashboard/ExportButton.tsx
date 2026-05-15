// src/components/dashboard/ExportButton.tsx

"use client";
import { useAppStore } from "../../store/appStore";
import { useChartData } from "../../hooks/useChartData";
import type { ExportFormat, ExportRow } from "../../types";

interface Props {
  format: ExportFormat;
}

function buildRows(
  data: ReturnType<typeof useChartData>,
  inflationMeasure: string,
): ExportRow[] {
  return data.map((row) => ({
    date: row.date,
    ocr: row.ocr,
    taylorRate: row.taylorRate,
    inertialRate: row.inertialRate,
    deviation: row.deviation,
    compNeutral: row.compNeutral,
    compInfGap: row.compInfGap,
    compOutputGap: row.compOutputGap,
    outputGap: row.outputGap,
    inflation: row.inflation,
    inflationMeasure,
    rStar: row.rStar,
    piStar: row.piStar,
    urate: row.urate,
    nzdUsd: row.nzdUsd,
    gdpApc: row.gdpApc,
  }));
}

function toCSV(rows: ExportRow[]): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]) as (keyof ExportRow)[];
  const header = headers.join(",");
  const lines = rows.map((row) =>
    headers
      .map((h) => {
        const v = row[h];
        if (v === null || v === undefined) return "";
        return String(v);
      })
      .join(","),
  );
  return [header, ...lines].join("\n");
}

function download(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function dateRangeSlug(start: string, end: string): string {
  // "2000-03-31_2026-03-31" → "2000Q1_2026Q1"
  const toQ = (d: string) => {
    const dt = new Date(d);
    return `${dt.getUTCFullYear()}Q${Math.ceil((dt.getUTCMonth() + 1) / 3)}`;
  };
  return `${toQ(start)}_${toQ(end)}`;
}

export function ExportButton({ format }: Props) {
  const data = useChartData();
  const inflationMeasure = useAppStore((s) => s.inflationMeasure);
  const dateRange = useAppStore((s) => s.dateRange);

  const handleExport = () => {
    const rows = buildRows(data, inflationMeasure);
    const slug = dateRangeSlug(dateRange.start, dateRange.end);
    const fname = `rbnz-policy-tracker_${slug}`;

    if (format === "csv") {
      download(toCSV(rows), `${fname}.csv`, "text/csv");
    } else {
      download(
        JSON.stringify(rows, null, 2),
        `${fname}.json`,
        "application/json",
      );
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={!data.length}
      style={{
        padding: "4px 12px",
        fontSize: "10px",
        letterSpacing: "0.06em",
        fontFamily: "inherit",
        background: "transparent",
        color: data.length ? "var(--text-2)" : "var(--text-3)",
        border: "1px solid var(--border)",
        borderRadius: "2px",
        cursor: data.length ? "pointer" : "not-allowed",
        transition: "all 0.15s",
      }}
      onMouseEnter={(e) => {
        if (data.length) {
          (e.target as HTMLButtonElement).style.borderColor = "var(--accent)";
          (e.target as HTMLButtonElement).style.color = "var(--accent)";
        }
      }}
      onMouseLeave={(e) => {
        (e.target as HTMLButtonElement).style.borderColor = "var(--border)";
        (e.target as HTMLButtonElement).style.color = data.length
          ? "var(--text-2)"
          : "var(--text-3)";
      }}
    >
      ↓ {format.toUpperCase()}
    </button>
  );
}
