// src/components/analytics/RegimeComparisonTable.tsx

"use client";
import { useMemo } from "react";
import { useAppStore } from "../../store/appStore";
import { computeOLS } from "../../lib/stats";
import type { RegimeDefinition } from "../../types";

function toQLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `Q${Math.ceil((d.getUTCMonth() + 1) / 3)} ${d.getUTCFullYear()}`;
}

function fmt(v: number | null, decimals = 2): string {
  if (v === null) return "—";
  return v.toFixed(decimals);
}

function interpretation(alpha: number, beta: number, meanDev: number): string {
  const infStr =
    alpha > 0.7 ? "strongly" : alpha > 0.4 ? "moderately" : "weakly";
  const gapStr = beta > 0.7 ? "strongly" : beta > 0.4 ? "moderately" : "weakly";
  const biasStr =
    meanDev > 0.3
      ? "hawkish bias"
      : meanDev < -0.3
        ? "dovish bias"
        : "near-neutral";
  return `${infStr} inflation-reactive, ${gapStr} output-reactive, ${biasStr}`;
}

interface RegimeRow {
  regime: RegimeDefinition;
  alpha: number | null;
  beta: number | null;
  r2: number | null;
  rmse: number | null;
  meanDev: number | null;
  n: number;
}

const INFLATION_LABELS: Record<string, string> = {
  cpiApc: "CPI Headline",
  inflationTrimmed: "Trimmed Mean 30%",
  inflationSectoral: "Sectoral Factor Model",
  inflationCoreAvg: "RBNZ Core Average",
};

export function RegimeComparisonTable() {
  const rawSeries = useAppStore((s) => s.rawSeries);
  const computedSeries = useAppStore((s) => s.computedSeries);
  const regimes = useAppStore((s) => s.regimes);
  const inflationMeasure = useAppStore((s) => s.inflationMeasure);
  const dateRange = useAppStore((s) => s.dateRange);

  const governors = regimes.filter((r) => r.type === "governor");

  const rows: RegimeRow[] = useMemo(() => {
    // Build a map of computed deviations by date — used for meanDev
    // meanDev reflects the SELECTED window, not the full regime window
    const computedMap = new Map(
      computedSeries.map((r) => [r.date.split("T")[0], r]),
    );

    return governors.map((regime) => {
      const regimeStart = regime.startDate.split("T")[0];
      const regimeEnd =
        regime.endDate?.split("T")[0] ?? new Date().toISOString().split("T")[0];

      // ── OLS: always uses full regime window (not selected date range) ──
      // This makes α, β, R² regime-intrinsic — independent of what the
      // user has selected in the date picker.
      const regimeRaw = rawSeries.filter((r) => {
        const d = r.date.split("T")[0];
        return d >= regimeStart && d <= regimeEnd;
      });

      const getInflation = (raw: (typeof regimeRaw)[0]): number | null => {
        if (inflationMeasure === "cpiApc") return raw.cpiApc;
        if (inflationMeasure === "inflationTrimmed")
          return raw.inflationTrimmed;
        if (inflationMeasure === "inflationSectoral")
          return raw.inflationSectoral;
        return raw.inflationCoreAvg;
      };

      const olsValid = regimeRaw
        .map((raw) => {
          const inflation = getInflation(raw);
          if (
            raw.ocr === null ||
            inflation === null ||
            raw.piStar === null ||
            raw.outputGap === null ||
            raw.rStar === null // need r* to subtract from OCR
          )
            return null;
          return {
            // Correct LHS: OCR - r* (time-varying, no override for regime table)
            lhs: raw.ocr - raw.rStar,
            infGap: inflation - raw.piStar,
            outputGap: raw.outputGap,
          };
        })
        .filter(Boolean) as {
        lhs: number;
        infGap: number;
        outputGap: number;
      }[];

      const n = olsValid.length;
      let alpha = null,
        beta = null,
        r2 = null,
        rmse = null;

      if (n >= 10) {
        try {
          const ols = computeOLS(
            olsValid.map((v) => v.lhs), // OCR - r* (no intercept)
            olsValid.map((v) => v.infGap),
            olsValid.map((v) => v.outputGap),
          );
          alpha = ols.alpha;
          beta = ols.beta;
          r2 = ols.rSquared;
          rmse = ols.rmse;
        } catch {}
      }

      // ── meanDev: uses SELECTED window intersected with regime window ──
      // This is the only column that responds to the date range selector.
      const windowStart = dateRange.start;
      const windowEnd = dateRange.end;

      const windowDevs = rawSeries
        .filter((r) => {
          const d = r.date.split("T")[0];
          return (
            d >= regimeStart &&
            d <= regimeEnd &&
            d >= windowStart &&
            d <= windowEnd
          );
        })
        .map((r) => {
          const dateKey = r.date.split("T")[0];
          return computedMap.get(dateKey)?.deviation ?? null;
        })
        .filter((v): v is number => v !== null);

      const meanDev = windowDevs.length
        ? windowDevs.reduce((a, b) => a + b, 0) / windowDevs.length
        : null;

      return { regime, alpha, beta, r2, rmse, meanDev, n };
    });
  }, [rawSeries, computedSeries, regimes, inflationMeasure, dateRange]);

  const headerStyle: React.CSSProperties = {
    fontSize: "9px",
    letterSpacing: "0.1em",
    color: "var(--text-3)",
    padding: "8px 12px",
    textAlign: "left",
    borderBottom: "1px solid var(--border)",
    fontWeight: 400,
    whiteSpace: "nowrap",
  };

  const cellStyle: React.CSSProperties = {
    fontSize: "11px",
    padding: "10px 12px",
    borderBottom: "1px solid var(--border)",
    fontFamily: "inherit",
    color: "var(--text)",
  };

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        padding: "20px",
      }}
    >
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.1em",
          color: "var(--text-3)",
          marginBottom: 16,
        }}
      >
        GOVERNOR REGIME COMPARISON
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {[
                "GOVERNOR",
                "PERIOD",
                "OBS (OLS)",
                "α (INF GAP)",
                "β (OUTPUT GAP)",
                "R² (UNCENTERED)",
                "RMSE",
                "MEAN DEV †",
                "INTERPRETATION",
              ].map((h) => (
                <th key={h} style={headerStyle}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ regime, alpha, beta, r2, rmse, meanDev, n }) => {
              const devColor =
                meanDev === null
                  ? "var(--text-3)"
                  : meanDev > 0.3
                    ? "var(--hawkish)"
                    : meanDev < -0.3
                      ? "var(--dovish)"
                      : "var(--text-2)";

              return (
                <tr
                  key={regime.id}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-3)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td style={{ ...cellStyle, fontWeight: 500 }}>
                    {regime.label}
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: "var(--text-2)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {toQLabel(regime.startDate)} —{" "}
                    {regime.endDate ? toQLabel(regime.endDate) : "Present"}
                  </td>
                  <td style={{ ...cellStyle, color: "var(--text-3)" }}>{n}</td>
                  <td style={cellStyle}>
                    {alpha !== null ? (
                      <span
                        style={{
                          color:
                            alpha > 0.5 ? "var(--accent)" : "var(--text-2)",
                        }}
                      >
                        {fmt(alpha, 3)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={cellStyle}>
                    {beta !== null ? (
                      <span
                        style={{
                          color: beta > 0.5 ? "var(--accent)" : "var(--text-2)",
                        }}
                      >
                        {fmt(beta, 3)}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td style={{ ...cellStyle, color: "var(--text-2)" }}>
                    {r2 !== null ? fmt(r2, 3) : "—"}
                  </td>
                  <td style={{ ...cellStyle, color: "var(--text-2)" }}>
                    {rmse !== null ? fmt(rmse, 3) + "pp" : "—"}
                  </td>
                  <td style={{ ...cellStyle, color: devColor }}>
                    {meanDev !== null
                      ? (meanDev > 0 ? "+" : "") + fmt(meanDev, 2) + "pp"
                      : "—"}
                  </td>
                  <td
                    style={{
                      ...cellStyle,
                      color: "var(--text-3)",
                      fontSize: "10px",
                      maxWidth: 280,
                    }}
                  >
                    {alpha !== null && beta !== null && meanDev !== null
                      ? interpretation(alpha, beta, meanDev)
                      : n < 10
                        ? "Insufficient data"
                        : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footnote explaining window-dependence clearly */}
      <div
        style={{
          marginTop: 16,
          fontSize: "10px",
          color: "var(--text-3)",
          lineHeight: 1.7,
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div>
          <span style={{ color: "var(--text-2)" }}>α, β, R², RMSE</span> are
          estimated by OLS over each governor's{" "}
          <span style={{ color: "var(--text-2)" }}>full term</span> (fixed
          regime window). They do not change when you adjust the date range
          selector or switch regime tabs — they always reflect the complete
          historical record for that governor. The regression is (OCR − r*) =
          α·(π − π*) + β·gap with no intercept, consistent with the nominal r*
          formulation used throughout. Inflation measure:{" "}
          <span style={{ color: "var(--text-2)" }}>
            {INFLATION_LABELS[inflationMeasure] ?? inflationMeasure}
          </span>{" "}
          (changing this toggle will recompute all estimates).
        </div>
        <div>
          <span style={{ color: "var(--accent-2)" }}>† Mean Dev</span> is the
          only column that responds to the date range selector. It shows the
          average deviation within the intersection of the governor's term and
          your currently selected window — useful for isolating a sub-period
          (e.g. Orr's response during COVID only). When the full history is
          selected it equals the governor's full-term average.
        </div>
      </div>
    </div>
  );
}
