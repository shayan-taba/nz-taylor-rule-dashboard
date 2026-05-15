// src/components/dashboard/ParameterPlayground.tsx

"use client";

import React from "react";

import { useAppStore } from "../../store/appStore";

import { useDebounce } from "../../hooks/useDebounce";

import {
  buildEstimationSpecification,
  serializeEstimationSpecification,
  slidersMatchOLS,
} from "../../store/modelSpecification";

// ─────────────────────────────────────────────────────────────────────────────
// Semantic colours
// ─────────────────────────────────────────────────────────────────────────────

const RESPONSE_COLOR = "var(--accent)";
const RESPONSE_BG = "var(--accent-dim)";

const OVERRIDE_COLOR = "#7c9cff";
const OVERRIDE_BG = "rgba(124,156,255,0.16)";

const SUCCESS_COLOR = "#7ee2a8";
const SUCCESS_BG = "rgba(80,200,120,0.08)";
const SUCCESS_BORDER = "rgba(80,200,120,0.35)";

const WARNING_COLOR = "#ffcc73";
const WARNING_BG = "rgba(255,190,90,0.08)";
const WARNING_BORDER = "rgba(255,190,90,0.35)";

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontSize: "9px",
        letterSpacing: "0.12em",
        color: "var(--text-3)",
        borderTop: "1px solid var(--border)",
        paddingTop: 10,
        marginTop: 4,
      }}
    >
      {children}
    </div>
  );
}

function Slider({
  label,
  sub,
  value,
  min,
  max,
  step,
  onChange,
  disabled,
  accentColor = RESPONSE_COLOR,
}: {
  label: string;
  sub?: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  disabled?: boolean;
  accentColor?: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "10px",
              color: "var(--text-2)",
              letterSpacing: "0.04em",
            }}
          >
            {label}
          </span>

          {sub && (
            <span
              style={{
                fontSize: "9px",
                color: "var(--text-3)",
                marginLeft: 5,
              }}
            >
              {sub}
            </span>
          )}
        </div>

        <span
          style={{
            fontSize: "13px",
            color: disabled ? "var(--text-3)" : accentColor,
            fontWeight: 500,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value.toFixed(2)}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{
          width: "100%",
          accentColor,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "9px",
          color: "var(--text-3)",
        }}
      >
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  accentColor = RESPONSE_COLOR,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  accentColor?: string;
}) {
  return (
    <div
      onClick={() => onChange(!checked)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        userSelect: "none",
      }}
    >
      <div
        style={{
          width: 28,
          height: 14,
          borderRadius: 7,
          background: checked ? accentColor : "var(--border-2)",
          position: "relative",
          transition: "background 0.15s",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 2,
            left: checked ? 16 : 2,
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: "white",
            transition: "left 0.15s",
          }}
        />
      </div>

      <span
        style={{
          fontSize: "10px",
          color: checked ? "var(--text-2)" : "var(--text-3)",
        }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Equation ───────────────────────────────────────────────────────────────

function TaylorEquation({
  alpha,
  beta,
  realRStarOverride,
  piStarOverride,
  useRStar,
  usePiStar,
  showInertial,
  rho = 0.85,
}: {
  alpha: number;
  beta: number;
  realRStarOverride?: number;
  piStarOverride?: number;
  useRStar: boolean;
  usePiStar: boolean;
  showInertial: boolean;
  rho?: number;
}) {
  const termStyle: React.CSSProperties = {
    display: "inline-flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 1,
  };

  const valStyle = (color?: string): React.CSSProperties => ({
    fontSize: "13px",
    fontWeight: 500,
    color: color ?? "var(--text-2)",
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  });

  const labelStyle: React.CSSProperties = {
    fontSize: "8px",
    color: "var(--text-3)",
    letterSpacing: "0.05em",
  };

  const opStyle: React.CSSProperties = {
    fontSize: "13px",
    color: "var(--text-3)",
    padding: "0 3px",
    alignSelf: "flex-start",
    marginTop: 2,
  };

  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border)",
        borderRadius: "2px",
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {/* Taylor Rule */}
      <div>
        <div
          style={{
            fontSize: "8px",
            color: "var(--text-3)",
            letterSpacing: "0.1em",
            marginBottom: 6,
          }}
        >
          TAYLOR RULE
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <div style={termStyle}>
            <span style={valStyle()}>i</span>
            <span style={labelStyle}>OCR</span>
          </div>

          <span style={opStyle}>=</span>

          <div style={termStyle}>
            <span style={valStyle(useRStar ? OVERRIDE_COLOR : undefined)}>
              {useRStar && realRStarOverride !== undefined
                ? `${realRStarOverride.toFixed(2)} + π`
                : "r*"}
            </span>

            <span style={labelStyle}>
              {useRStar ? "real override" : "MPS nominal"}
            </span>
          </div>

          <span style={opStyle}>+</span>

          <div style={termStyle}>
            <span style={valStyle(RESPONSE_COLOR)}>{alpha.toFixed(2)}</span>
            <span style={labelStyle}>α</span>
          </div>

          <span style={{ ...opStyle, fontSize: "10px" }}>·</span>

          <div style={termStyle}>
            <span style={valStyle()}>(π −</span>
            <span style={labelStyle}>inflation</span>
          </div>

          <div style={termStyle}>
            <span style={valStyle(usePiStar ? OVERRIDE_COLOR : undefined)}>
              {usePiStar && piStarOverride !== undefined
                ? piStarOverride.toFixed(2)
                : "π*"}
            </span>

            <span style={labelStyle}>{usePiStar ? "override" : "hist."}</span>
          </div>

          <div style={termStyle}>
            <span style={valStyle()}>)</span>
            <span style={labelStyle}>&nbsp;</span>
          </div>

          <span style={opStyle}>+</span>

          <div style={termStyle}>
            <span style={valStyle(RESPONSE_COLOR)}>{beta.toFixed(2)}</span>

            <span style={labelStyle}>β</span>
          </div>

          <span style={{ ...opStyle, fontSize: "10px" }}>·</span>

          <div style={termStyle}>
            <span style={valStyle()}>gap</span>
            <span style={labelStyle}>output</span>
          </div>
        </div>
      </div>

      {/* Inertial */}
      {showInertial && (
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 8 }}>
          <div
            style={{
              fontSize: "8px",
              color: "var(--text-3)",
              letterSpacing: "0.1em",
              marginBottom: 6,
            }}
          >
            INERTIAL TAYLOR RULE
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        fontSize: "10px",
      }}
    >
      <span style={{ color: "var(--text-3)" }}>{label}</span>

      <span
        style={{
          color: RESPONSE_COLOR,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ─── Main component ─────────────────────────────────────────────────────────
export function ParameterPlayground() {
  const params = useAppStore((s) => s.params);

  const setParams = useAppStore((s) => s.setParams);

  const inflationMeasure = useAppStore((s) => s.inflationMeasure);

  const dateRange = useAppStore((s) => s.dateRange);

  const useRealRStarOverride = useAppStore((s) => s.useRealRStarOverride);

  const usePiStarOverride = useAppStore((s) => s.usePiStarOverride);

  const setUseRealRStarOverride = useAppStore((s) => s.setUseRealRStarOverride);

  const setUsePiStarOverride = useAppStore((s) => s.setUsePiStarOverride);

  const showInertial = useAppStore((s) => s.showInertial);

  const setShowInertial = useAppStore((s) => s.setShowInertial);

  const fetchComputed = useAppStore((s) => s.fetchComputed);

  const isLoadingComputed = useAppStore((s) => s.isLoadingComputed);

  const olsResult = useAppStore((s) => s.olsResult);

  const olsSpecHash = useAppStore((s) => s.olsSpecHash);

  const ocrFitR2 = useAppStore((s) => s.ocrFitR2);

  const inertialR2 = useAppStore((s) => s.inertialR2);

  // ───────────────────────────────────────────
  // Debounce computed updates
  // ───────────────────────────────────────────

  useDebounce(
    () => {
      fetchComputed();
    },

    150,

    [
      params,
      inflationMeasure,
      dateRange,

      useRealRStarOverride,
      usePiStarOverride,
    ],
  );

  // ───────────────────────────────────────────
  // Canonical spec comparison
  // ───────────────────────────────────────────

  const currentSpec = buildEstimationSpecification({
    inflationMeasure,
    dateRange,

    useRealRStarOverride,
    usePiStarOverride,

    params,
  });

  const currentSpecHash = serializeEstimationSpecification(currentSpec);

  /**
   * "stale" means:
   * estimation assumptions changed
   */
  const isOlsContextStale = !!olsSpecHash && olsSpecHash !== currentSpecHash;

  /**
   * "matches" means:
   * sliders equal estimated coefficients
   */
  const slidersMatchLastOLS = slidersMatchOLS(params, olsResult);

  const isOlsCurrent = slidersMatchLastOLS && !isOlsContextStale;

  // ───────────────────────────────────────────
  // Button state
  // ───────────────────────────────────────────

  let olsButtonLabel = "ESTIMATE α & β FROM DATA (OLS)";

  let olsButtonStyles: React.CSSProperties = {
    background: "var(--accent-dim)",

    color: "var(--accent)",

    border: "1px solid var(--accent)",
  };

  if (isLoadingComputed) {
    olsButtonLabel = "RE-ESTIMATING FROM DATA...";
  } else if (isOlsCurrent) {
    olsButtonLabel = "✓ MATCHES CURRENT OLS ESTIMATES";
  } else if (isOlsContextStale) {
    olsButtonLabel = "OLS ESTIMATES OUTDATED — RE-RUN";

    olsButtonStyles = {
      background: WARNING_BG,
      color: WARNING_COLOR,
      border: `1px solid ${WARNING_BORDER}`,
    };
  }

  return (
    <div
      style={{
        background: "var(--bg-2)",
        border: "1px solid var(--border)",
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        height: "100%",
        overflowY: "auto",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontSize: "10px",
          letterSpacing: "0.1em",
          color: "var(--text-3)",
        }}
      >
        PARAMETER PLAYGROUND
      </div>

      {/* Equation */}
      <TaylorEquation
        alpha={params.alpha}
        beta={params.beta}
        realRStarOverride={params.realRStarOverride}
        piStarOverride={params.piStarOverride}
        useRStar={useRealRStarOverride}
        usePiStar={usePiStarOverride}
        showInertial={showInertial}
      />

      {/* Response coefficients */}
      <SectionLabel>RESPONSE COEFFICIENTS</SectionLabel>

      <div
        style={{
          background: "var(--bg-3)",
          border: "1px solid var(--border)",
          borderRadius: "2px",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Slider
          label="α"
          sub="inflation gap weight"
          value={params.alpha}
          min={0}
          max={2}
          step={0.05}
          onChange={(v) => setParams({ alpha: v })}
          accentColor={RESPONSE_COLOR}
        />

        <Slider
          label="β"
          sub="output gap weight"
          value={params.beta}
          min={0}
          max={2}
          step={0.05}
          onChange={(v) => setParams({ beta: v })}
          accentColor={RESPONSE_COLOR}
        />

        {/* OLS */}
        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "9px",
                color: "var(--text-3)",
                letterSpacing: "0.08em",
              }}
            >
              OR — ESTIMATE α AND β FROM DATA
            </div>

            {isOlsContextStale && (
              <div
                style={{
                  fontSize: "8px",
                  color: WARNING_COLOR,
                  border: `1px solid ${WARNING_BORDER}`,
                  background: WARNING_BG,
                  padding: "2px 5px",
                  borderRadius: "999px",
                  letterSpacing: "0.06em",
                }}
              >
                STALE
              </div>
            )}
          </div>

          <p
            style={{
              fontSize: "9px",
              color: "var(--text-3)",
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            Runs OLS of (OCR − r*) on inflation gap and output gap over the
            selected window.
          </p>

          {isOlsContextStale && (
            <div
              style={{
                fontSize: "9px",
                color: WARNING_COLOR,
                lineHeight: 1.5,
              }}
            >
              Parameters or assumptions changed since the last OLS estimation.
              Re-run regression to estimate coefficients for the current setup.
            </div>
          )}

          <button
            onClick={() => fetchComputed({ runOLS: true })}
            disabled={isLoadingComputed}
            style={{
              padding: "7px 0",
              borderRadius: "2px",
              fontFamily: "inherit",
              fontSize: "10px",
              letterSpacing: "0.06em",
              cursor: isLoadingComputed ? "not-allowed" : "pointer",
              opacity: isLoadingComputed ? 0.6 : 1,
              transition: "all 0.15s",
              ...olsButtonStyles,
            }}
          >
            {olsButtonLabel}
          </button>

          {/* OLS results */}
          {olsResult && (
            <div
              style={{
                background: "var(--bg-2)",
                border: "1px solid var(--border)",
                borderRadius: "2px",
                padding: "10px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "9px",
                    color: "var(--text-3)",
                    letterSpacing: "0.08em",
                  }}
                >
                  OLS ESTIMATES
                </span>

                <span
                  style={{
                    fontSize: "9px",
                    color: isOlsContextStale ? WARNING_COLOR : "var(--text-3)",
                  }}
                >
                  {isOlsContextStale ? "STALE" : "CURRENT"}
                </span>
              </div>

              <StatRow
                label="α (estimated)"
                value={olsResult.alpha.toFixed(3)}
              />

              <StatRow
                label="β (estimated)"
                value={olsResult.beta.toFixed(3)}
              />

              <StatRow
                label="R² (uncentered)"
                value={olsResult.rSquared.toFixed(3)}
              />

              <StatRow label="RMSE" value={olsResult.rmse.toFixed(3) + "pp"} />

              {!slidersMatchLastOLS && (
                <button
                  onClick={() => {
                    setParams({
                      alpha: olsResult.alpha,
                      beta: olsResult.beta,
                    });

                    fetchComputed();
                  }}
                  style={{
                    marginTop: 6,
                    padding: "5px 0",
                    background: "transparent",
                    color: RESPONSE_COLOR,
                    border: `1px solid ${RESPONSE_COLOR}`,
                    borderRadius: "2px",
                    fontFamily: "inherit",
                    fontSize: "9px",
                    letterSpacing: "0.06em",
                    cursor: "pointer",
                  }}
                >
                  ↑ APPLY TO SLIDERS
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Neutral rate */}
      <SectionLabel>NEUTRAL RATE r*</SectionLabel>

      <div
        style={{
          background: "var(--bg-3)",
          border: "1px solid var(--border)",
          borderRadius: "2px",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Toggle
          label="Override with flat r*"
          checked={useRealRStarOverride}
          onChange={setUseRealRStarOverride}
          accentColor={OVERRIDE_COLOR}
        />

        <Slider
          label="real r* override"
          sub="real neutral rate"
          value={params.realRStarOverride ?? 2.0}
          min={-1}
          max={4}
          step={0.25}
          onChange={(v) => setParams({ realRStarOverride: v })}
          disabled={!useRealRStarOverride}
          accentColor={OVERRIDE_COLOR}
        />
      </div>

      {/* Inflation target */}
      <SectionLabel>INFLATION TARGET π*</SectionLabel>

      <div
        style={{
          background: "var(--bg-3)",
          border: "1px solid var(--border)",
          borderRadius: "2px",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Toggle
          label="Override with flat π*"
          checked={usePiStarOverride}
          onChange={setUsePiStarOverride}
          accentColor={OVERRIDE_COLOR}
        />

        <Slider
          label="π* constant override"
          value={params.piStarOverride ?? 2.0}
          min={0}
          max={4}
          step={0.25}
          onChange={(v) => setParams({ piStarOverride: v })}
          disabled={!usePiStarOverride}
          accentColor={OVERRIDE_COLOR}
        />
      </div>

      {/* Display + fit */}
      <SectionLabel>DISPLAY & MODEL FIT</SectionLabel>

      <div
        style={{
          background: "var(--bg-3)",
          border: "1px solid var(--border)",
          borderRadius: "2px",
          padding: "10px 12px",
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
      >
        <Toggle
          label="Show Inertial Taylor Rule"
          checked={showInertial}
          onChange={setShowInertial}
        />

        <div
          style={{
            borderTop: "1px solid var(--border)",
            paddingTop: 10,
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <div
            style={{
              fontSize: "9px",
              color: "var(--text-3)",
              letterSpacing: "0.08em",
            }}
          >
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
        </div>
      </div>
    </div>
  );
}
