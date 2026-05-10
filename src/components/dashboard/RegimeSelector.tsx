"use client";
import { useAppStore } from "../../store/appStore";
import type { RegimeDefinition } from "../../types";

export function RegimeSelector() {
  const regimes      = useAppStore((s) => s.regimes);
  const activeRegime = useAppStore((s) => s.activeRegime);
  const setRegime    = useAppStore((s) => s.setRegime);

  const governors = [...regimes]
    .filter((r) => r.type === "governor")
    .sort(
      (a, b) =>
        new Date(a.startDate).getTime() -
        new Date(b.startDate).getTime()
    );
  const episodes = regimes.filter((r) => r.type === "episode");

  const btn = (r: RegimeDefinition) => {
    const isActive = activeRegime === r.id;
    return (
      <button
        key={r.id}
        onClick={() => setRegime(isActive ? null : r.id)}
        style={{
          padding:      "4px 12px",
          fontSize:     "11px",
          letterSpacing: "0.06em",
          fontFamily:   "inherit",
          fontWeight:   isActive ? 500 : 400,
          background:   isActive ? "var(--accent-dim)" : "transparent",
          color:        isActive ? "var(--accent)"     : "var(--text-2)",
          border:       `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
          borderRadius: "2px",
          cursor:       "pointer",
          transition:   "all 0.15s ease",
          whiteSpace:   "nowrap",
        }}
      >
        {r.label.toUpperCase()}
      </button>
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {/* All history button */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: "10px", color: "var(--text-3)", letterSpacing: "0.1em", width: 64 }}>
          GOVERNOR
        </span>
        <button
          onClick={() => setRegime(null)}
          style={{
            padding:      "4px 12px",
            fontSize:     "11px",
            letterSpacing: "0.06em",
            fontFamily:   "inherit",
            fontWeight:   activeRegime === null ? 500 : 400,
            background:   activeRegime === null ? "var(--accent-dim)" : "transparent",
            color:        activeRegime === null ? "var(--accent)"     : "var(--text-2)",
            border:       `1px solid ${activeRegime === null ? "var(--accent)" : "var(--border)"}`,
            borderRadius: "2px",
            cursor:       "pointer",
            transition:   "all 0.15s ease",
          }}
        >
          ALL HISTORY
        </button>
        {governors.map(btn)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: "10px", color: "var(--text-3)", letterSpacing: "0.1em", width: 64 }}>
          EPISODE
        </span>
        {episodes.map(btn)}
      </div>
    </div>
  );
}