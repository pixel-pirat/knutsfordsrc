import {
  getCurrentAdmin,
  getPermitAnalyticsRows,
  getTotalExpenses,
  listPrograms,
  type PermitStatusFilter,
} from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { AnalyticsFilterBar } from "@/components/admin/AnalyticsFilterBar";
import { PermitsChart } from "@/components/admin/PermitsChart";
import { DonutBreakdown, type DonutSegment } from "@/components/admin/DonutBreakdown";
import { BarBreakdown } from "@/components/admin/BarBreakdown";
import { RANGE_OPTIONS, parseRange, rangeFromDate, rangeLabel } from "@/lib/analyticsRange";
import { buildPermitAnalytics } from "@/lib/permitAnalytics";
import { formatCurrency } from "@/lib/permits";

const STATUS_VALUES = new Set(["active", "pending", "expired"]);
const LEVEL_VALUES = ["100", "200", "300", "400"];
const STUDY_MODE_VALUES = new Set(["regular", "weekend"]);
const PAYMENT_METHODS = ["Cash", "MoMo", "Bank Payment", "Free Card"];

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

export default async function PermitsDuesAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{
    range?: string;
    program?: string;
    level?: string;
    studyMode?: string;
    paymentMethod?: string;
    status?: string;
  }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  const params = await searchParams;
  const range = parseRange(params.range);
  const from = rangeFromDate(range);
  const program = params.program || undefined;
  const level = LEVEL_VALUES.includes(params.level ?? "") ? params.level : undefined;
  const studyMode = STUDY_MODE_VALUES.has(params.studyMode ?? "")
    ? (params.studyMode as "regular" | "weekend")
    : undefined;
  const paymentMethod = params.paymentMethod || undefined;
  const status = STATUS_VALUES.has(params.status ?? "") ? (params.status as PermitStatusFilter) : undefined;

  const [rows, programs, expenseTotal] = await Promise.all([
    getPermitAnalyticsRows({ from, program, level, studyMode, paymentMethod, status }),
    listPrograms(),
    getTotalExpenses(from),
  ]);

  const analytics = buildPermitAnalytics(rows, from);
  const netRevenue = analytics.totals.revenue - parseFloat(expenseTotal);

  const statusData: DonutSegment[] = [
    { key: "active", label: "Active", value: analytics.statusBreakdown.active, color: "#22c55e" },
    { key: "pending", label: "Pending", value: analytics.statusBreakdown.pending, color: "var(--color-gold)" },
    { key: "expired", label: "Expired", value: analytics.statusBreakdown.expired, color: "#d4d4d4" },
  ];

  const paymentData: DonutSegment[] = analytics.paymentBreakdown.map((p) => ({
    key: p.key,
    label: p.label,
    value: p.count,
    color: colorForKey(p.key),
    secondaryLabel: formatCurrency(p.revenue),
  }));

  const issuerData: DonutSegment[] = analytics.issuerBreakdown.map((i) => ({
    key: i.key,
    label: i.label,
    value: i.count,
    color: colorForKey(i.key),
    secondaryLabel: formatCurrency(i.revenue),
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Permit / Dues Analytics
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Permit issuance and revenue trends, filtered by date range, programme and more.
        </p>
      </div>

      <AnalyticsFilterBar
        basePath="/admin/analytics/permits-dues"
        fields={[
          {
            key: "range",
            label: "Range",
            value: range,
            options: RANGE_OPTIONS.map((r) => ({ value: r.value, label: r.label })),
          },
          {
            key: "program",
            label: "Programme",
            value: program ?? "",
            allValue: "all",
            options: [
              { value: "all", label: "All Programmes" },
              ...programs.map((p) => ({ value: p.name, label: p.name })),
            ],
          },
          {
            key: "level",
            label: "Level",
            value: level ?? "",
            allValue: "all",
            options: [
              { value: "all", label: "All Levels" },
              ...LEVEL_VALUES.map((l) => ({ value: l, label: `Level ${l}` })),
            ],
          },
          {
            key: "studyMode",
            label: "Study Mode",
            value: studyMode ?? "",
            allValue: "all",
            options: [
              { value: "all", label: "All Study Modes" },
              { value: "regular", label: "Regular" },
              { value: "weekend", label: "Weekend" },
            ],
          },
          {
            key: "paymentMethod",
            label: "Payment Method",
            value: paymentMethod ?? "",
            allValue: "all",
            options: [
              { value: "all", label: "All Payment Methods" },
              ...PAYMENT_METHODS.map((m) => ({ value: m, label: m })),
            ],
          },
          {
            key: "status",
            label: "Status",
            value: status ?? "",
            allValue: "all",
            options: [
              { value: "all", label: "All Statuses" },
              { value: "active", label: "Active" },
              { value: "pending", label: "Pending" },
              { value: "expired", label: "Expired" },
            ],
          },
        ]}
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {analytics.totals.count}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Permits issued ({rangeLabel(range)})
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {formatCurrency(analytics.totals.revenue)}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Gross revenue ({rangeLabel(range)})
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {formatCurrency(expenseTotal)}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Expenses ({rangeLabel(range)})
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {formatCurrency(netRevenue)}
          </p>
          <p className="mt-1 text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Net revenue ({rangeLabel(range)})
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            PERMITS &amp; REVENUE OVER TIME
          </h2>
          <div className="mt-5">
            <PermitsChart data={analytics.timeSeries} />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            STATUS
          </h2>
          <div className="mt-5">
            <DonutBreakdown data={statusData} />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            BY PROGRAMME
          </h2>
          <div className="mt-5">
            <BarBreakdown
              data={analytics.programBreakdown.map((p) => ({ ...p }))}
              formatSecondary={(d) => formatCurrency(d.revenue)}
            />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            BY LEVEL
          </h2>
          <div className="mt-5">
            <BarBreakdown
              data={analytics.levelBreakdown.map((l) => ({ ...l }))}
              formatSecondary={(d) => formatCurrency(d.revenue)}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            PAYMENT METHOD
          </h2>
          <div className="mt-5">
            <DonutBreakdown data={paymentData} />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            BY STAFF
          </h2>
          <div className="mt-5">
            <DonutBreakdown data={issuerData} />
          </div>
        </div>
      </div>
    </div>
  );
}
