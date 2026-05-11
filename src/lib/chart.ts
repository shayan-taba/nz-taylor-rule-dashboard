export function tickFilter<T extends { label: string }>(data: T[], maxTicks = 12) {
  if (data.length <= maxTicks) return (value: string) => value;
  const step = Math.ceil(data.length / maxTicks);
  return (_: string, index: number) => (index % step === 0 ? data[index]?.label ?? "" : "");
}
