// RBNZ B1 (Exchange rates and Trade Weighted Index) Prices Parser

import * as XLSX from "xlsx";
import fs from "fs";
import path from "path";

const NZDUSD_SERIES_ID = "EXR.MS11.D06";

export interface QuarterlyNzdUsd {
  date: Date;
  nzdUsd: number;
}

export function parseHb1(filePath: string): QuarterlyNzdUsd[] {
  // Read local Excel file into buffer
  const buffer = fs.readFileSync(filePath);

  // Parse workbook (Excel file) using XLSX
  const wb = XLSX.read(buffer, { type: "buffer", cellDates: true });

  // Get "Data" sheet from workbook
  const ws = wb.Sheets["Data"];
  if (!ws) throw new Error('Sheet "Data" not found in HB1 XLSX');

  // Convert sheet into raw 2D array (rows/columns)
  const raw = XLSX.utils.sheet_to_json<unknown[]>(ws, {
    header: 1,
    raw: true,
    defval: null,
  });

  // Row 4 contains series IDs
  const seriesIds = raw[4] as string[];

  // Find column index for NZD/USD series
  const nzdUsdCol = seriesIds.indexOf(NZDUSD_SERIES_ID);
  if (nzdUsdCol === -1)
    throw new Error(`Series ${NZDUSD_SERIES_ID} not found in HB1`);

  // Store monthly observations before aggregation
  const monthly: { date: Date; nzdUsd: number }[] = [];

  // Iterate through data rows (starting row 5)
  for (let i = 5; i < raw.length; i++) {
    const row = raw[i] as unknown[];

    // Skip empty rows
    if (!row || !row[0]) continue;

    // Parse date (Excel may already provide Date object or string)
    const date = row[0] instanceof Date ? row[0] : new Date(row[0] as string);

    // Extract NZD/USD value
    const val = row[nzdUsdCol];

    // Keep only valid numeric values
    if (typeof val === "number") {
      monthly.push({ date, nzdUsd: val });
    }
  }

  // Convert monthly data into quarterly averages
  return averageToQuarterly(monthly);
}

// Determine quarter-end date for any given date
function quarterEnd(date: Date): Date {
  const y = date.getFullYear();
  const m = date.getMonth();

  if (m <= 2) return new Date(y, 2, 31);  // Q1 end (Mar 31)
  if (m <= 5) return new Date(y, 5, 30);  // Q2 end (Jun 30)
  if (m <= 8) return new Date(y, 8, 30);  // Q3 end (Sep 30)

  return new Date(y, 11, 31);             // Q4 end (Dec 31)
}

// Aggregate monthly values into quarterly averages
function averageToQuarterly(
  monthly: { date: Date; nzdUsd: number }[]
): QuarterlyNzdUsd[] {
  const buckets = new Map<string, { qEnd: Date; values: number[] }>();

  // Group monthly values by quarter
  for (const { date, nzdUsd } of monthly) {
    const qEnd = quarterEnd(date);

    // Use ISO date string as map key
    const key = qEnd.toISOString().split("T")[0];

    if (!buckets.has(key)) {
      buckets.set(key, { qEnd, values: [] });
    }

    buckets.get(key)!.values.push(nzdUsd);
  }

  // Compute quarterly averages
  return Array.from(buckets.values())
    .map(({ qEnd, values }) => ({
      date: qEnd,
      nzdUsd: values.reduce((a, b) => a + b, 0) / values.length,
    }))
    // Sort chronologically
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}