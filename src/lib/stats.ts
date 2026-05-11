// src/lib/stats.ts

import { create, all } from "mathjs";

const math = create(all);

// -------------------------------------------------------------------------
// Types
// -------------------------------------------------------------------------

export interface TaylorParams {
  alpha:          number;  // inflation gap coefficient (default 0.5)
  beta:           number;  // output gap coefficient   (default 0.5)
  realRStarOverride?: number;  // overrides per-row r* when set (what-if slider)
  piStarOverride?: number; // overrides per-row π* when set (what-if slider)
}

export interface TaylorResult {
  taylorRate:     number;
  compNeutral:    number; // r* nominal — the baseline
  compInfGap:     number; // α(π - π*)
  compOutputGap:  number; // β·gap
  deviation:      number | null;
}

export interface OlsResult {
  alpha:     number;
  beta:      number;
  intercept: number;
  rSquared:  number;
  rmse:      number;
}

export interface DescriptiveStats {
  mean:      number;
  std:       number;
  skewness:  number;
  max:       number;
  min:       number;
  pctAbove:  number; // % of observations > 0
  pctBelow:  number; // % of observations < 0
}

// -------------------------------------------------------------------------
// Taylor Rule
// i_t = r*_t + α(π_t − π*_t) + β(gap_t)
// -------------------------------------------------------------------------

export function computeTaylorRate(
  inflation:  number,  // π_t — year-on-year CPI or core measure
  outputGap:  number,  // gap_t — % of potential output
  rStar:      number,  // r*_t — NOMINAL neutral rate from manual CSV
  piStar:     number,  // π*_t — from inflation_target.csv step series
  params:     TaylorParams,
  actualOcr?: number,  // for deviation calculation
): TaylorResult {
  const r =
  params.realRStarOverride !== undefined
    ? params.realRStarOverride + inflation // If real neutral override give,
    // we must add inflation rate (or long run inflation expectations).
    : rStar; // rStar is already neutral per the MPS
  const pi = params.piStarOverride ?? piStar;
  const { alpha, beta } = params;

  const compNeutral   = r;
  const compInfGap    = alpha * (inflation - pi);
  const compOutputGap = beta  * outputGap;
  const taylorRate    = r + compInfGap + compOutputGap;
  const deviation     = actualOcr !== undefined ? actualOcr - taylorRate : null;

  return { taylorRate, compNeutral, compInfGap, compOutputGap, deviation };
}


// -------------------------------------------------------------------------
// Inertial Taylor Rule
// i_t = ρ·i_{t-1} + (1-ρ)·taylor_t
// -------------------------------------------------------------------------

export function computeInertialRate(
  taylorRate:    number,
  prevActualOcr: number,
  rho = 0.85,
): number {
  return rho * prevActualOcr + (1 - rho) * taylorRate;
}

// -------------------------------------------------------------------------
// Rolling statistics (window = 4 quarters by default)
// -------------------------------------------------------------------------

export function computeRollingStats(
  series: (number | null)[],
  window = 4,
): { mean: (number | null)[]; std: (number | null)[] } {
  const mean: (number | null)[] = [];
  const std:  (number | null)[] = [];

  for (let i = 0; i < series.length; i++) {
    if (i < window - 1) { mean.push(null); std.push(null); continue; }

    const slice = series
      .slice(i - window + 1, i + 1)
      .filter((v): v is number => v !== null);

    if (slice.length < window) { mean.push(null); std.push(null); continue; }

    const avg      = slice.reduce((a, b) => a + b, 0) / slice.length;
    const variance = slice.reduce((a, b) => a + Math.pow(b - avg, 2), 0) / slice.length;
    mean.push(avg);
    std.push(Math.sqrt(variance));
  }

  return { mean, std };
}

// -------------------------------------------------------------------------
// OLS regression (no intercept):
// (OCR - r*) = α·inf_gap + β·output_gap + ε
//
// Used in all cases because r* is always subtracted from LHS first,
// whether r* comes from the MPS time-varying series or a slider override.
// R² is uncentered (appropriate for no-intercept model).
// -------------------------------------------------------------------------

export function computeOLS(
  lhsValues:     number[], // OCR - r* per row (pre-computed by caller)
  inflationGaps: number[], // π - π* per row
  outputGaps:    number[],
): OlsResult {
  const n = lhsValues.length;
  if (n < 10) throw new Error("Need at least 10 observations for OLS");

  // X has no intercept column: [infGap, outputGap]
  const y = math.matrix(lhsValues.map((v) => [v]));
  const X = math.matrix(
    lhsValues.map((_, i) => [inflationGaps[i], outputGaps[i]])
  );

  const Xt     = math.transpose(X);
  const XtX    = math.multiply(Xt, X);
  const XtXinv = math.inv(XtX as math.Matrix);
  const Xty    = math.multiply(Xt, y);
  const betas  = math.multiply(XtXinv, Xty) as math.Matrix;

  const b = (betas.toArray() as number[][]).map((r) => r[0]);
  const [alphaEst, betaEst] = b;

  const Xarr = (X as math.Matrix).toArray() as number[][];

  // Uncentered R² — correct for no-intercept model
  let ssRes = 0, ssTotUncentered = 0;
  for (let i = 0; i < n; i++) {
    const pred = alphaEst * Xarr[i][0] + betaEst * Xarr[i][1];
    ssRes           += Math.pow(lhsValues[i] - pred, 2);
    ssTotUncentered += Math.pow(lhsValues[i], 2);
  }

  return {
    alpha:     alphaEst,
    beta:      betaEst,
    intercept: 0, // always zero — no intercept in this model
    rSquared:  ssTotUncentered === 0 ? 0 : 1 - ssRes / ssTotUncentered,
    rmse:      Math.sqrt(ssRes / n),
  };
}

// -------------------------------------------------------------------------
// R² of a predicted series against actuals (for Taylor/Inertial display)
// Standard centred R² — not the OLS uncentered version.
// -------------------------------------------------------------------------

export function computeSeriesR2(
  actual:    (number | null)[],
  predicted: (number | null)[],
): number | null {
  const pairs = actual
    .map((a, i) => ({ a, p: predicted[i] }))
    .filter((x): x is { a: number; p: number } => x.a !== null && x.p !== null);

  const n = pairs.length;
  if (n < 4) return null;

  const mean   = pairs.reduce((s, x) => s + x.a, 0) / n;
  let ssTot    = 0;
  let ssRes    = 0;
  for (const { a, p } of pairs) {
    ssTot += (a - mean) ** 2;
    ssRes += (a - p)    ** 2;
  }
  return ssTot === 0 ? null : 1 - ssRes / ssTot;
}

// -------------------------------------------------------------------------
// Descriptive statistics on a deviation series
// -------------------------------------------------------------------------

export function computeDescriptiveStats(series: number[]): DescriptiveStats {
  const n    = series.length;
  const mean = series.reduce((a, b) => a + b, 0) / n;
  const variance = series.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  const std  = Math.sqrt(variance);
  const skewness =
    std === 0
      ? 0
      : series.reduce((a, b) => a + Math.pow((b - mean) / std, 3), 0) / n;

  return {
    mean,
    std,
    skewness,
    max:      Math.max(...series),
    min:      Math.min(...series),
    pctAbove: (series.filter((v) => v > 0).length / n) * 100,
    pctBelow: (series.filter((v) => v < 0).length / n) * 100,
  };
}

// -------------------------------------------------------------------------
// Pearson correlation coefficient
// -------------------------------------------------------------------------

export function computeCorrelation(x: number[], y: number[]): number {
  const n  = x.length;
  const mx = x.reduce((a, b) => a + b, 0) / n;
  const my = y.reduce((a, b) => a + b, 0) / n;
  const num = x.reduce((a, xi, i) => a + (xi - mx) * (y[i] - my), 0);
  const den = Math.sqrt(
    x.reduce((a, xi) => a + Math.pow(xi - mx, 2), 0) *
    y.reduce((a, yi) => a + Math.pow(yi - my, 2), 0)
  );
  return den === 0 ? 0 : num / den;
}