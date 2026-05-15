"use client";
import { useEffect } from "react";
import { useAppStore } from "../../store/appStore";
import { RegimeSelector } from "../../components/dashboard/RegimeSelector";
import { DateRangePicker } from "../../components/dashboard/DateRangePicker";
import { InflationToggle } from "../../components/dashboard/InflationToggle";
import { DeviationStatsPanel } from "../../components/analytics/DeviationStatsPanel";
import { DeviationHistogram } from "../../components/analytics/DeviationHistogram";
import { RollingStatsChart } from "../../components/analytics/RollingStatsChart";
import { ScatterPlots } from "../../components/analytics/ScatterPlots";
import { RegimeComparisonTable } from "../../components/analytics/RegimeComparisonTable";
import { NavBar } from "../../components/ui/NavBar";

export default function AnalyticsPage() {
  const fetchRaw = useAppStore((s) => s.fetchRaw);
  const fetchRegimes = useAppStore((s) => s.fetchRegimes);
  const fetchComputed = useAppStore((s) => s.fetchComputed);
  const isLoadingRaw = useAppStore((s) => s.isLoadingRaw);

  useEffect(() => {
    Promise.all([fetchRaw(), fetchRegimes()]).then(() =>
      fetchComputed({ runOLS: false }),
    );
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <NavBar />

      <main style={{ padding: "24px 32px", maxWidth: 1600, margin: "0 auto" }}>
        {/* Controls */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "16px 20px",
            background: "var(--bg-2)",
            border: "1px solid var(--border)",
            marginBottom: 1,
          }}
        >
          <RegimeSelector />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <DateRangePicker />
            <InflationToggle />
          </div>
        </div>

        {isLoadingRaw ? (
          <div
            style={{
              padding: "48px 0",
              textAlign: "center",
              color: "var(--text-3)",
              fontSize: "11px",
              letterSpacing: "0.1em",
            }}
          >
            LOADING DATA...
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* Row 1: Stats panel + Histogram side by side */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "340px 1fr",
                gap: 1,
              }}
            >
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
