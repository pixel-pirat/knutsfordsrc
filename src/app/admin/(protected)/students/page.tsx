import { getCurrentAdmin, listStudents, searchStudents } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "view_students")) {
    return <AccessRestricted />;
  }

  const { q } = await searchParams;
  const students = q ? await searchStudents(q, { limit: 100 }) : await listStudents({ limit: 100 });

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Students</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Search the student directory by index number, name or email
        </p>
      </div>

      <form method="GET" className="mb-5">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by index number, name or email…"
          className="w-full max-w-md rounded-md border border-black/10 bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-neutral-400 outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </form>

      <div className="rounded-2xl bg-white ring-1 ring-black/5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead>
              <tr className="border-b border-black/10 bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3">Index Number</th>
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Programme</th>
                <th className="px-5 py-3">Level</th>
                <th className="px-5 py-3">Profile</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-neutral-400">
                    No students found.
                  </td>
                </tr>
              )}
              {students.map((s) => (
                <tr key={s.id} className="border-b border-black/5 last:border-0">
                  <td className="px-5 py-3.5 font-medium text-ink">{s.indexNumber}</td>
                  <td className="px-5 py-3.5 text-neutral-700">
                    {s.firstName} {s.lastName}
                  </td>
                  <td className="px-5 py-3.5 text-neutral-500">{s.program ?? "—"}</td>
                  <td className="px-5 py-3.5 text-neutral-500">{s.level ?? "—"}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        s.profileCompleted
                          ? "bg-green-50 text-green-700"
                          : "bg-gold/15 text-gold-dark"
                      }`}
                    >
                      {s.profileCompleted ? "Complete" : "Incomplete"}
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
