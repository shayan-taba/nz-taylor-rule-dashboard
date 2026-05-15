import React from "react";

interface Props {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}

export function ChartTooltip({ active, payload, label }: Props) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-3)",
        border: "1px solid var(--border-2)",
        padding: "10px 14px",
        fontSize: "11px",
        fontFamily: "var(--font-mono, monospace)",
      }}
    >
      <div
        style={{
          color: "var(--text-2)",
          marginBottom: 6,
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={p.name}
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 16,
            color: p.color,
          }}
        >
          <span style={{ color: "var(--text-2)" }}>{p.name}</span>
          <span style={{ fontWeight: 500 }}>
            {typeof p.value === "number" ? p.value.toFixed(2) : p.value}%
          </span>
        </div>
      ))}
    </div>
  );
}
