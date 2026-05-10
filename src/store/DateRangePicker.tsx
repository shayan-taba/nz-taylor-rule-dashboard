"use client";
import { useState, useEffect } from "react";
import { useAppStore } from "./appStore";

export function DateRangePicker() {
  const dateRange    = useAppStore((s) => s.dateRange);
  const setDateRange = useAppStore((s) => s.setDateRange);

  const [localStart, setLocalStart] = useState(dateRange.start);
  const [localEnd,   setLocalEnd]   = useState(dateRange.end);

  useEffect(() => {
    setLocalStart(dateRange.start);
    setLocalEnd(dateRange.end);
  }, [dateRange]);

  const apply = () => {
    if (localStart && localEnd && localStart <= localEnd) {
      setDateRange({ start: localStart, end: localEnd });
    }
  };

  const inputStyle: React.CSSProperties = {
    background:    "var(--bg-3)",
    border:        "1px solid var(--border)",
    borderRadius:  "2px",
    color:         "var(--text)",
    fontFamily:    "inherit",
    fontSize:      "11px",
    padding:       "4px 8px",
    outline:       "none",
    colorScheme:   "dark",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: "10px", color: "var(--text-3)", letterSpacing: "0.1em" }}>
        CUSTOM
      </span>
      <input
        type="date"
        value={localStart}
        min="2000-03-31"
        max={localEnd}
        onChange={(e) => setLocalStart(e.target.value)}
        style={inputStyle}
      />
      <span style={{ color: "var(--text-3)", fontSize: "11px" }}>→</span>
      <input
        type="date"
        value={localEnd}
        min={localStart}
        max={new Date().toISOString().split("T")[0]}
        onChange={(e) => setLocalEnd(e.target.value)}
        style={inputStyle}
      />
      <button
        onClick={apply}
        style={{
          padding:      "4px 12px",
          fontSize:     "11px",
          letterSpacing: "0.06em",
          fontFamily:   "inherit",
          background:   "transparent",
          color:        "var(--accent)",
          border:       "1px solid var(--accent)",
          borderRadius: "2px",
          cursor:       "pointer",
        }}
      >
        APPLY
      </button>
    </div>
  );
}