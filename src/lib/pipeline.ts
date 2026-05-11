// src/lib/pipeline.ts

import fs   from "fs";
import path from "path";
import { parse as parseCsv } from "csv-parse/sync";
import { db }                from "./db";
import { parseMps }          from "./parsers/mps-latest";
import { parseHb1 }          from "./parsers/hb1";

// -------------------------------------------------------------------------
// Helpers
// -------------------------------------------------------------------------

function loadCsv(filename: string): Record<string, string>[] {
  const filePath = path.join(process.cwd(), "src/data", filename);
  const content  = fs.readFileSync(filePath, "utf-8");
  return parseCsv(content, { columns: true, skip_empty_lines: true });
}

/**
 * Normalises any Date to a YYYY-MM-DD key using LOCAL date parts.
 *
 * Do NOT use date.toISOString() — that converts to UTC first, which shifts
 * dates like 2000-03-31T00:00:00+13:00 back to 2000-03-30 in UTC, breaking
 * CSV lookups whose keys are always the calendar quarter-end date.
 *
 * We use getFullYear/getMonth/getDate which respect the Date's wall-clock
 * value as parsed by XLSX (always midnight, no TZ offset applied).
 */
function toDateKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth();

  if (m <= 2)  return `${y}-03-31`;
  if (m <= 5)  return `${y}-06-30`;
  if (m <= 8)  return `${y}-09-30`;
  return `${y}-12-31`;
}

// π* step series — string comparison works because all dates are YYYY-MM-DD
function getPiStar(dateKey: string): number {
  const rows = loadCsv("statics/inflation_target.csv");
  for (let i = rows.length - 1; i >= 0; i--) {
    const { start_date, end_date, pi_star } = rows[i];
    if (dateKey >= start_date && (!end_date || dateKey < end_date)) {
      return parseFloat(pi_star);
    }
  }
  return 2.0;
}

// -------------------------------------------------------------------------
// Pipeline
// -------------------------------------------------------------------------

export async function runFullPipeline(): Promise<void> {
  console.log("[pipeline] Starting...");

  // 1. Load manual CSVs
  const neutralRows   = loadCsv("manuals/neutral_rate.csv");
  const inflationRows = loadCsv("manuals/core_inflation.csv");

  const neutralMap = new Map<string, number>(
    neutralRows.map((r) => [r.date.trim(), parseFloat(r.r_star)])
  );

  const inflationMap = new Map<string, {
    trimmed:  number | null;
    sectoral: number | null;
    coreAvg:  number | null;
  }>(
    inflationRows.map((r) => [
      r.date.trim(),
      {
        trimmed:  r.inflation_trimmed  ? parseFloat(r.inflation_trimmed)  : null,
        sectoral: r.inflation_sectoral ? parseFloat(r.inflation_sectoral) : null,
        coreAvg:  r.inflation_core_avg ? parseFloat(r.inflation_core_avg) : null,
      },
    ])
  );

  // Debug: log first few keys for verification
  console.log("[pipeline] neutral_rate keys (first 3):",
    [...neutralMap.keys()].slice(0, 3));
  console.log("[pipeline] inflation_manual keys (first 3):",
    [...inflationMap.keys()].slice(0, 3));

  // 2. Parse MPS
  console.log("[pipeline] Parsing MPS XLSX...");
  const mpsPath = path.join(process.cwd(), "src/data", "latests/mps-latest.xlsx");
  const { rows: mpsRows, vintage } = parseMps(mpsPath);
  console.log(`[pipeline] MPS: ${mpsRows.length} actual rows (vintage: ${vintage})`);

  // Debug: log first few MPS date keys
  console.log("[pipeline] MPS date keys (first 3):",
    mpsRows.slice(0, 3).map((r) => toDateKey(r.date)));

  // 3. Parse HB1
  console.log("[pipeline] Parsing HB1 XLSX...");
  const hb1Path = path.join(process.cwd(), "src/data", "latests/hb1-latest.xlsx");
  const hb1Rows = parseHb1(hb1Path);
  const hb1Map  = new Map<string, number>(
    hb1Rows.map((r) => [toDateKey(r.date), r.nzdUsd])
  );
  console.log(`[pipeline] HB1: ${hb1Rows.length} quarterly averages`);

  // 4. Merge and upsert
  let upsertCount = 0;
  let neutralHits = 0;
  let inflationHits = 0;

  for (const mps of mpsRows) {
    const dateKey = toDateKey(mps.date);
    const date    = new Date(dateKey);
    const inf     = inflationMap.get(dateKey);
    const rStar   = neutralMap.get(dateKey) ?? null;

    if (rStar !== null) neutralHits++;
    if (inf)            inflationHits++;

    const record = {
      gdp:               mps.gdp,
      gdpQpc:            mps.gdpQpc,
      gdpApc:            mps.gdpApc,
      outputGap:         mps.outputGap,
      urate:             mps.urate,
      cpiIndex:          mps.cpiIndex,
      cpiQpc:            mps.cpiQpc,
      cpiApc:            mps.cpiApc,
      ocr:               mps.ocr,
      nzdUsd:            hb1Map.get(dateKey) ?? null,
      rStar,
      piStar:            getPiStar(dateKey),
      inflationTrimmed:  inf?.trimmed  ?? null,
      inflationSectoral: inf?.sectoral ?? null,
      inflationCoreAvg:  inf?.coreAvg  ?? null,
      dataVintage:       vintage,
    };

    await db.quarterlyData.upsert({
      where:  { date: date },
      update: record,
      create: { date: date, ...record },
    });

    upsertCount++;
  }

  console.log(`[pipeline] Upserted ${upsertCount} rows.`);
  console.log(`[pipeline] r_star matched: ${neutralHits}/${upsertCount}`);
  console.log(`[pipeline] inflation matched: ${inflationHits}/${upsertCount}`);

  // 5. Seed regimes
  await seedRegimes();

  console.log("[pipeline] Done.");
}

async function seedRegimes(): Promise<void> {
  const rows = loadCsv("statics/regime_definitions.csv");
  for (const r of rows) {
    await db.regimeDefinition.upsert({
      where:  { id: r.id },
      update: {
        type:        r.type,
        label:       r.label,
        startDate:   new Date(r.start_date),
        endDate:     r.end_date ? new Date(r.end_date) : null,
        description: r.description || null,
      },
      create: {
        id:          r.id,
        type:        r.type,
        label:       r.label,
        startDate:   new Date(r.start_date),
        endDate:     r.end_date ? new Date(r.end_date) : null,
        description: r.description || null,
      },
    });
  }
  console.log(`[pipeline] Seeded ${rows.length} regime definitions.`);
}