import { getCurrentAdmin, listStudents, searchStudents } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { StudentsTable } from "./StudentsTable";

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
          Search the student directory or click a row for full details
        </p>
      </div>

      <StudentsTable
        students={students}
        canCreate={hasPermission(admin, "create_student")}
        initialQuery={q ?? ""}
      />
    </div>
  );
}
