export function toQuarterLabel(dateStr: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `Q${Math.ceil((d.getUTCMonth() + 1) / 3)} ${d.getUTCFullYear()}`;
}

export function formatPercent(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "—";
  return `${value.toFixed(decimals)}%`;
}

export function formatSignedPercent(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined) return "—";
  return `${value >= 0 ? "+" : ""}${value.toFixed(decimals)}%`;
}

export function ordinalQuarterLabel(count: number): string {
  return count === 1 ? "1 quarter" : `${count} quarters`;
}

export function dateKey(dateStr: string): string {
  return dateStr.split("T")[0];
}
