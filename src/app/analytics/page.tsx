"use client";
import { useEffect }              from "react";
import { useAppStore } from "../../store/appStore";
import { RegimeSelector } from "../../components/dashboard/RegimeSelector";
import { DateRangePicker } from "../../components/dashboard/DateRangePicker";
import { InflationToggle } from "../../components/dashboard/InflationToggle";
import { DeviationStatsPanel } from "../../components/analytics/DeviationStatsPanel";
import { DeviationHistogram } from "../../components/analytics/DeviationHistogram";
import { RollingStatsChart } from "../../components/analytics/RollingStatsChart";
import { ScatterPlots } from "../../components/analytics/ScatterPlots";
import { RegimeComparisonTable } from "../../components/analytics/RegimeComparisonTable";

export default function AnalyticsPage() {
  const fetchRaw      = useAppStore((s) => s.fetchRaw);
  const fetchRegimes  = useAppStore((s) => s.fetchRegimes);
  const fetchComputed = useAppStore((s) => s.fetchComputed);
  const isLoadingRaw  = useAppStore((s) => s.isLoadingRaw);

  useEffect(() => {
    Promise.all([fetchRaw(), fetchRegimes()]).then(() =>
      fetchComputed({ runOLS: false })
    );
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <header style={{
        borderBottom:   "1px solid var(--border)",
        padding:        "0 32px",
        height:         52,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        position:       "sticky",
        top:            0,
        zIndex:         100,
        background:     "var(--bg)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span className="font-display" style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em" }}>
            RBNZ
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-3)", letterSpacing: "0.1em" }}>
            POLICY TRACKER
          </span>
          <span style={{
            fontSize: "10px", padding: "2px 6px",
            background: "var(--accent-dim)", color: "var(--accent)",
            border: "1px solid var(--accent)", borderRadius: "2px",
            letterSpacing: "0.06em",
          }}>
            ANALYTICS
          </span>
        </div>
        <nav style={{ display: "flex", gap: 24, fontSize: "11px", letterSpacing: "0.08em" }}>
          {[
            { label: "DASHBOARD",   href: "/"            },
            { label: "ANALYTICS",   href: "/analytics"   },
            { label: "METHODOLOGY", href: "/methodology" },
          ].map(({ label, href }) => (
            <a key={label} href={href} style={{
              color:          label === "ANALYTICS" ? "var(--accent)" : "var(--text-3)",
              textDecoration: "none",
            }}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <main style={{ padding: "24px 32px", maxWidth: 1600, margin: "0 auto" }}>

        {/* Controls */}
        <div style={{
          display:       "flex",
          flexDirection: "column",
          gap:           10,
          padding:       "16px 20px",
          background:    "var(--bg-2)",
          border:        "1px solid var(--border)",
          marginBottom:  1,
        }}>
          <RegimeSelector />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <DateRangePicker />
            <InflationToggle />
          </div>
        </div>

        {isLoadingRaw ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "var(--text-3)", fontSize: "11px", letterSpacing: "0.1em" }}>
            LOADING DATA...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>

            {/* Row 1: Stats panel + Histogram side by side */}
            <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 1 }}>
              <DeviationStatsPanel />
              <DeviationHistogram />
            </div>

            {/* Row 2: Rolling stats full width */}
            <RollingStatsChart />

            {/* Row 3: Scatter plots full width */}
            <ScatterPlots />

            {/* Row 4: Regime comparison table full width */}
            <RegimeComparisonTable />

          </div>
        )}
      </main>
    </div>
  );
}