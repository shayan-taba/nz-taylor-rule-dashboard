// src/components/dashboard/DeviationChart.tsx

"use client";

import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

import { useChartData } from "../../hooks/useChartData";

import { tickFormatter } from "../../lib/chart";

import { ChartTooltip } from "../ui/Tooltip";

interface Props {
  height?: number;
}

export function DeviationChart({ height = 320 }: Props) {
  const data = useChartData();

  // Split positive/negative deviations
  const enriched = data.map((row) => ({
    ...row,

    devPositive:
      row.deviation !== null && row.deviation > 0 ? row.deviation : null,

    devNegative:
      row.deviation !== null && row.deviation <= 0 ? row.deviation : null,
  }));

  return (
    <div>
      {/* Header */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",

          alignItems: "center",

          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontSize: "10px",

            letterSpacing: "0.1em",

            color: "var(--text-3)",
          }}
        >
          OCR DEVIATION FROM TAYLOR RULE — pp
        </span>

        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: "10px",
          }}
        >
          <span
            style={{
              color: "var(--hawkish)",
            }}
          >
            ▲ Hawkish
          </span>

          <span
            style={{
              color: "var(--dovish)",
            }}
          >
            ▼ Dovish
          </span>
        </div>
      </div>

      {/* Chart */}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={enriched}
          margin={{
            top: 4,
            right: 20,
            bottom: 0,
            left: -10,
          }}
        >
          <CartesianGrid strokeDasharray="0" stroke="var(--border)" />

          {/* X Axis — Continuous Time */}

          <XAxis
            dataKey="timestamp"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickCount={10}
            interval="preserveStartEnd"
            allowDuplicatedCategory={false}
            minTickGap={60}
            padding={{ left: 8, right: 24 }}
            tickFormatter={tickFormatter}
            tick={{
              fontSize: 10,
              fill: "var(--text-3)",
              fontFamily: "inherit",
            }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />

          {/* Y Axis */}

          <YAxis
            tick={{
              fontSize: 10,
              fill: "var(--text-3)",
              fontFamily: "inherit",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v > 0 ? "+" : ""}${v}pp`}
            width={48}
          />

          {/* Tooltip */}

          <Tooltip content={<ChartTooltip />} />

          {/* Zero line */}

          <ReferenceLine y={0} stroke="var(--border-2)" strokeWidth={1} />

          {/* Positive */}

          <Area
            dataKey="devPositive"
            name="Hawkish deviation"
            fill="var(--hawkish)"
            fillOpacity={0.25}
            stroke="var(--hawkish)"
            strokeWidth={1.5}
            connectNulls={false}
          />

          {/* Negative */}

          <Area
            dataKey="devNegative"
            name="Dovish deviation"
            fill="var(--dovish)"
            fillOpacity={0.25}
            stroke="var(--dovish)"
            strokeWidth={1.5}
            connectNulls={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
