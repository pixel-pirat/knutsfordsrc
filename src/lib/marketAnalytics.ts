import { buildTimeBuckets } from "@/lib/analyticsRange";
import type { OrderAnalyticsRow } from "@/db/orderQueries";

function amountOf(row: OrderAnalyticsRow) {
  const value = parseFloat(row.subtotal);
  return Number.isNaN(value) ? 0 : value;
}

export function buildMarketAnalytics(rows: OrderAnalyticsRow[], from: Date | null) {
  const totals = {
    count: rows.length,
    revenue: rows.reduce((sum, r) => sum + amountOf(r), 0),
  };

  const earliest =
    rows.length > 0
      ? rows.reduce((min, r) => (r.createdAt < min ? r.createdAt : min), rows[0].createdAt)
      : null;
  const buckets = buildTimeBuckets(from, earliest);
  const timeSeries = buckets.map((b) => {
    const inBucket = rows.filter((r) => r.createdAt >= b.start && r.createdAt < b.end);
    return {
      day: b.label,
      count: inBucket.length,
      revenue: inBucket.reduce((sum, r) => sum + amountOf(r), 0).toFixed(2),
    };
  });

  const statusBreakdown = groupBy(rows, (r) => r.status);
  const paymentBreakdown = groupBy(rows, (r) => r.paymentStatus);
  const storeBreakdown = groupBy(
    rows,
    (r) => r.storeName,
    (r) => r.storeId
  );

  return { totals, timeSeries, statusBreakdown, paymentBreakdown, storeBreakdown };
}

function groupBy(
  rows: OrderAnalyticsRow[],
  labelFn: (r: OrderAnalyticsRow) => string,
  keyFn?: (r: OrderAnalyticsRow) => string
) {
  const map = new Map<string, { key: string; label: string; count: number; revenue: number }>();
  for (const r of rows) {
    const label = labelFn(r);
    const key = keyFn ? keyFn(r) : label;
    const entry = map.get(key) ?? { key, label, count: 0, revenue: 0 };
    entry.count += 1;
    entry.revenue += amountOf(r);
    map.set(key, entry);
  }
  return [...map.values()].sort((a, b) => b.count - a.count);
}
