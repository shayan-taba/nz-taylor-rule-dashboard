import { useMemo } from "react";
import { useAppStore } from "./appStore";
import type { QuarterlyData, ComputedRow } from "../types";

export interface MergedRow {
  date:          string;
  label:         string; // "Q1 2024" style
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
  inflation:     number | null; // active inflation measure
}

function toLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const q = Math.ceil((d.getUTCMonth() + 1) / 3);
  return `Q${q} ${d.getUTCFullYear()}`;
}

export function useChartData(): MergedRow[] {
  const rawSeries      = useAppStore((s) => s.rawSeries);
  const computedSeries = useAppStore((s) => s.computedSeries);
  const inflationMeasure = useAppStore((s) => s.inflationMeasure);
  const dateRange      = useAppStore((s) => s.dateRange);

  return useMemo(() => {
    const computedMap = new Map<string, ComputedRow>(
      computedSeries.map((r) => [r.date.split("T")[0], r])
    );

    const inRange = rawSeries.filter((r) => {
      const d = r.date.split("T")[0];
      return d >= dateRange.start && d <= dateRange.end;
    });

    return inRange.map((raw): MergedRow => {
      const dateKey = raw.date.split("T")[0];
      const comp    = computedMap.get(dateKey);

      const inflation =
        inflationMeasure === "cpiApc"            ? raw.cpiApc :
        inflationMeasure === "inflationTrimmed"  ? raw.inflationTrimmed :
        inflationMeasure === "inflationSectoral" ? raw.inflationSectoral :
                                                   raw.inflationCoreAvg;

      return {
        date:          dateKey,
        label:         toLabel(dateKey),
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
        inflation,
      };
    });
  }, [rawSeries, computedSeries, inflationMeasure, dateRange]);
}