"use client";
import { useMemo }     from "react";
import { useAppStore } from "../../store/appStore";
import { useChartData } from "../../hooks/useChartData";
import { computeOLS } from "../../lib/stats";
import type { RegimeDefinition } from "../../types";

function toQLabel(dateStr: string): string {
  const d = new Date(dateStr);
  return `Q${Math.ceil((d.getUTCMonth() + 1) / 3)} ${d.getUTCFullYear()}`;
}

function fmt(v: number | null, decimals = 2, signed = false): string {
  if (v === null) return "—";
  const s = v.toFixed(decimals);
  return signed && v > 0 ? `+${s}` : s;
}

function interpretation(alpha: number, beta: number, r2: number, meanDev: number): string {
  const infStr  = alpha > 0.7 ? "strongly" : alpha > 0.4 ? "moderately" : "weakly";
  const gapStr  = beta  > 0.7 ? "strongly" : beta  > 0.4 ? "moderately" : "weakly";
  const biasStr = meanDev > 0.3 ? "hawkish bias" : meanDev < -0.3 ? "dovish bias" : "near-neutral";
  return `${infStr} inflation-reactive, ${gapStr} output-reactive, ${biasStr}`;
}

interface RegimeRow {
  regime:     RegimeDefinition;
  alpha:      number | null;
  beta:       number | null;
  r2:         number | null;
  meanDev:    number | null;
  n:          number;
}

export function RegimeComparisonTable() {
  const rawSeries        = useAppStore((s) => s.rawSeries);
  const computedSeries   = useAppStore((s) => s.computedSeries);
  const regimes          = useAppStore((s) => s.regimes);
  const inflationMeasure = useAppStore((s) => s.inflationMeasure);

  const governors = regimes.filter((r) => r.type === "governor");

  const rows: RegimeRow[] = useMemo(() => {
    const computedMap = new Map(
      computedSeries.map((r) => [r.date.split("T")[0], r])
    );

    return governors.map((regime) => {
      const start = regime.startDate.split("T")[0];
      const end   = regime.endDate?.split("T")[0] ?? new Date().toISOString().split("T")[0];

      // Filter raw series to this regime window
      const windowRaw = rawSeries.filter((r) => {
        const d = r.date.split("T")[0];
        return d >= start && d <= end;
      });

      // Get inflation + gap values
      const valid = windowRaw
        .map((raw) => {
          const dateKey  = raw.date.split("T")[0];
          const comp     = computedMap.get(dateKey);
          const inflation =
            inflationMeasure === "cpiApc"            ? raw.cpiApc :
            inflationMeasure === "inflationTrimmed"  ? raw.inflationTrimmed :
            inflationMeasure === "inflationSectoral" ? raw.inflationSectoral :
            raw.inflationCoreAvg;

          if (
            raw.ocr      === null ||
            inflation    === null ||
            raw.piStar   === null ||
            raw.outputGap === null
          ) return null;

          return {
            ocr:      raw.ocr,
            infGap:   inflation - raw.piStar,
            outputGap: raw.outputGap,
            deviation: comp?.deviation ?? null,
          };
        })
        .filter(Boolean) as {
          ocr: number; infGap: number;
          outputGap: number; deviation: number | null;
        }[];

      const n = valid.length;
      if (n < 10) return { regime, alpha: null, beta: null, r2: null, meanDev: null, n };

      let alpha = null, beta = null, r2 = null;
      try {
        const ols = computeOLS(
          valid.map((v) => v.ocr),
          valid.map((v) => v.infGap),
          valid.map((v) => v.outputGap),
        );
        alpha = ols.alpha;
        beta  = ols.beta;
        r2    = ols.rSquared;
      } catch {}

      const devs = valid.map((v) => v.deviation).filter((v): v is number => v !== null);
      const meanDev = devs.length
        ? devs.reduce((a, b) => a + b, 0) / devs.length
        : null;

      return { regime, alpha, beta, r2, meanDev, n };
    });
  }, [rawSeries, computedSeries, regimes, inflationMeasure]);

  const headerStyle: React.CSSProperties = {
    fontSize:      "9px",
    letterSpacing: "0.1em",
    color:         "var(--text-3)",
    padding:       "8px 12px",
    textAlign:     "left",
    borderBottom:  "1px solid var(--border)",
    fontWeight:    400,
    whiteSpace:    "nowrap",
  };

  const cellStyle: React.CSSProperties = {
    fontSize:   "11px",
    padding:    "10px 12px",
    borderBottom: "1px solid var(--border)",
    fontFamily: "inherit",
    color:      "var(--text)",
  };

  return (
    <div style={{
      background:    "var(--bg-2)",
      border:        "1px solid var(--border)",
      padding:       "20px",
    }}>
      <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-3)", marginBottom: 16 }}>
        GOVERNOR REGIME COMPARISON
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {["GOVERNOR", "PERIOD", "OBS", "α (INF GAP)", "β (OUTPUT GAP)", "R²", "MEAN DEV", "INTERPRETATION"].map((h) => (
                <th key={h} style={headerStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ regime, alpha, beta, r2, meanDev, n }) => {
              const devColor =
                meanDev === null    ? "var(--text-3)"  :
                meanDev > 0.3       ? "var(--hawkish)" :
                meanDev < -0.3      ? "var(--dovish)"  :
                "var(--text-2)";

              const endLabel = regime.endDate
                ? toQLabel(regime.endDate)
                : "Present";

              return (
                <tr
                  key={regime.id}
                  style={{ transition: "background 0.1s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-3)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td style={{ ...cellStyle, color: "var(--text)", fontWeight: 500 }}>
                    {regime.label}
                  </td>
                  <td style={{ ...cellStyle, color: "var(--text-2)", whiteSpace: "nowrap" }}>
                    {toQLabel(regime.startDate)} — {endLabel}
                  </td>
                  <td style={{ ...cellStyle, color: "var(--text-3)" }}>
                    {n}
                  </td>
                  <td style={{ ...cellStyle }}>
                    {alpha !== null ? (
                      <span style={{ color: alpha > 0.5 ? "var(--accent)" : "var(--text-2)" }}>
                        {alpha.toFixed(3)}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ ...cellStyle }}>
                    {beta !== null ? (
                      <span style={{ color: beta > 0.5 ? "var(--accent)" : "var(--text-2)" }}>
                        {beta.toFixed(3)}
                      </span>
                    ) : "—"}
                  </td>
                  <td style={{ ...cellStyle, color: "var(--text-2)" }}>
                    {r2 !== null ? r2.toFixed(3) : "—"}
                  </td>
                  <td style={{ ...cellStyle, color: devColor }}>
                    {meanDev !== null ? (meanDev > 0 ? "+" : "") + meanDev.toFixed(2) + "pp" : "—"}
                  </td>
                  <td style={{ ...cellStyle, color: "var(--text-3)", fontSize: "10px", maxWidth: 280 }}>
                    {alpha !== null && beta !== null && meanDev !== null && r2 !== null
                      ? interpretation(alpha, beta, r2, meanDev)
                      : n < 10 ? "Insufficient data" : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12, fontSize: "10px", color: "var(--text-3)", lineHeight: 1.6 }}>
        OLS estimated coefficients from regressing actual OCR on inflation gap and output gap within each governor's term.
        Inflation measure: <span style={{ color: "var(--text-2)" }}>
          {{ cpiApc: "CPI Headline", inflationTrimmed: "Trimmed Mean 30%", inflationSectoral: "Sectoral Factor Model", inflationCoreAvg: "RBNZ Core Average" }[inflationMeasure]}
        </span>.
        Changing the inflation toggle above will recompute all estimates.
      </div>
    </div>
  );
}