// src/components/dashboard/MainChart.tsx

"use client";

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useAppStore } from "../../store/appStore";
import { useChartData } from "../../hooks/useChartData";
import { tickFormatter } from "../../lib/chart";
import { ChartTooltip } from "../ui/Tooltip";

interface Props {
  height?: number;
}

export function MainChart({ height = 320 }: Props) {
  const showInertial = useAppStore((s) => s.showInertial);

  const data = useChartData();

  return (
    <div>
      {/* ───────────────────────────────────── */}
      {/* Header */}
      {/* ───────────────────────────────────── */}

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
          INTEREST RATES — %
        </span>

        {/* Legend */}
        <div
          style={{
            display: "flex",
            gap: 16,
            fontSize: "10px",
            color: "var(--text-2)",
          }}
        >
          {[
            {
              color: "var(--ocr)",
              label: "OCR (Actual)",
            },

            {
              color: "var(--taylor)",
              label: "Taylor Rule",
            },

            {
              color: "var(--inertial)",
              label: "Inertial Taylor",
            },

            {
              color: "var(--pi-star)",
              label: "π* Target",
            },
          ].map(({ color, label }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 2,
                  background: color,
                }}
              />

              <span>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ───────────────────────────────────── */}
      {/* Chart */}
      {/* ───────────────────────────────────── */}

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={data}
          margin={{
            top: 4,
            right: 20,
            bottom: 0,
            left: -10,
          }}
        >
          {/* Grid */}
          <CartesianGrid strokeDasharray="0" stroke="var(--border)" />

          {/* ───────────────────────────── */}
          {/* X Axis — CONTINUOUS TIME */}
          {/* ───────────────────────────── */}

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
            axisLine={{
              stroke: "var(--border)",
            }}
            tickLine={false}
          />

          {/* ───────────────────────────── */}
          {/* Y Axis */}
          {/* ───────────────────────────── */}

          <YAxis
            tick={{
              fontSize: 10,
              fill: "var(--text-3)",
              fontFamily: "inherit",
            }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
            width={40}
          />

          {/* ───────────────────────────── */}
          {/* Tooltip */}
          {/* ───────────────────────────── */}

          <Tooltip content={<ChartTooltip />} />

          {/* ───────────────────────────── */}
          {/* π* Target */}
          {/* ───────────────────────────── */}

          <Line
            dataKey="piStar"
            name="π* Target"
            stroke="var(--pi-star)"
            strokeWidth={1}
            dot={false}
            strokeDasharray="2 4"
            connectNulls
          />

          {/* ───────────────────────────── */}
          {/* Inertial Taylor */}
          {/* ───────────────────────────── */}

          {showInertial && (
            <Line
              dataKey="inertialRate"
              name="Inertial Taylor"
              stroke="var(--inertial)"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="4 3"
              connectNulls
            />
          )}

          {/* ───────────────────────────── */}
          {/* Taylor Rule */}
          {/* ───────────────────────────── */}

          <Line
            dataKey="taylorRate"
            name="Taylor Rule"
            stroke="var(--taylor)"
            strokeWidth={2}
            dot={false}
            strokeDasharray="6 3"
            connectNulls
          />

          {/* ───────────────────────────── */}
          {/* OCR */}
          {/* ───────────────────────────── */}

          <Line
            dataKey="ocr"
            name="OCR (Actual)"
            stroke="var(--ocr)"
            strokeWidth={2.5}
            dot={false}
            connectNulls
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
