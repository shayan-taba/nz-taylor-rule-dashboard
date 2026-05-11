// src/store/appStore.ts

import { create }        from "zustand";
import type {
  QuarterlyData, ComputedRow, RegimeDefinition,
  InflationMeasure, TaylorParams, OlsResult, DescriptiveStats,
} from "../types";

const DEFAULT_PARAMS: TaylorParams = { alpha: 0.5, beta: 0.5 };
const START_DATE = "2000-03-31";

// Captures which overrides were active when OLS was run —
// shown in the interpretation text in ParameterPlayground
export interface OlsContext {
  useRealRStarOverride:  boolean;
  usePiStarOverride: boolean;
  realRStarOverride?:    number;
  piStarOverride?:   number;
}

interface AppStore {
  // Data
  rawSeries:        QuarterlyData[];
  computedSeries:   ComputedRow[];
  regimes:          RegimeDefinition[];

  // UI
  activeRegime:      string | null;
  dateRange:         { start: string; end: string };
  inflationMeasure:  InflationMeasure;
  params:            TaylorParams;
  useRealRStarOverride:  boolean;
  usePiStarOverride: boolean;
  showInertial:      boolean;

  // Results
  olsResult:         OlsResult | null;
  olsContext:        OlsContext | null;
  descriptiveStats:  DescriptiveStats | null;

  // Always-on model fit stats (updated on every fetchComputed)
  ocrFitR2:          number | null;
  inertialR2:        number | null;

  // Loading
  isLoadingRaw:      boolean;
  isLoadingComputed: boolean;

  // Actions
  setRegime:             (id: string | null) => void;
  setDateRange:          (range: { start: string; end: string }) => void;
  setParams:             (p: Partial<TaylorParams>) => void;
  setInflationMeasure:   (m: InflationMeasure) => void;
  setUseRealRStarOverride:   (v: boolean) => void;
  setUsePiStarOverride:  (v: boolean) => void;
  setShowInertial:       (v: boolean) => void;
  fetchRaw:              () => Promise<void>;
  fetchRegimes:          () => Promise<void>;
  fetchComputed:         (opts?: { runOLS?: boolean }) => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => {
  const today = new Date().toISOString().split("T")[0];

  return {
    rawSeries:         [],
    computedSeries:    [],
    regimes:           [],
    activeRegime:      null,
    dateRange:         { start: START_DATE, end: today },
    inflationMeasure:  "cpiApc",
    params:            DEFAULT_PARAMS,
    useRealRStarOverride:  false,
    usePiStarOverride: false,
    showInertial:      true,
    olsResult:         null,
    olsContext:        null,
    descriptiveStats:  null,
    ocrFitR2:          null,
    inertialR2:        null,
    isLoadingRaw:      false,
    isLoadingComputed: false,

    setRegime: (id) => {
      const { regimes } = get();
      const today = new Date().toISOString().split("T")[0];
      if (id === null) {
        set({
          activeRegime: null,
          dateRange:    { start: START_DATE, end: today },
          olsResult:    null,
          olsContext:   null,
        });
      } else {
        const regime = regimes.find((r) => r.id === id);
        if (regime) {
          set({
            activeRegime: id,
            dateRange: {
              start: regime.startDate.split("T")[0],
              end:   regime.endDate ? regime.endDate.split("T")[0] : today,
            },
            olsResult:  null,
            olsContext: null,
          });
        }
      }
      get().fetchComputed();
    },

    setDateRange: (range) => {
      set({ dateRange: range, activeRegime: null, olsResult: null, olsContext: null });
      get().fetchComputed();
    },

    setParams: (p) => {
      set((s) => ({ params: { ...s.params, ...p } }));
    },

    setInflationMeasure: (m) => {
      set({ inflationMeasure: m });
      get().fetchComputed();
    },

    setUseRealRStarOverride:  (v) => set({ useRealRStarOverride: v }),
    setUsePiStarOverride: (v) => set({ usePiStarOverride: v }),
    setShowInertial:      (v) => set({ showInertial: v }),

    fetchRaw: async () => {
      set({ isLoadingRaw: true });
      try {
        const res  = await fetch("/api/series");
        const data = await res.json();
        set({ rawSeries: data });
      } finally {
        set({ isLoadingRaw: false });
      }
    },

    fetchRegimes: async () => {
      const res  = await fetch("/api/regimes");
      const data = await res.json();
      set({ regimes: data });
    },

    fetchComputed: async (opts = {}) => {
      const {
        dateRange, inflationMeasure, params,
        useRealRStarOverride, usePiStarOverride,
      } = get();

      set({ isLoadingComputed: true });

      // Snapshot the override context at the moment OLS is triggered
      const currentContext: OlsContext = {
        useRealRStarOverride,
        usePiStarOverride,
        realRStarOverride:  useRealRStarOverride  ? params.realRStarOverride  : undefined,
        piStarOverride: usePiStarOverride ? params.piStarOverride : undefined,
      };

      try {
        const body = {
          alpha:          params.alpha,
          beta:           params.beta,
          realRStarOverride:  useRealRStarOverride  ? params.realRStarOverride  : undefined,
          piStarOverride: usePiStarOverride ? params.piStarOverride : undefined,
          inflationMeasure,
          startDate:      dateRange.start,
          endDate:        dateRange.end,
          runOLS:         opts.runOLS ?? false,
        };

        const res  = await fetch("/api/compute", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        });

        const data = await res.json();

        set({
          computedSeries: data.series,
          // Always update fit stats
          ocrFitR2:       data.ocrFitR2   ?? null,
          inertialR2:     data.inertialR2 ?? null,
          // Only update OLS result + context if OLS was actually run
          ...(data.ols !== null && data.ols !== undefined
            ? { olsResult: data.ols, olsContext: currentContext }
            : {}),
          ...(data.descriptive !== null && data.descriptive !== undefined
            ? { descriptiveStats: data.descriptive }
            : {}),
        });
      } finally {
        set({ isLoadingComputed: false });
      }
    },
  };
});