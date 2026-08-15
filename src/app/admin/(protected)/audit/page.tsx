import { getCurrentAdmin, listAuditLogs, countAuditLogs } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { describeAuditEntry } from "@/lib/audit";

export default async function AuditPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "view_audit_log")) {
    return <AccessRestricted />;
  }

  const [entries, total] = await Promise.all([
    listAuditLogs({ limit: 100 }),
    countAuditLogs(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
          Audit Trail
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Every record-affecting action taken by admin staff ({total} total)
        </p>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-black/5">
        <ul className="divide-y divide-black/5">
          {entries.length === 0 && (
            <li className="px-5 py-10 text-center text-sm text-neutral-400">
              No activity yet.
            </li>
          )}
          {entries.map((entry) => (
            <li key={entry.id} className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm text-ink">{describeAuditEntry(entry)}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {entry.actor?.name ?? "Unknown"} ({entry.actor?.email ?? "—"})
                </p>
              </div>
              <span className="shrink-0 text-xs text-neutral-400">
                {new Date(entry.createdAt).toLocaleString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
