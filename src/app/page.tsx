"use client";
import { useEffect } from "react";
import { useAppStore } from "../store/appStore";
import { RegimeSelector } from "../store/RegimeSelector";
import { DateRangePicker } from "../store/DateRangePicker";
import { MetricCards } from "../components/dashboard/MetricCards";
import { MainChart } from "../components/dashboard/MainChart";
import { DecompositionChart } from "../components/dashboard/DecompositionChart";
import { DeviationChart } from "../components/dashboard/DeviationChart";
import { ParameterPlayground } from "../components/dashboard/ParameterPlayground";
import { InflationToggle } from "../components/dashboard/InflationToggle";

export default function DashboardPage() {
  const fetchRaw      = useAppStore((s) => s.fetchRaw);
  const fetchRegimes  = useAppStore((s) => s.fetchRegimes);
  const fetchComputed = useAppStore((s) => s.fetchComputed);
  const isLoadingRaw  = useAppStore((s) => s.isLoadingRaw);

  useEffect(() => {
    Promise.all([fetchRaw(), fetchRegimes()]).then(() => fetchComputed());
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>

      {/* Header */}
      <header style={{
        borderBottom: "1px solid var(--border)",
        padding:      "0 32px",
        height:       52,
        display:      "flex",
        alignItems:   "center",
        justifyContent: "space-between",
        position:     "sticky",
        top:          0,
        zIndex:       100,
        background:   "var(--bg)",
      }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <span className="font-display" style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.01em", color: "var(--text)" }}>
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
            TAYLOR RULE
          </span>
        </div>
        <nav style={{ display: "flex", gap: 24, fontSize: "11px", letterSpacing: "0.08em" }}>
          {["DASHBOARD", "ANALYTICS", "METHODOLOGY"].map((page) => (
            <a
              key={page}
              href={page === "DASHBOARD" ? "/" : `/${page.toLowerCase()}`}
              style={{
                color:          page === "DASHBOARD" ? "var(--accent)" : "var(--text-3)",
                textDecoration: "none",
              }}
            >
              {page}
            </a>
          ))}
        </nav>
      </header>

      <main style={{ padding: "24px 32px", maxWidth: 1600, margin: "0 auto" }}>

        {/* Controls bar */}
        <div style={{
          display:      "flex",
          flexDirection: "column",
          gap:          10,
          padding:      "16px 20px",
          background:   "var(--bg-2)",
          border:       "1px solid var(--border)",
          marginBottom: 1,
        }}>
          <RegimeSelector />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <DateRangePicker />
            <InflationToggle />
          </div>
        </div>

        {/* Loading state */}
        {isLoadingRaw && (
          <div style={{
            padding:   "48px 0",
            textAlign: "center",
            color:     "var(--text-3)",
            fontSize:  "11px",
            letterSpacing: "0.1em",
          }}>
            LOADING DATA...
          </div>
        )}

        {!isLoadingRaw && (
          <>
            {/* Metric cards */}
            <div style={{ marginBottom: 1 }}>
              <MetricCards />
            </div>

            {/* Main content: charts left, playground right */}
            <div style={{
              display:             "grid",
              gridTemplateColumns: "1fr 280px",
              gap:                 1,
              alignItems:          "start",
            }}>

              {/* Charts column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>

                {/* Main chart */}
                <div style={{
                  background: "var(--bg-2)",
                  border:     "1px solid var(--border)",
                  padding:    "20px 20px 16px",
                }}>
                  <MainChart />
                </div>

                {/* Decomposition */}
                <div style={{
                  background: "var(--bg-2)",
                  border:     "1px solid var(--border)",
                  padding:    "20px 20px 16px",
                }}>
                  <DecompositionChart />
                </div>

                {/* Deviation */}
                <div style={{
                  background: "var(--bg-2)",
                  border:     "1px solid var(--border)",
                  padding:    "20px 20px 16px",
                }}>
                  <DeviationChart />
                </div>

              </div>

              {/* Parameter playground */}
              <div style={{
                background: "var(--bg-2)",
                border:     "1px solid var(--border)",
                position:   "sticky",
                top:        72,
              }}>
                <ParameterPlayground />
              </div>

            </div>
          </>
        )}
      </main>
    </div>
  );
}