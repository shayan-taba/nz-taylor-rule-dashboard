// src/store/modelSpecification.ts

import type { InflationMeasure, TaylorParams, OlsResult } from "../types";

/**
 * ONLY variables that affect regression estimation
 * belong here.
 *
 * Do NOT include alpha/beta sliders.
 * Those are user-selected policy parameters,
 * not estimation assumptions.
 */
export interface EstimationSpecification {
  inflationMeasure: InflationMeasure;

  startDate: string;
  endDate: string;

  useRealRStarOverride: boolean;
  realRStarOverride?: number;

  usePiStarOverride: boolean;
  piStarOverride?: number;
}

/**
 * Canonical builder.
 *
 * Single source of truth for:
 * - API payloads
 * - stale detection
 * - caching
 * - reproducibility
 */
export function buildEstimationSpecification(args: {
  inflationMeasure: InflationMeasure;
  dateRange: { start: string; end: string };

  useRealRStarOverride: boolean;
  usePiStarOverride: boolean;

  params: TaylorParams;
}): EstimationSpecification {
  const {
    inflationMeasure,
    dateRange,
    useRealRStarOverride,
    usePiStarOverride,
    params,
  } = args;

  return {
    inflationMeasure,

    startDate: dateRange.start,
    endDate: dateRange.end,

    useRealRStarOverride,

    realRStarOverride: useRealRStarOverride
      ? params.realRStarOverride
      : undefined,

    usePiStarOverride,

    piStarOverride: usePiStarOverride ? params.piStarOverride : undefined,
  };
}

/**
 * Stable deterministic serialization.
 *
 * Suitable for:
 * - stale detection
 * - cache keys
 * - persisted URLs
 * - future memoization
 */
export function serializeEstimationSpecification(
  spec: EstimationSpecification,
): string {
  return JSON.stringify(spec);
}

/**
 * Whether sliders currently match
 * last estimated OLS coefficients.
 */
export function slidersMatchOLS(
  params: TaylorParams,
  ols: OlsResult | null,
): boolean {
  if (!ols) return false;

  return (
    Math.abs(params.alpha - ols.alpha) < 0.001 &&
    Math.abs(params.beta - ols.beta) < 0.001
  );
}
