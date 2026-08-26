// src/app/api/compute/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import {
  computeTaylorRate,
  computeInertialRate,
  computeRollingStats,
  computeOLS,
  computeDescriptiveStats,
  computeSeriesR2,
  TaylorParams,
} from "../../../lib/stats";
import { InflationMeasure } from "../../../types";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    alpha?: number;
    beta?: number;
    realRStarOverride?: number;
    piStarOverride?: number;
    inflationMeasure?: InflationMeasure;
    startDate?: string;
    endDate?: string;
    runOLS?: boolean;
    runDescriptive?: boolean;
  };

  const {
    alpha = 0.5,
    beta = 0.5,
    realRStarOverride,
    piStarOverride,
    inflationMeasure = "inflationCoreAvg",
    startDate,
    endDate,
    runOLS = false,
    runDescriptive = false,
  } = body;

  const params: TaylorParams = { alpha, beta, realRStarOverride, piStarOverride };

  const rows = await db.quarterlyData.findMany({
    where: {
      date: {
        gte: startDate ? new Date(startDate) : new Date("2000-01-01"),
        lte: endDate ? new Date(endDate) : new Date(),
      },
    },
    orderBy: { date: "asc" },
    select: {
      date: true,
      ocr: true,
      outputGap: true,
      rStar: true,
      piStar: true,
      cpiApc: true,
      inflationTrimmed: true,
      inflationSectoral: true,
      inflationCoreAvg: true,
      urate: true,
      nzdUsd: true,
    },
  });

  // ── Compute Taylor series ─────────────────────────────────────────

  const series = rows.map((row, i) => {
    const inflation: number | null = row[inflationMeasure as keyof typeof row] as number | null;

    if (
      inflation === null ||
      row.outputGap === null ||
      row.rStar === null ||
      row.piStar === null
    ) {
      return {
        date: row.date,
        taylorRate: null as number | null,
        inertialRate: null as number | null,
        deviation: null as number | null,
        compNeutral: null as number | null,
        compInfGap: null as number | null,
        compOutputGap: null as number | null,
        urate: row.urate,
        nzdUsd: row.nzdUsd,
      };
    }

    const result = computeTaylorRate(
      inflation,
      row.outputGap,
      row.rStar,
      row.piStar,
      params,
      row.ocr ?? undefined
    );

    // Inertial rate uses previous actual OCR as the lagged value
    const prevOcr = i > 0 ? (rows[i - 1].ocr ?? row.ocr) : row.ocr;
    const inertialRate =
      prevOcr !== null
        ? computeInertialRate(result.taylorRate, prevOcr)
        : null;

    return {
      date: row.date,
      taylorRate: result.taylorRate,
      inertialRate,
      deviation: result.deviation,
      compNeutral: result.compNeutralNominal,
      compInfGap: result.compInfGap,
      compOutputGap: result.compOutputGap,
      urate: row.urate,
      nzdUsd: row.nzdUsd,
    };
  });

  // ── Rolling stats ─────────────────────────────────────────────────
  const deviations = series.map((s) => s.deviation);
  const { mean: rollingMean, std: rollingStd } = computeRollingStats(deviations);

  const seriesOut = series.map((s, i) => ({
    ...s,
    date: (s.date as Date).toISOString().slice(0, 10),
    rollingMean4q: rollingMean[i],
    rollingStd4q: rollingStd[i],
  }));

  // ── R² for Taylor and Inertial on any render ────────────────────
  const actualOcrs = rows.map((r) => r.ocr);
  const taylorRates = series.map((s) => s.taylorRate);
  const inertialRates = series.map((s) => s.inertialRate);

  const ocrFitR2 = computeSeriesR2(actualOcrs, taylorRates);
  const inertialR2 = computeSeriesR2(actualOcrs, inertialRates);

  // ── Optional OLS ──────────────────────────────────────────────────
  // LHS = OCR - r* (whichever r* applies: override or MPS series)
  // No intercept — r* is already subtracted.
  let ols = null;
  if (runOLS) {
    const valid = rows.filter((r) => {
      const inflation = r[inflationMeasure as keyof typeof r] as number | null;
      return (
        r.ocr !== null &&
        inflation !== null &&
        r.outputGap !== null &&
        r.rStar !== null &&
        r.piStar !== null
      );
    }) as Array<{
      ocr: number;
      outputGap: number;
      rStar: number;
      piStar: number;
      [key: string]: number | Date | null;
    }>;

    if (valid.length >= 10) {
      try {
        // Resolve r* per row (respects override)
        const lhsValues = valid.map((r) => {
          const inflation = r[inflationMeasure] as number;
          const effectiveRStar =
            realRStarOverride !== undefined
              ? realRStarOverride + inflation
              : r.rStar;
          return r.ocr - effectiveRStar;
        });

        // Resolve π* per row (respects override)
        const inflGaps = valid.map((r) => {
          const inflation = r[inflationMeasure] as number;
          const effectivePiStar = piStarOverride ?? r.piStar;
          return inflation - effectivePiStar;
        });

        const outGaps = valid.map((r) => r.outputGap);

        ols = computeOLS(lhsValues, inflGaps, outGaps);
      } catch (e) {
        console.warn("[compute] OLS failed:", e);
      }
    }
  }

  // ── Optional descriptive stats ────────────────────────────────────
  let descriptive = null;
  if (runDescriptive) {
    const validDeviations = deviations.filter((v): v is number => v !== null);
    if (validDeviations.length > 0) {
      descriptive = computeDescriptiveStats(validDeviations);
    }
  }

  return NextResponse.json({
    series: seriesOut,
    ols,
    descriptive,
    ocrFitR2,
    inertialR2,
  });
}