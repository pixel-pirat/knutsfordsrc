import Link from "next/link";
import { Users, IdCard, CircleDollarSign, ShieldCheck, type LucideIcon } from "lucide-react";
import {
  getCurrentAdmin,
  countStudents,
  countPermits,
  listAdmins,
  permitsIssuedLast14Days,
  totalRevenue,
  getPermitStatusBreakdown,
  getPermitsByIssuer,
  listAuditLogs,
} from "@/db/adminQueries";
import { describeAuditEntry } from "@/lib/audit";
import { formatCurrency } from "@/lib/permits";
import { PermitsChart } from "@/components/admin/PermitsChart";
import { StatusBreakdownBar } from "@/components/admin/StatusBreakdownBar";
import { PermitsByIssuer } from "@/components/admin/PermitsByIssuer";

export default async function AdminOverviewPage() {
  const admin = await getCurrentAdmin();
  const [
    studentCount,
    permitCount,
    admins,
    chartData,
    revenue,
    statusBreakdown,
    issuerBreakdown,
    recentActivity,
  ] = await Promise.all([
    countStudents(),
    countPermits(),
    listAdmins(),
    permitsIssuedLast14Days(),
    totalRevenue(),
    getPermitStatusBreakdown(),
    getPermitsByIssuer(),
    listAuditLogs({ limit: 6 }),
  ]);

  const activeAdmins = admins.filter((a) => a.active).length;

  return (
    <div>
      <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
        Welcome back, <span className="font-semibold text-ink dark:text-neutral-100">{admin?.name}</span>
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={Users} label="Total Students" value={studentCount} />
        <StatCard icon={IdCard} label="Permits Issued" value={permitCount} />
        <StatCard icon={CircleDollarSign} label="Revenue Collected" value={formatCurrency(revenue)} />
        <StatCard icon={ShieldCheck} label="Active Admins" value={activeAdmins} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            PERMITS ISSUED — LAST 14 DAYS
          </h2>
          <div className="mt-5">
            <PermitsChart data={chartData} />
          </div>
        </div>

        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            PERMIT STATUS
          </h2>
          <div className="mt-5">
            <StatusBreakdownBar
              active={statusBreakdown.active}
              pending={statusBreakdown.pending}
              expired={statusBreakdown.expired}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
        <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
          PERMITS ISSUED BY STAFF
        </h2>
        <div className="mt-5">
          <PermitsByIssuer data={issuerBreakdown} />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400 dark:text-neutral-500">
            RECENT ACTIVITY
          </h2>
          <Link
            href="/admin/audit"
            className="text-xs font-semibold text-gold-dark dark:text-gold-light hover:underline"
          >
            view all
          </Link>
        </div>
        <ul className="space-y-4">
          {recentActivity.length === 0 && (
            <li className="text-sm text-neutral-400 dark:text-neutral-500">No activity yet.</li>
          )}
          {recentActivity.map((entry) => (
            <li key={entry.id} className="text-sm">
              <p className="text-ink dark:text-neutral-100">{describeAuditEntry(entry)}</p>
              <p className="mt-0.5 text-xs text-neutral-400 dark:text-neutral-500">
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

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/10 text-gold-dark dark:text-gold-light">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium text-neutral-500 dark:text-neutral-400 sm:text-sm">
        {label}
      </p>
    </div>
  );
}
