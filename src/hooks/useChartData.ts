// src/hooks/useChartData.ts

import { useMemo }     from "react";
import { useAppStore } from "../store/appStore";
import type { QuarterlyData, ComputedRow } from "../types";
import { dateKey, toQuarterLabel } from "../lib/format";

export interface MergedRow {
  date:          string;
  label:         string;
  ocr:           number | null;
  taylorRate:    number | null;
  inertialRate:  number | null;
  deviation:     number | null;
  compNeutral:   number | null;
  compInfGap:    number | null;
  compOutputGap: number | null;
  rollingMean4q: number | null;
  rollingStd4q:  number | null;
  piStar:        number | null;
  rStar:         number | null;
  outputGap:     number | null;
  urate:         number | null;
  nzdUsd:        number | null;
  inflation:     number | null;
  gdpApc:        number | null;
}

export interface CardLatestInfo {
  // The value to display
  value:          number | null;
  // The date that value is from
  valueDate:      string | null;
  // The most recent date for which any data exists (headline benchmark)
  currentDate:    string | null;
  // How many quarters behind currentDate this value's date is
  quartersLag:    number;
}

export interface LagInfo {
  inflation:  CardLatestInfo;
  taylor:     CardLatestInfo;
  deviation:  CardLatestInfo;
}

function toLabel(dateStr: string): string {
  return toQuarterLabel(dateStr);
}

function getInflationField(raw: QuarterlyData, measure: string): number | null {
  if (measure === "cpiApc")            return raw.cpiApc;
  if (measure === "inflationTrimmed")  return raw.inflationTrimmed;
  if (measure === "inflationSectoral") return raw.inflationSectoral;
  return raw.inflationCoreAvg;
}

function quarterCount(dateStr: string): number {
  const d = new Date(dateStr);
  return d.getUTCFullYear() * 4 + Math.floor(d.getUTCMonth() / 3);
}

function buildCardInfo(
  valueDate:   string | null,
  value:       number | null,
  currentDate: string | null,
): CardLatestInfo {
  if (!valueDate || !currentDate) {
    return { value, valueDate, currentDate, quartersLag: 0 };
  }
  const lag = Math.max(0, quarterCount(currentDate) - quarterCount(valueDate));
  return { value, valueDate, currentDate, quartersLag: lag };
}

export function useLagInfo(): LagInfo {
  const rawSeries        = useAppStore((s) => s.rawSeries);
  const computedSeries   = useAppStore((s) => s.computedSeries);
  const inflationMeasure = useAppStore((s) => s.inflationMeasure);
  const dateRange        = useAppStore((s) => s.dateRange);

  return useMemo(() => {
    // The most recent date we have ANY data for (OCR/headline always current)
    const currentDate = rawSeries
      .filter((r) => r.ocr !== null)
      .at(-1)?.date.split("T")[0] ?? null;

    // --- Inflation ---
    // Find latest row in the full series (not just window) with non-null inflation
    const latestInflRow = [...rawSeries]
      .reverse()
      .find((r) => getInflationField(r, inflationMeasure) !== null);
    const inflDate  = latestInflRow?.date.split("T")[0] ?? null;
    const inflValue = latestInflRow ? getInflationField(latestInflRow, inflationMeasure) : null;

    // --- Taylor Rate ---
    // Taylor is computed from inflation, so it lags by the same amount
    // Find latest computed row with non-null taylorRate within the window
    const latestTaylorRow = [...computedSeries]
      .reverse()
      .find((r) => r.taylorRate !== null);
    const taylorDate  = latestTaylorRow?.date.split("T")[0] ?? null;
    const taylorValue = latestTaylorRow?.taylorRate ?? null;

    // --- Deviation ---
    const latestDevRow = [...computedSeries]
      .reverse()
      .find((r) => r.deviation !== null);
    const devDate  = latestDevRow?.date.split("T")[0] ?? null;
    const devValue = latestDevRow?.deviation ?? null;

    return {
      inflation: buildCardInfo(inflDate,   inflValue,  currentDate),
      taylor:    buildCardInfo(taylorDate,  taylorValue, currentDate),
      deviation: buildCardInfo(devDate,     devValue,    currentDate),
    };
  }, [rawSeries, computedSeries, inflationMeasure, dateRange]);
}

export function useChartData(): MergedRow[] {
  const rawSeries        = useAppStore((s) => s.rawSeries);
  const computedSeries   = useAppStore((s) => s.computedSeries);
  const inflationMeasure = useAppStore((s) => s.inflationMeasure);
  const dateRange        = useAppStore((s) => s.dateRange);

  return useMemo(() => {
    const computedMap = new Map<string, ComputedRow>(
      computedSeries.map((r) => [dateKey(r.date), r])
    );

    return rawSeries
      .filter((r) => {
        const d = dateKey(r.date);
        return d >= dateRange.start && d <= dateRange.end;
      })
      .map((raw): MergedRow => {
        const dateKeyValue = dateKey(raw.date);
        const comp         = computedMap.get(dateKeyValue);
        return {
          date:          dateKeyValue,
          label:         toLabel(dateKeyValue),
          ocr:           raw.ocr,
          taylorRate:    comp?.taylorRate    ?? null,
          inertialRate:  comp?.inertialRate  ?? null,
          deviation:     comp?.deviation     ?? null,
          compNeutral:   comp?.compNeutral   ?? null,
          compInfGap:    comp?.compInfGap    ?? null,
          compOutputGap: comp?.compOutputGap ?? null,
          rollingMean4q: comp?.rollingMean4q ?? null,
          rollingStd4q:  comp?.rollingStd4q  ?? null,
          piStar:        raw.piStar,
          rStar:         raw.rStar,
          outputGap:     raw.outputGap,
          urate:         raw.urate,
          nzdUsd:        raw.nzdUsd,
          gdpApc:        raw.gdpApc,
          inflation:     getInflationField(raw, inflationMeasure),
        };
      });
  }, [rawSeries, computedSeries, inflationMeasure, dateRange]);
}