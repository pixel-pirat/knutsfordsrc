import Link from "next/link";
import { getCurrentAdmin } from "@/db/adminQueries";
import {
  countStudents,
  countPermits,
  countPermitsThisMonth,
  listAdmins,
  permitsIssuedLast7Days,
  listAuditLogs,
} from "@/db/adminQueries";
import { describeAuditEntry } from "@/lib/audit";

export default async function AdminOverviewPage() {
  const admin = await getCurrentAdmin();
  const [studentCount, permitCount, permitsThisMonth, admins, weekData, recentActivity] =
    await Promise.all([
      countStudents(),
      countPermits(),
      countPermitsThisMonth(),
      listAdmins(),
      permitsIssuedLast7Days(),
      listAuditLogs({ limit: 6 }),
    ]);

  const activeAdmins = admins.filter((a) => a.active).length;
  const maxDay = Math.max(1, ...weekData.map((d) => d.count));

  return (
    <div>
      <p className="mb-6 text-sm text-neutral-500">
        Welcome back, <span className="font-semibold text-ink">{admin?.name}</span>
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatTile label="Total Students" value={studentCount} />
        <StatTile label="Permits Issued" value={permitCount} />
        <StatTile label="Permits This Month" value={permitsThisMonth} />
        <StatTile label="Active Admins" value={activeAdmins} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5 lg:col-span-2">
          <h2 className="text-sm font-bold tracking-wide text-neutral-400">
            PERMITS ISSUED — LAST 7 DAYS
          </h2>
          <div className="mt-5 space-y-3">
            {weekData.map((d) => (
              <div key={d.day} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-xs font-medium text-neutral-500">
                  {d.day}
                </span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className="h-full rounded-full bg-gold"
                    style={{ width: `${(d.count / maxDay) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs font-semibold text-ink">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 ring-1 ring-black/5">
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
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5">
      <p className="text-2xl font-extrabold text-ink sm:text-3xl">{value}</p>
      <p className="mt-1 text-xs font-medium text-neutral-500 sm:text-sm">
        {label}
      </p>
    </div>
  );
}
