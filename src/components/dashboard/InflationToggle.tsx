"use client";
import { useAppStore } from "../../store/appStore";
import type { InflationMeasure } from "../../types";

const OPTIONS: { value: InflationMeasure; label: string }[] = [
  { value: "inflationCoreAvg", label: "CORE AVG" },
  { value: "inflationTrimmed", label: "TRIMMED 30%" },
  { value: "inflationSectoral", label: "SECTORAL" },
  { value: "cpiApc", label: "CPI HEADLINE" },
];

export function InflationToggle() {
  const measure = useAppStore((s) => s.inflationMeasure);
  const setMeasure = useAppStore((s) => s.setInflationMeasure);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span
        style={{
          fontSize: "10px",
          color: "var(--text-3)",
          letterSpacing: "0.1em",
        }}
      >
        INFLATION
      </span>
      {OPTIONS.map((opt) => {
        const active = measure === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setMeasure(opt.value)}
            style={{
              padding: "3px 10px",
              fontSize: "10px",
              letterSpacing: "0.06em",
              fontFamily: "inherit",
              background: active ? "var(--accent-dim)" : "transparent",
              color: active ? "var(--accent)" : "var(--text-3)",
              border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
              borderRadius: "2px",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
