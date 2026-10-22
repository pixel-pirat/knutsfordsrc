import { getCurrentStudent, getStudentWithPermits } from "@/db/queries";
import { getPermitStatus, permitStatusBadge, formatCurrency } from "@/lib/permits";

function formatDate(value: Date | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function StudentPermitsPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const withPermits = await getStudentWithPermits(student.id);
  const permits = withPermits?.permits ?? [];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Permits
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Your SRC permit history and their current status
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        {permits.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No permits issued yet — once the SRC office issues you a permit it
            will appear here.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-black/5 text-left text-xs font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                  <th className="px-5 py-3.5 font-bold">Reference</th>
                  <th className="px-5 py-3.5 font-bold">Type</th>
                  <th className="px-5 py-3.5 font-bold">Amount</th>
                  <th className="px-5 py-3.5 font-bold">Payment</th>
                  <th className="px-5 py-3.5 font-bold">Issued</th>
                  <th className="px-5 py-3.5 font-bold">Expires</th>
                  <th className="px-5 py-3.5 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/10">
                {permits.map((permit) => {
                  const status = getPermitStatus(permit);
                  return (
                    <tr key={permit.id}>
                      <td className="px-5 py-3.5 font-mono text-xs font-semibold text-ink dark:text-neutral-100">
                        {permit.referenceNumber}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                        {permit.permitType}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                        {formatCurrency(permit.amount)}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                        {permit.paymentMethod ?? "—"}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                        {formatDate(permit.issuedAt)}
                      </td>
                      <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                        {formatDate(permit.expiresAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <span
                          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${permitStatusBadge[status]}`}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
