import Link from "next/link";
import {
  getCurrentAdmin,
  countStudents,
  countPermits,
  listAdmins,
  permitsIssuedLast14Days,
  totalRevenue,
  getPermitStatusBreakdown,
  listAuditLogs,
} from "@/db/adminQueries";
import { describeAuditEntry } from "@/lib/audit";
import { formatCurrency } from "@/lib/permits";
import { PermitsChart } from "@/components/admin/PermitsChart";
import { StatusBreakdownBar } from "@/components/admin/StatusBreakdownBar";

export default async function AdminOverviewPage() {
  const admin = await getCurrentAdmin();
  const [
    studentCount,
    permitCount,
    admins,
    chartData,
    revenue,
    statusBreakdown,
    recentActivity,
  ] = await Promise.all([
    countStudents(),
    countPermits(),
    listAdmins(),
    permitsIssuedLast14Days(),
    totalRevenue(),
    getPermitStatusBreakdown(),
    listAuditLogs({ limit: 6 }),
  ]);

  const activeAdmins = admins.filter((a) => a.active).length;

  return (
    <div>
      <p className="mb-6 text-sm text-neutral-500">
        Welcome back, <span className="font-semibold text-ink">{admin?.name}</span>
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total Students" value={studentCount} />
        <StatTile label="Permits Issued" value={permitCount} />
        <StatTile label="Revenue Collected" value={formatCurrency(revenue)} />
        <StatTile label="Active Admins" value={activeAdmins} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 lg:col-span-2">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400">
            PERMITS ISSUED — LAST 14 DAYS
          </h2>
          <div className="mt-5">
            <PermitsChart data={chartData} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400">
            PERMIT STATUS
          </h2>
          <div className="mt-5">
            <StatusBreakdownBar
              active={statusBreakdown.active}
              expired={statusBreakdown.expired}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-black/5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400">
            RECENT ACTIVITY
          </h2>
          <Link
            href="/admin/audit"
            className="text-xs font-semibold text-gold-dark hover:underline"
          >
            view all
          </Link>
        </div>
        <ul className="space-y-4">
          {recentActivity.length === 0 && (
            <li className="text-sm text-neutral-400">No activity yet.</li>
          )}
          {recentActivity.map((entry) => (
            <li key={entry.id} className="text-sm">
              <p className="text-ink">{describeAuditEntry(entry)}</p>
              <p className="mt-0.5 text-xs text-neutral-400">
                {entry.actor?.name ?? "Unknown"} &middot;{" "}
                {new Date(entry.createdAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
      <p className="text-2xl font-extrabold text-ink sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium text-neutral-500 sm:text-sm">
        {label}
      </p>
    </div>
  );
}
