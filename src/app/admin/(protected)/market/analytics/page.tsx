import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { AnalyticsFilterBar } from "@/components/admin/AnalyticsFilterBar";
import { PermitsChart } from "@/components/admin/PermitsChart";
import { DonutBreakdown, type DonutSegment } from "@/components/admin/DonutBreakdown";
import { BarBreakdown } from "@/components/admin/BarBreakdown";
import { RANGE_OPTIONS, parseRange, rangeFromDate, rangeLabel } from "@/lib/analyticsRange";
import { buildMarketAnalytics } from "@/lib/marketAnalytics";
import { getOrderAnalyticsRows } from "@/db/orderQueries";
import { listStoresForAdmin } from "@/db/marketplaceQueries";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS } from "@/lib/marketplace";
import { ORDER_STATUS_VALUES, PAYMENT_STATUS_VALUES } from "@/lib/orderWorkflow";
import { formatCurrency } from "@/lib/permits";

const CATEGORICAL_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-chart-6)",
];

function colorForKey(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  return CATEGORICAL_COLORS[hash % CATEGORICAL_COLORS.length];
}

export default async function MarketAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    store?: string;
    status?: string;
    paymentStatus?: string;
  }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const params = await searchParams;
  const range = parseRange(params.range);
  const from = rangeFromDate(range);
  const storeId = params.store || undefined;
  const status = ORDER_STATUS_VALUES.includes(params.status as (typeof ORDER_STATUS_VALUES)[number])
    ? params.status
    : undefined;
  const paymentStatus = PAYMENT_STATUS_VALUES.includes(
    params.paymentStatus as (typeof PAYMENT_STATUS_VALUES)[number]
  )
    ? params.paymentStatus
    : undefined;

  const [rows, stores] = await Promise.all([
    getOrderAnalyticsRows({ from, storeId, status, paymentStatus }),
    listStoresForAdmin({ limit: 500 }),
  ]);

  const analytics = buildMarketAnalytics(rows, from);

  const statusData: DonutSegment[] = analytics.statusBreakdown.map((s) => ({
    key: s.key,
    label: ORDER_STATUS_LABELS[s.key] ?? s.label,
    value: s.count,
    color: colorForKey(s.key),
    secondaryLabel: formatCurrency(s.revenue),
  }));

  const paymentData: DonutSegment[] = analytics.paymentBreakdown.map((p) => ({
    key: p.key,
    label: PAYMENT_STATUS_LABELS[p.key] ?? p.label,
    value: p.count,
    color: colorForKey(p.key),
    secondaryLabel: formatCurrency(p.revenue),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Marketplace Analytics
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Sales and order activity across all stores, filtered by date range, store and status.
        </p>
      </div>

      <AnalyticsFilterBar
        basePath="/admin/market/analytics"
        fields={[
          {
            key: "range",
            label: "Range",
            value: range,
            options: RANGE_OPTIONS.map((r) => ({ value: r.value, label: r.label })),
          },
          {
            key: "store",
            label: "Store",
            value: storeId ?? "",
            allValue: "all",
            options: [
              { value: "all", label: "All Stores" },
              ...stores.map((s) => ({ value: s.id, label: s.name })),
            ],
          },
          {
            key: "status",
            label: "Order Status",
            value: status ?? "",
            allValue: "all",
            options: [
              { value: "all", label: "All Order Statuses" },
              ...ORDER_STATUS_VALUES.map((v) => ({ value: v, label: ORDER_STATUS_LABELS[v] ?? v })),
            ],
          },
          {
            key: "paymentStatus",
            label: "Payment Status",
            value: paymentStatus ?? "",
            allValue: "all",
            options: [
              { value: "all", label: "All Payment Statuses" },
              ...PAYMENT_STATUS_VALUES.map((v) => ({ value: v, label: PAYMENT_STATUS_LABELS[v] ?? v })),
            ],
          },
        ]}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {analytics.totals.count}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Orders placed ({rangeLabel(range)})
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {formatCurrency(analytics.totals.revenue)}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Order value ({rangeLabel(range)})
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            ORDERS &amp; VALUE OVER TIME
          </h2>
          <div className="mt-5">
            <PermitsChart data={analytics.timeSeries} unitLabel="order" />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            ORDER STATUS
          </h2>
          <div className="mt-5">
            <DonutBreakdown data={statusData} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            PAYMENT STATUS
          </h2>
          <div className="mt-5">
            <DonutBreakdown data={paymentData} />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            TOP STORES
          </h2>
          <div className="mt-5">
            <BarBreakdown
              data={analytics.storeBreakdown.map((s) => ({ ...s }))}
              formatSecondary={(d) => formatCurrency(d.revenue)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
