import Link from "next/link";
import { getCurrentAdmin, listPermits } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";

const statusStyles: Record<string, string> = {
  active: "bg-green-50 text-green-700",
  revoked: "bg-red-50 text-red-600",
  expired: "bg-neutral-100 text-neutral-500",
};

export default async function PermitsPage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "view_permits")) {
    return <AccessRestricted />;
  }

  const permits = await listPermits({ limit: 100 });

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Permits</h1>
          <p className="mt-1 text-sm text-neutral-500">
            All permits issued through the Digital Hub
          </p>
        </div>
        {hasPermission(admin, "issue_permit") && (
          <Link
            href="/admin/permits/new"
            className="rounded-md bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800"
          >
            Issue Permit
          </Link>
        )}
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3">Reference</th>
                <th className="px-5 py-3">Student</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3">Issued By</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {permits.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-neutral-400">
                    No permits issued yet.
                  </td>
                </tr>
              )}
              {permits.map((p) => (
                <tr key={p.id} className="border-b border-black/5 last:border-0">
                  <td className="px-5 py-3.5 font-medium text-ink">{p.referenceNumber}</td>
                  <td className="px-5 py-3.5 text-neutral-700">
                    {p.student?.firstName} {p.student?.lastName}
                    <span className="ml-1.5 text-xs text-neutral-400">
                      {p.student?.indexNumber}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-neutral-700">{p.permitType}</td>
                  <td className="px-5 py-3.5 text-neutral-700">{p.issuer?.name}</td>
                  <td className="px-5 py-3.5 text-neutral-500">
                    {new Date(p.issuedAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                        statusStyles[p.status] ?? "bg-neutral-100 text-neutral-500"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
