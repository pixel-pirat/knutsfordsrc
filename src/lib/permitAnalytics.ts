import { getPermitStatus } from "@/lib/permits";
import { buildTimeBuckets } from "@/lib/analyticsRange";

export type PermitAnalyticsRow = {
  issuedAt: Date;
  expiresAt: Date | null;
  cardStatus: string;
  amount: string | null;
  paymentMethod: string | null;
  issuerId: string;
  issuerName: string;
  program: string | null;
  level: string | null;
  studyMode: string | null;
};

function amountOf(row: PermitAnalyticsRow) {
  return row.amount ? parseFloat(row.amount) : 0;
}

export function buildPermitAnalytics(rows: PermitAnalyticsRow[], from: Date | null) {
  const totals = {
    count: rows.length,
    revenue: rows.reduce((sum, r) => sum + amountOf(r), 0),
  };

  const earliest =
    rows.length > 0
      ? rows.reduce((min, r) => (r.issuedAt < min ? r.issuedAt : min), rows[0].issuedAt)
      : null;
  const buckets = buildTimeBuckets(from, earliest);
  const timeSeries = buckets.map((b) => {
    const inBucket = rows.filter((r) => r.issuedAt >= b.start && r.issuedAt < b.end);
    return {
      day: b.label,
      count: inBucket.length,
      revenue: inBucket.reduce((sum, r) => sum + amountOf(r), 0).toFixed(2),
    };
  });

  const statusBreakdown = { active: 0, pending: 0, expired: 0 };
  for (const r of rows) statusBreakdown[getPermitStatus(r)] += 1;

  const paymentBreakdown = groupBy(rows, (r) => r.paymentMethod ?? "Unspecified");
  const programBreakdown = groupBy(rows, (r) => r.program ?? "Unspecified");
  const levelBreakdown = groupBy(rows, (r) => (r.level ? `Level ${r.level}` : "Unspecified"));
  const issuerBreakdown = groupBy(
    rows,
    (r) => r.issuerName,
    (r) => r.issuerId
  );

  return { totals, timeSeries, statusBreakdown, paymentBreakdown, programBreakdown, levelBreakdown, issuerBreakdown };
}

function groupBy(
  rows: PermitAnalyticsRow[],
  labelFn: (r: PermitAnalyticsRow) => string,
  keyFn?: (r: PermitAnalyticsRow) => string
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
