import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import {
  computeTaylorRate,
  computeInertialRate,
  computeRollingStats,
  computeOLS,
  computeDescriptiveStats,
  TaylorParams,
} from "../../../lib/stats";

type InflationMeasure = "cpiApc" | "inflationTrimmed" | "inflationSectoral" | "inflationCoreAvg";

export async function POST(request: NextRequest) {
  const body = await request.json() as {
    alpha?:            number;
    beta?:             number;
    rStarOverride?:    number;
    piStarOverride?:   number;
    inflationMeasure?: InflationMeasure;
    startDate?:        string;
    endDate?:          string;
    runOLS?:           boolean;
    runDescriptive?:   boolean;
  };

  const {
    alpha            = 0.5,
    beta             = 0.5,
    rStarOverride,
    piStarOverride,
    inflationMeasure = "inflationCoreAvg",
    startDate,
    endDate,
    runOLS           = false,
    runDescriptive   = false,
  } = body;

  const params: TaylorParams = { alpha, beta, rStarOverride, piStarOverride };

  // Pull all raw data for the requested window
  const rows = await db.quarterlyData.findMany({
    where: {
      date: {
        gte: startDate ? new Date(startDate) : new Date("2000-01-01"),
        lte: endDate   ? new Date(endDate)   : new Date(),
      },
    },
    orderBy: { date: "asc" },
    select: {
      date:              true,
      ocr:               true,
      outputGap:         true,
      rStar:             true,
      piStar:            true,
      cpiApc:            true,
      inflationTrimmed:  true,
      inflationSectoral: true,
      inflationCoreAvg:  true,
    },
  });

  // Compute Taylor series
  const series = rows.map((row, i) => {
    const inflation = row[inflationMeasure];

    if (
      inflation      === null ||
      row.outputGap  === null ||
      row.rStar      === null ||
      row.piStar      === null
    ) {
      return {
        date:          row.date,
        taylorRate:    null,
        inertialRate:  null,
        deviation:     null,
        compNeutral:   null,
        compInflation: null,
        compInfGap:    null,
        compOutputGap: null,
      };
    }

    const result = computeTaylorRate(
      inflation,
      row.outputGap,
      row.rStar,
      row.piStar,
      params,
      row.ocr ?? undefined,
    );

    // Inertial rate uses previous actual OCR as the lagged value
    const prevOcr = i > 0 ? (rows[i - 1].ocr ?? row.ocr) : row.ocr;
    const inertialRate =
      prevOcr !== null
        ? computeInertialRate(result.taylorRate, prevOcr)
        : null;

    return {
      date:          row.date,
      taylorRate:    result.taylorRate,
      inertialRate,
      deviation:     result.deviation,
      compNeutral:   result.compNeutral,
      compInfGap:    result.compInfGap,
      compOutputGap: result.compOutputGap,
    };
  });

  // Rolling stats on deviation series
  const deviations     = series.map((s) => s.deviation);
  const { mean: rollingMean, std: rollingStd } = computeRollingStats(deviations);
  const seriesWithRolling = series.map((s, i) => ({
    ...s,
    rollingMean4q: rollingMean[i],
    rollingStd4q:  rollingStd[i],
  }));

  // Optional OLS
  let ols = null;
  if (runOLS) {
    const valid = rows.filter(
      (r) =>
        r.ocr          !== null &&
        r[inflationMeasure] !== null &&
        r.outputGap    !== null
    ) as Array<{
      ocr: number;
      outputGap: number;
      piStar: number;
      [key: string]: number | Date | null;
    }>;

    if (valid.length >= 10) {
      try {
        ols = computeOLS(
          valid.map((r) => r.ocr),
          valid.map((r) => (r[inflationMeasure] as number) - r.piStar),
          valid.map((r) => r.outputGap),
        );
      } catch (e) {
        console.warn("[compute] OLS failed:", e);
      }
    }
  }

  // Optional descriptive stats on deviation
  let descriptive = null;
  if (runDescriptive) {
    const validDeviations = deviations.filter((v): v is number => v !== null);
    if (validDeviations.length > 0) {
      descriptive = computeDescriptiveStats(validDeviations);
    }
  }

  return NextResponse.json({
    series:      seriesWithRolling,
    ols,
    descriptive,
  });
}