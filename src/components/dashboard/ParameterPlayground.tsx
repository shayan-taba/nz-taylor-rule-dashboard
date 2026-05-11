// src/components/dashboard/ParameterPlayground.tsx

"use client";
import { useRef } from "react";
import { useAppStore } from "../../store/appStore";
import { useDebounce } from "../../hooks/useDebounce";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <div style={{
      fontSize:      "9px",
      letterSpacing: "0.12em",
      color:         "var(--text-3)",
      borderTop:     "1px solid var(--border)",
      paddingTop:    10,
      marginTop:     4,
    }}>
      {children}
    </div>
  );
}

function Slider({
  label, sub, value, min, max, step, onChange, disabled,
}: {
  label:     string;
  sub?:      string;
  value:     number;
  min:       number;
  max:       number;
  step:      number;
  onChange:  (v: number) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 3, opacity: disabled ? 0.4 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <div>
          <span style={{ fontSize: "10px", color: "var(--text-2)", letterSpacing: "0.04em" }}>
            {label}
          </span>
          {sub && (
            <span style={{ fontSize: "9px", color: "var(--text-3)", marginLeft: 5 }}>
              {sub}
            </span>
          )}
        </div>
        <span style={{
          fontSize:   "13px",
          color:      disabled ? "var(--text-3)" : "var(--accent)",
          fontWeight: 500,
          fontVariantNumeric: "tabular-nums",
        }}>
          {value.toFixed(2)}
        </span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step} value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width:       "100%",
          accentColor: "var(--accent)",
          cursor:      disabled ? "not-allowed" : "pointer",
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-3)" }}>
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function Toggle({
  label, checked, onChange,
}: {
  label:    string;
  checked:  boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display:     "flex",
        alignItems:  "center",
        gap:         8,
        cursor:      "pointer",
        userSelect:  "none",
      }}
    >
      <div style={{
        width:        28,
        height:       14,
        borderRadius: 7,
        background:   checked ? "var(--accent)" : "var(--border-2)",
        position:     "relative",
        transition:   "background 0.15s",
        flexShrink:   0,
      }}>
        <div style={{
          position:   "absolute",
          top:        2,
          left:       checked ? 16 : 2,
          width:      10,
          height:     10,
          borderRadius: "50%",
          background: "white",
          transition: "left 0.15s",
        }} />
      </div>
      <span style={{ fontSize: "10px", color: checked ? "var(--text-2)" : "var(--text-3)" }}>
        {label}
      </span>
    </div>
  );
}

// Visual equation display
function TaylorEquation({
  alpha, beta, rStarOverride, piStarOverride, useRStar, usePiStar, showInertial, rho = 0.85,
}: {
  alpha:          number;
  beta:           number;
  rStarOverride?: number;
  piStarOverride?: number;
  useRStar:       boolean;
  usePiStar:      boolean;
  showInertial:   boolean;
  rho?:           number;
}) {
  const termStyle: React.CSSProperties = {
    display:       "inline-flex",
    flexDirection: "column",
    alignItems:    "center",
    gap:           1,
  };
  const valStyle = (highlight?: boolean): React.CSSProperties => ({
    fontSize:    "13px",
    fontWeight:  500,
    color:       highlight ? "var(--accent)" : "var(--text-2)",
    lineHeight:  1,
    fontVariantNumeric: "tabular-nums",
  });
  const labelStyle: React.CSSProperties = {
    fontSize: "8px",
    color:    "var(--text-3)",
    letterSpacing: "0.05em",
  };
  const opStyle: React.CSSProperties = {
    fontSize:    "13px",
    color:       "var(--text-3)",
    padding:     "0 3px",
    alignSelf:   "flex-start",
    marginTop:   2,
  };

  return (
    <div style={{
      background:   "var(--bg-3)",
      border:       "1px solid var(--border)",
      borderRadius: "2px",
      padding:      "10px 12px",
      display:      "flex",
      flexDirection: "column",
      gap:          8,
    }}>
      {/* Taylor Rule */}
      <div>
        <div style={{ fontSize: "8px", color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 6 }}>
          TAYLOR RULE
        </div>
        <div style={{ display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
          <div style={termStyle}>
            <span style={valStyle()}>i</span>
            <span style={labelStyle}>OCR</span>
          </div>
          <span style={opStyle}>=</span>
          <div style={termStyle}>
            <span style={valStyle(useRStar)}>
              {useRStar && rStarOverride !== undefined ? rStarOverride.toFixed(2) : "r*"}
            </span>
            <span style={labelStyle}>{useRStar ? "override" : "MPS"}</span>
          </div>
          <span style={opStyle}>+</span>
          <div style={termStyle}>
            <span style={valStyle(true)}>{alpha.toFixed(2)}</span>
            <span style={labelStyle}>α</span>
          </div>
          <span style={{ ...opStyle, fontSize: "10px" }}>·</span>
          <div style={termStyle}>
            <span style={valStyle()}>(π −</span>
            <span style={labelStyle}>inflation</span>
          </div>
          <div style={termStyle}>
            <span style={valStyle(usePiStar)}>
              {usePiStar && piStarOverride !== undefined ? piStarOverride.toFixed(2) : "π*"}
            </span>
            <span style={labelStyle}>{usePiStar ? "override" : "hist."}</span>
          </div>
          <div style={termStyle}>
            <span style={valStyle()}>)</span>
            <span style={labelStyle}>&nbsp;</span>
          </div>
          <span style={opStyle}>+</span>
          <div style={termStyle}>
            <span style={valStyle(true)}>{beta.toFixed(2)}</span>
            <span style={labelStyle}>β</span>
          </div>
          <span style={{ ...opStyle, fontSize: "10px" }}>·</span>
          <div style={termStyle}>
            <span style={valStyle()}>gap</span>
            <span style={labelStyle}>output</span>
          </div>
        </div>
      </div>

      {/* Inertial Taylor Rule */}
      {showInertial && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
          <div style={{ fontSize: "8px", color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 6 }}>
            INERTIAL TAYLOR RULE
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", flexWrap: "wrap", gap: 2 }}>
            <div style={termStyle}>
              <span style={valStyle()}>i</span>
              <span style={labelStyle}>OCR</span>
            </div>
            <span style={opStyle}>=</span>
            <div style={termStyle}>
              <span style={valStyle()}>{rho.toFixed(2)}</span>
              <span style={labelStyle}>ρ</span>
            </div>
            <span style={{ ...opStyle, fontSize: "10px" }}>·</span>
            <div style={termStyle}>
              <span style={valStyle()}>i</span>
              <span style={labelStyle}>t−1</span>
            </div>
            <span style={opStyle}>+</span>
            <div style={termStyle}>
              <span style={valStyle()}>{(1 - rho).toFixed(2)}</span>
              <span style={labelStyle}>1−ρ</span>
            </div>
            <span style={{ ...opStyle, fontSize: "10px" }}>·</span>
            <div style={termStyle}>
              <span style={valStyle()}>i*</span>
              <span style={labelStyle}>Taylor</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
      <span style={{ color: "var(--text-3)" }}>{label}</span>
      <span style={{ color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{value}</span>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ParameterPlayground() {
  const params              = useAppStore((s) => s.params);
  const setParams           = useAppStore((s) => s.setParams);
  const useRStarOverride    = useAppStore((s) => s.useRStarOverride);
  const usePiStarOverride   = useAppStore((s) => s.usePiStarOverride);
  const setUseRStarOverride = useAppStore((s) => s.setUseRStarOverride);
  const setUsePiStarOverride = useAppStore((s) => s.setUsePiStarOverride);
  const showInertial        = useAppStore((s) => s.showInertial);
  const setShowInertial     = useAppStore((s) => s.setShowInertial);
  const fetchComputed       = useAppStore((s) => s.fetchComputed);
  const isLoadingComputed   = useAppStore((s) => s.isLoadingComputed);
  const olsResult           = useAppStore((s) => s.olsResult);
  const olsContext          = useAppStore((s) => s.olsContext);
  const ocrFitR2            = useAppStore((s) => s.ocrFitR2);
  const inertialR2          = useAppStore((s) => s.inertialR2);

  // Debounce slider → fetchComputed (no OLS)
  useDebounce(
    () => { fetchComputed(); },
    150,
    [params, useRStarOverride, usePiStarOverride],
  );

  // Override toggles also immediately re-fetch
  const handleRStarToggle = (v: boolean) => {
    setUseRStarOverride(v);
    // debounce will pick this up
  };
  const handlePiStarToggle = (v: boolean) => {
    setUsePiStarOverride(v);
  };

  const isOlsSnapped =
    olsResult &&
    Math.abs(params.alpha - olsResult.alpha) < 0.001 &&
    Math.abs(params.beta  - olsResult.beta)  < 0.001;

  return (
    <div style={{
      background:    "var(--bg-2)",
      border:        "1px solid var(--border)",
      padding:       "16px 18px",
      display:       "flex",
      flexDirection: "column",
      gap:           10,
      height:        "100%",
      overflowY:     "auto",
    }}>

      {/* ── Title ── */}
      <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-3)" }}>
        PARAMETER PLAYGROUND
      </div>

      {/* ── Live equation ── */}
      <TaylorEquation
        alpha={params.alpha}
        beta={params.beta}
        rStarOverride={params.rStarOverride}
        piStarOverride={params.piStarOverride}
        useRStar={useRStarOverride}
        usePiStar={usePiStarOverride}
        showInertial={showInertial}
      />

      {/* ── Section 1: Response Coefficients ── */}
      <SectionLabel>RESPONSE COEFFICIENTS</SectionLabel>
      <div style={{
        background:   "var(--bg-3)",
        border:       "1px solid var(--border)",
        borderRadius: "2px",
        padding:      "10px 12px",
        display:      "flex",
        flexDirection: "column",
        gap:          10,
      }}>
        <Slider
          label="α"
          sub="inflation gap weight"
          value={params.alpha}
          min={0} max={2} step={0.05}
          onChange={(v) => setParams({ alpha: v })}
        />
        <Slider
          label="β"
          sub="output gap weight"
          value={params.beta}
          min={0} max={2} step={0.05}
          onChange={(v) => setParams({ beta: v })}
        />

        {/* OLS estimation — lives here, adjacent to the coefficients it estimates */}
        <div style={{
          borderTop:  "1px solid var(--border)",
          paddingTop: 10,
          display:    "flex",
          flexDirection: "column",
          gap:        8,
        }}>
          <div style={{ fontSize: "9px", color: "var(--text-3)", letterSpacing: "0.08em" }}>
            OR — ESTIMATE α AND β FROM DATA
          </div>
          <p style={{ fontSize: "9px", color: "var(--text-3)", lineHeight: 1.5, margin: 0 }}>
            Runs OLS of (OCR − r*) on inflation gap and output gap over the
            selected window. Uses {useRStarOverride ? "slider r*" : "MPS r* series"} and{" "}
            {usePiStarOverride ? "slider π*" : "historical π* targets"}.
          </p>
          <button
            onClick={() => fetchComputed({ runOLS: true })}
            disabled={isLoadingComputed}
            style={{
              padding:       "7px 0",
              background:    isOlsSnapped ? "transparent" : "var(--accent-dim)",
              color:         "var(--accent)",
              border:        `1px solid ${isOlsSnapped ? "var(--border-2)" : "var(--accent)"}`,
              borderRadius:  "2px",
              fontFamily:    "inherit",
              fontSize:      "10px",
              letterSpacing: "0.06em",
              cursor:        isLoadingComputed ? "not-allowed" : "pointer",
              opacity:       isLoadingComputed ? 0.5 : 1,
              transition:    "all 0.15s",
            }}
          >
            {isLoadingComputed
              ? "WAITING FOR CHART DATA..."
              : isOlsSnapped
              ? "✓ SLIDERS MATCH OLS ESTIMATES"
              : "ESTIMATE α & β FROM DATA (OLS)"}
          </button>

          {/* OLS results — immediately below the button that produced them */}
          {olsResult && (
            <div style={{
              background:    "var(--bg-2)",
              border:        "1px solid var(--border)",
              borderRadius:  "2px",
              padding:       "10px 12px",
              display:       "flex",
              flexDirection: "column",
              gap:           6,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "9px", color: "var(--text-3)", letterSpacing: "0.08em" }}>
                  OLS ESTIMATES
                </span>
                <span style={{ fontSize: "9px", color: "var(--text-3)" }}>
                  {olsContext?.useRStarOverride ? "r* slider" : "r* MPS"}{" · "}
                  {olsContext?.usePiStarOverride ? "π* slider" : "π* hist."}
                </span>
              </div>
              <StatRow label="α (estimated)" value={olsResult.alpha.toFixed(3)} />
              <StatRow label="β (estimated)" value={olsResult.beta.toFixed(3)} />
              <StatRow label="R² (uncentered)" value={olsResult.rSquared.toFixed(3)} />
              <StatRow label="RMSE" value={olsResult.rmse.toFixed(3) + "pp"} />
              <div style={{
                fontSize:   "9px",
                color:      "var(--text-3)",
                lineHeight: 1.5,
                borderTop:  "1px solid var(--border)",
                paddingTop: 6,
                marginTop:  2,
              }}>
                {olsResult.alpha > 0.5 ? "More" : "Less"} inflation-reactive than
                standard (α={olsResult.alpha.toFixed(2)}),{" "}
                {olsResult.beta > 0.5 ? "more" : "less"} output-reactive
                (β={olsResult.beta.toFixed(2)}).
              </div>
              {!isOlsSnapped && (
                <button
                  onClick={() => {
                    setParams({ alpha: olsResult.alpha, beta: olsResult.beta });
                    fetchComputed();
                  }}
                  style={{
                    padding:       "5px 0",
                    background:    "transparent",
                    color:         "var(--accent)",
                    border:        "1px solid var(--accent)",
                    borderRadius:  "2px",
                    fontFamily:    "inherit",
                    fontSize:      "9px",
                    letterSpacing: "0.06em",
                    cursor:        "pointer",
                  }}
                >
                  ↑ APPLY TO SLIDERS
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Section 2: Neutral Rate ── */}
      <SectionLabel>NEUTRAL RATE r*</SectionLabel>
      <div style={{
        background:   "var(--bg-3)",
        border:       "1px solid var(--border)",
        borderRadius: "2px",
        padding:      "10px 12px",
        display:      "flex",
        flexDirection: "column",
        gap:          10,
      }}>
        <div style={{ fontSize: "9px", color: "var(--text-3)", lineHeight: 1.5 }}>
          Default uses RBNZ's published r* from each MPS — time-varying.
          Override to test a counterfactual flat neutral rate.
        </div>
        <Toggle
          label="Override with flat r*"
          checked={useRStarOverride}
          onChange={handleRStarToggle}
        />
        <Slider
          label="r* constant override"
          value={params.rStarOverride ?? 3.0}
          min={0} max={8} step={0.25}
          onChange={(v) => setParams({ rStarOverride: v })}
          disabled={!useRStarOverride}
        />
      </div>

      {/* ── Section 3: Inflation Target ── */}
      <SectionLabel>INFLATION TARGET π*</SectionLabel>
      <div style={{
        background:   "var(--bg-3)",
        border:       "1px solid var(--border)",
        borderRadius: "2px",
        padding:      "10px 12px",
        display:      "flex",
        flexDirection: "column",
        gap:          10,
      }}>
        <div style={{ fontSize: "9px", color: "var(--text-3)", lineHeight: 1.5 }}>
          Default uses historical targets: 1.0% (pre-1997), 1.5% (1997–2002),
          2.0% (2002–present). Override to test a uniform target counterfactual.
        </div>
        <Toggle
          label="Override with flat π*"
          checked={usePiStarOverride}
          onChange={handlePiStarToggle}
        />
        <Slider
          label="π* constant override"
          value={params.piStarOverride ?? 2.0}
          min={0} max={4} step={0.25}
          onChange={(v) => setParams({ piStarOverride: v })}
          disabled={!usePiStarOverride}
        />
      </div>

      {/* ── Section 4: Display + Model Fit ── */}
      <SectionLabel>DISPLAY & MODEL FIT</SectionLabel>
      <div style={{
        background:   "var(--bg-3)",
        border:       "1px solid var(--border)",
        borderRadius: "2px",
        padding:      "10px 12px",
        display:      "flex",
        flexDirection: "column",
        gap:          10,
      }}>
        <Toggle
          label="Show Inertial Taylor Rule"
          checked={showInertial}
          onChange={setShowInertial}
        />

        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ fontSize: "9px", color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: 2 }}>
            FIT vs ACTUAL OCR — R² (centred)
          </div>
          <StatRow
            label="Taylor Rule"
            value={ocrFitR2 !== null ? ocrFitR2.toFixed(3) : "—"}
          />
          <StatRow
            label="Inertial Taylor"
            value={inertialR2 !== null ? inertialR2.toFixed(3) : "—"}
          />
          <div style={{ fontSize: "9px", color: "var(--text-3)", lineHeight: 1.5, marginTop: 2 }}>
            R² = 1 − SS_res / SS_tot. Updates live with slider changes.
          </div>
        </div>
      </div>

    </div>
  );
}