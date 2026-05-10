"use client";
import { useEffect, useRef } from "react";
import { useAppStore } from "../../store/appStore";
import { useDebounce } from "../../store/useDebounce";

interface SliderProps {
  label:    string;
  value:    number;
  min:      number;
  max:      number;
  step:     number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

function Slider({ label, value, min, max, step, onChange, disabled }: SliderProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
        <span style={{ color: "var(--text-3)", letterSpacing: "0.08em" }}>{label}</span>
        <span style={{ color: "var(--accent)", fontWeight: 500 }}>{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width:       "100%",
          accentColor: "var(--accent)",
          cursor:      disabled ? "not-allowed" : "pointer",
          opacity:     disabled ? 0.4 : 1,
        }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9px", color: "var(--text-3)" }}>
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: "10px", color: "var(--text-2)" }}>
      <div
        onClick={() => onChange(!checked)}
        style={{
          width: 32, height: 16, borderRadius: 8,
          background: checked ? "var(--accent)" : "var(--border-2)",
          position: "relative", transition: "background 0.2s", flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute", top: 2, left: checked ? 18 : 2,
          width: 12, height: 12, borderRadius: "50%",
          background: "white", transition: "left 0.2s",
        }} />
      </div>
      {label}
    </label>
  );
}

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

  // Debounce slider changes
  const paramsRef = useRef(params);
  paramsRef.current = params;

  useDebounce(() => {
    fetchComputed();
  }, 150, [params, useRStarOverride, usePiStarOverride]);

  const section = (title: string) => (
    <div style={{ fontSize: "9px", letterSpacing: "0.12em", color: "var(--text-3)", marginTop: 16, marginBottom: 8, borderTop: "1px solid var(--border)", paddingTop: 12 }}>
      {title}
    </div>
  );

  return (
    <div style={{
      background:   "var(--bg-2)",
      border:       "1px solid var(--border)",
      padding:      "20px",
      display:      "flex",
      flexDirection: "column",
      gap:          12,
      height:       "100%",
    }}>
      <div style={{ fontSize: "10px", letterSpacing: "0.1em", color: "var(--text-3)" }}>
        PARAMETER PLAYGROUND
      </div>

      {section("RESPONSE COEFFICIENTS")}

      <Slider
        label="α — Inflation Gap"
        value={params.alpha}
        min={0} max={2} step={0.05}
        onChange={(v) => setParams({ alpha: v })}
      />
      <Slider
        label="β — Output Gap"
        value={params.beta}
        min={0} max={2} step={0.05}
        onChange={(v) => setParams({ beta: v })}
      />

      {section("NEUTRAL RATE r*")}
      <Toggle
        label="Override MPS series"
        checked={useRStarOverride}
        onChange={setUseRStarOverride}
      />
      <Slider
        label="r* Override"
        value={params.rStarOverride ?? 3.0}
        min={0} max={8} step={0.25}
        onChange={(v) => setParams({ rStarOverride: v })}
        disabled={!useRStarOverride}
      />

      {section("INFLATION TARGET π*")}
      <Toggle
        label="Override historical targets"
        checked={usePiStarOverride}
        onChange={setUsePiStarOverride}
      />
      <Slider
        label="π* Override"
        value={params.piStarOverride ?? 2.0}
        min={0} max={4} step={0.25}
        onChange={(v) => setParams({ piStarOverride: v })}
        disabled={!usePiStarOverride}
      />

      {section("DISPLAY")}
      <Toggle
        label="Show Inertial Taylor Rule"
        checked={showInertial}
        onChange={setShowInertial}
      />

      <button
        onClick={() => fetchComputed({ runOLS: true })}
        disabled={isLoadingComputed}
        style={{
          marginTop:    8,
          padding:      "8px 0",
          background:   "var(--accent-dim)",
          color:        "var(--accent)",
          border:       "1px solid var(--accent)",
          borderRadius: "2px",
          fontFamily:   "inherit",
          fontSize:     "11px",
          letterSpacing: "0.06em",
          cursor:       isLoadingComputed ? "not-allowed" : "pointer",
          opacity:      isLoadingComputed ? 0.6 : 1,
        }}
      >
        {isLoadingComputed ? "COMPUTING..." : "ESTIMATE FROM DATA (OLS)"}
      </button>

      {/* OLS Results */}
      {olsResult && (
        <div style={{
          marginTop:   8,
          padding:     "12px",
          background:  "var(--bg-3)",
          border:      "1px solid var(--border)",
          fontSize:    "10px",
          display:     "flex",
          flexDirection: "column",
          gap:         6,
        }}>
          <div style={{ color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: 4 }}>OLS RESULTS</div>
          {[
            { label: "α (estimated)", value: olsResult.alpha.toFixed(3) },
            { label: "β (estimated)", value: olsResult.beta.toFixed(3) },
            { label: "Intercept",     value: olsResult.intercept.toFixed(3) },
            { label: "R²",            value: olsResult.rSquared.toFixed(3) },
            { label: "RMSE",          value: olsResult.rmse.toFixed(3) + "pp" },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-2)" }}>{label}</span>
              <span style={{ color: "var(--accent)" }}>{value}</span>
            </div>
          ))}
          <div style={{ marginTop: 6, color: "var(--text-2)", lineHeight: 1.6, borderTop: "1px solid var(--border)", paddingTop: 8 }}>
            The RBNZ responded {olsResult.alpha > 0.5 ? "more" : "less"} aggressively
            to inflation than the standard rule (α={olsResult.alpha.toFixed(2)})
            and {olsResult.beta > 0.5 ? "more" : "less"} to the output gap
            (β={olsResult.beta.toFixed(2)}), explaining {(olsResult.rSquared * 100).toFixed(0)}%
            of OCR variation.
          </div>
          <button
            onClick={() => {
              setParams({ alpha: olsResult.alpha, beta: olsResult.beta });
              fetchComputed();
            }}
            style={{
              marginTop:   6,
              padding:     "5px 0",
              background:  "transparent",
              color:       "var(--accent)",
              border:      "1px solid var(--border-2)",
              borderRadius: "2px",
              fontFamily:  "inherit",
              fontSize:    "10px",
              cursor:      "pointer",
            }}
          >
            SNAP SLIDERS TO ESTIMATES
          </button>
        </div>
      )}
    </div>
  );
}