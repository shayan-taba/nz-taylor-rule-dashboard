// src/lib/parsers/mps-latest.ts

// RBNZ Monetary Policy Statement Parser

import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

const NEEDED: Record<string, keyof MpsRow> = {
  gdp: "gdp",
  gdpqpc: "gdpQpc",
  gdpapc: "gdpApc",
  outputgap: "outputGap",
  urate: "urate",
  p: "cpiIndex",
  pqpc: "cpiQpc",
  papc: "cpiApc",
  ocr: "ocr",
};

export interface MpsRow {
  date: Date;
  gdp: number | null;
  gdpQpc: number | null;
  gdpApc: number | null;
  outputGap: number | null;
  urate: number | null;
  cpiIndex: number | null;
  cpiQpc: number | null;
  cpiApc: number | null;
  ocr: number | null;
}

export function parseMps(filePath: string): {
  rows: MpsRow[];
  vintage: string;
} {
  const buffer = fs.readFileSync(filePath);
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });

  // ------------------------------------------------------------------
  // 1. VINTAGE FROM "Contents" SHEET
  // ------------------------------------------------------------------
  const contentsSheet = wb.Sheets["Contents"];
  if (!contentsSheet) {
    throw new Error('Sheet "Contents" not found in MPS XLSX');
  }

  const contentsRaw = XLSX.utils.sheet_to_json<unknown[]>(contentsSheet, {
    header: 1,
    raw: true,
    defval: null,
  });

  const firstCell = contentsRaw?.[0]?.[0];

  let vintage = "unknown";

  if (typeof firstCell === "string") {
    // Example: "Monetary Policy Statement - February 2026"
    const match = firstCell.match(/-\s*(.+)$/);
    vintage = match
      ? match[1].trim().toLowerCase().replace(" ", "")
      : firstCell;
  }

  // ------------------------------------------------------------------
  // 2. PROJECTIONS SHEET
  // ------------------------------------------------------------------

  const ws = wb.Sheets["Projections"];
  if (!ws) throw new Error('Sheet "Projections" not found in MPS XLSX');

  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  });

  // Identifiers are on row 6 (zero-indexed)
  const identifiers = raw[6] as string[];
  const colIndex: Partial<Record<keyof MpsRow, number>> = {};
  for (const [id, field] of Object.entries(NEEDED)) {
    const idx = identifiers.indexOf(id);
    if (idx !== -1) colIndex[field] = idx;
  }

  const today = new Date();
  const rows: MpsRow[] = [];

  for (let i = 7; i < raw.length; i++) {
    const row = raw[i] as unknown[];
    if (!row || !row[0]) continue;

    const date = row[0] instanceof Date ? row[0] : new Date(row[0] as string);
    if (date > today) continue;

    const get = (field: keyof MpsRow): number | null => {
      const col = colIndex[field];
      if (col === undefined) return null;
      const v = row[col];
      return typeof v === "number" ? v : null;
    };

    rows.push({
      date,
      gdp: get("gdp"),
      gdpQpc: get("gdpQpc"),
      gdpApc: get("gdpApc"),
      outputGap: get("outputGap"),
      urate: get("urate"),
      cpiIndex: get("cpiIndex"),
      cpiQpc: get("cpiQpc"),
      cpiApc: get("cpiApc"),
      ocr: get("ocr"),
    });
  }

  return { rows, vintage };
}
