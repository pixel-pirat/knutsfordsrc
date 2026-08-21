import {
  getCurrentAdmin,
  listStudents,
  searchStudents,
  countStudents,
  countSearchStudents,
} from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { StudentsTable } from "./StudentsTable";

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "view_students")) {
    return <AccessRestricted />;
  }

  const { q, page: pageParam } = await searchParams;
  const query = q?.trim();
  const page = parsePage(pageParam);
  const offset = (page - 1) * PAGE_SIZE;

  const [students, total] = query
    ? await Promise.all([
        searchStudents(query, { limit: PAGE_SIZE, offset }),
        countSearchStudents(query),
      ])
    : await Promise.all([
        listStudents({ limit: PAGE_SIZE, offset }),
        countStudents(),
      ]);

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
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        total={total}
      />
    </div>
  );
}
