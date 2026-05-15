// src/app/page.tsx

"use client";
import { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import { RegimeSelector } from "../components/dashboard/RegimeSelector";
import { DateRangePicker } from "../components/dashboard/DateRangePicker";
import { MetricCards } from "../components/dashboard/MetricCards";
import { MainChart } from "../components/dashboard/MainChart";
import { DecompositionChart } from "../components/dashboard/DecompositionChart";
import { DeviationChart } from "../components/dashboard/DeviationChart";
import { ParameterPlayground } from "../components/dashboard/ParameterPlayground";
import { InflationToggle } from "../components/dashboard/InflationToggle";
import { NavBar } from "../components/ui/NavBar";

export default function DashboardPage() {
  const fetchRaw = useAppStore((s) => s.fetchRaw);
  const fetchRegimes = useAppStore((s) => s.fetchRegimes);
  const fetchComputed = useAppStore((s) => s.fetchComputed);
  const isLoadingRaw = useAppStore((s) => s.isLoadingRaw);

  // Collapse/expand state for 3 chart sections
  const [expandedCharts, setExpandedCharts] = useState({
    main: true,
    decomposition: true,
    deviation: true,
  });

  const toggleChart = (chart: "main" | "decomposition" | "deviation") => {
    setExpandedCharts((prev) => ({
      ...prev,
      [chart]: !prev[chart],
    }));
  };

  useEffect(() => {
    Promise.all([fetchRaw(), fetchRegimes()]).then(() => fetchComputed());
  }, []);

  const expandedCount = Object.values(expandedCharts).filter(Boolean).length;

  const mainChartHeight =
    expandedCount === 1 ? 620 : expandedCount === 2 ? 460 : 320;

  const secondaryChartHeight =
    expandedCount === 1 ? 420 : expandedCount === 2 ? 300 : 220;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <NavBar />

      <main style={{ padding: "24px 32px", maxWidth: 1600, margin: "0 auto" }}>
        {/* Controls bar */}
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

        {/* Loading state */}
        {isLoadingRaw && (
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
        )}

        {!isLoadingRaw && (
          <>
            {/* Metric cards */}
            <div style={{ marginBottom: 1 }}>
              <MetricCards />
            </div>

            {/* Main content: charts left, playground right */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 420px)",
                gap: 24,
                alignItems: "start",
              }}
            >
              {/* Charts column */}
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {/* Main chart */}
                <div
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    padding: "0 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: expandedCharts.main
                        ? "1px solid var(--border)"
                        : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        color: "var(--text-3)",
                        fontWeight: 600,
                      }}
                    >
                      INTEREST RATES
                    </span>
                    <button
                      onClick={() => toggleChart("main")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-3)",
                        fontSize: "12px",
                        transition: "transform 0.2s",
                        transform: expandedCharts.main
                          ? "rotate(0deg)"
                          : "rotate(-90deg)",
                      }}
                    >
                      ▼
                    </button>
                  </div>
                  {expandedCharts.main && (
                    <div style={{ padding: "16px 0" }}>
                      <MainChart height={mainChartHeight} />
                    </div>
                  )}
                </div>

                {/* Decomposition */}
                <div
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    padding: "0 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: expandedCharts.decomposition
                        ? "1px solid var(--border)"
                        : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        color: "var(--text-3)",
                        fontWeight: 600,
                      }}
                    >
                      TAYLOR RULE DECOMPOSITION
                    </span>
                    <button
                      onClick={() => toggleChart("decomposition")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-3)",
                        fontSize: "12px",
                        transition: "transform 0.2s",
                        transform: expandedCharts.decomposition
                          ? "rotate(0deg)"
                          : "rotate(-90deg)",
                      }}
                    >
                      ▼
                    </button>
                  </div>
                  {expandedCharts.decomposition && (
                    <div style={{ padding: "16px 0" }}>
                      <DecompositionChart height={secondaryChartHeight} />
                    </div>
                  )}
                </div>

                {/* Deviation */}
                <div
                  style={{
                    background: "var(--bg-2)",
                    border: "1px solid var(--border)",
                    padding: "0 20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 0",
                      borderBottom: expandedCharts.deviation
                        ? "1px solid var(--border)"
                        : "none",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.1em",
                        color: "var(--text-3)",
                        fontWeight: 600,
                      }}
                    >
                      OCR DEVIATION FROM TAYLOR RULE
                    </span>
                    <button
                      onClick={() => toggleChart("deviation")}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "4px 8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "var(--text-3)",
                        fontSize: "12px",
                        transition: "transform 0.2s",
                        transform: expandedCharts.deviation
                          ? "rotate(0deg)"
                          : "rotate(-90deg)",
                      }}
                    >
                      ▼
                    </button>
                  </div>
                  {expandedCharts.deviation && (
                    <div style={{ padding: "16px 0" }}>
                      <DeviationChart height={secondaryChartHeight} />
                    </div>
                  )}
                </div>
              </div>

              {/* Parameter playground */}
              <div
                style={{
                  background: "var(--bg-2)",
                  border: "1px solid var(--border)",
                  position: "sticky",
                  top: 72,
                }}
              >
                <ParameterPlayground />
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
