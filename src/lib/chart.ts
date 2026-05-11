// src/lib/chart.ts

/**
 * Format numeric timestamp (milliseconds) as quarter label.
 * Used with Recharts continuous time scale.
 */
export function tickFormatter(value: number): string {
  const date = new Date(value);
  const quarter = Math.floor(date.getUTCMonth() / 3) + 1;
  return `Q${quarter} ${date.getUTCFullYear()}`;
}