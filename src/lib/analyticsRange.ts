export const RANGE_OPTIONS = [
  { value: "7d", label: "Last 7 days", days: 7 },
  { value: "14d", label: "Last 14 days", days: 14 },
  { value: "30d", label: "Last 30 days", days: 30 },
  { value: "90d", label: "Last 90 days", days: 90 },
  { value: "all", label: "All time", days: null },
] as const;

export type RangeValue = (typeof RANGE_OPTIONS)[number]["value"];

const DEFAULT_RANGE: RangeValue = "30d";

export function parseRange(value: string | undefined): RangeValue {
  return RANGE_OPTIONS.some((r) => r.value === value)
    ? (value as RangeValue)
    : DEFAULT_RANGE;
}

export function rangeFromDate(value: RangeValue): Date | null {
  const option = RANGE_OPTIONS.find((r) => r.value === value);
  if (!option || option.days === null) return null;
  const from = new Date();
  from.setHours(0, 0, 0, 0);
  from.setDate(from.getDate() - (option.days - 1));
  return from;
}

export function rangeLabel(value: RangeValue) {
  return RANGE_OPTIONS.find((r) => r.value === value)?.label ?? "Last 30 days";
}

/** Day-granularity buckets for ranges up to ~90 days, month buckets for "all time". */
export function buildTimeBuckets(
  from: Date | null,
  earliest: Date | null
): { key: string; label: string; start: Date; end: Date }[] {
  const now = new Date();
  if (from) {
    const buckets: { key: string; label: string; start: Date; end: Date }[] = [];
    const cursor = new Date(from);
    while (cursor <= now) {
      const start = new Date(cursor);
      const end = new Date(cursor);
      end.setDate(end.getDate() + 1);
      buckets.push({
        key: start.toISOString().slice(0, 10),
        label: start.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
        start,
        end,
      });
      cursor.setDate(cursor.getDate() + 1);
    }
    return buckets;
  }

  // All time -> month buckets from the earliest record (or last 6 months if none).
  const start = earliest ? new Date(earliest.getFullYear(), earliest.getMonth(), 1) : new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const buckets: { key: string; label: string; start: Date; end: Date }[] = [];
  const cursor = new Date(start);
  while (cursor <= now) {
    const bucketStart = new Date(cursor);
    const bucketEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    buckets.push({
      key: `${bucketStart.getFullYear()}-${bucketStart.getMonth()}`,
      label: bucketStart.toLocaleDateString("en-GB", { month: "short", year: "2-digit" }),
      start: bucketStart,
      end: bucketEnd,
    });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return buckets;
}
