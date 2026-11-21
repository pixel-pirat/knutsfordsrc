import {
  getCurrentAdmin,
  listStudents,
  searchStudents,
  countStudents,
  countSearchStudents,
  type ArchivedFilter,
} from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import { StudentsTable } from "./StudentsTable";

const ARCHIVED_VALUES = new Set(["active", "archived", "all"]);

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; archived?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "view_students")) {
    return <AccessRestricted />;
  }

  const { q, page: pageParam, archived: archivedParam } = await searchParams;
  const query = q?.trim();
  const page = parsePage(pageParam);
  const offset = (page - 1) * PAGE_SIZE;
  const archived: ArchivedFilter = ARCHIVED_VALUES.has(archivedParam ?? "")
    ? (archivedParam as ArchivedFilter)
    : "active";

  const [students, total] = query
    ? await Promise.all([
        searchStudents(query, { limit: PAGE_SIZE, offset, archived }),
        countSearchStudents(query, archived),
      ])
    : await Promise.all([
        listStudents({ limit: PAGE_SIZE, offset, archived }),
        countStudents(archived),
      ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">Students</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Search the student directory or click a row for full details
        </p>
      </div>

      <StudentsTable
        students={students.map((s) => ({
          id: s.id,
          indexNumber: s.indexNumber,
          firstName: s.firstName,
          lastName: s.lastName,
          email: s.email,
          phone: s.phone,
          program: s.program,
          level: s.level,
          avatarUrl: s.avatarUrl,
          hallName: s.hall?.name ?? null,
          archivedAt: s.archivedAt ? s.archivedAt.toISOString() : null,
        }))}
        canCreate={hasPermission(admin, "create_student")}
        initialQuery={q ?? ""}
        archived={archived}
        page={page}
        totalPages={Math.max(1, Math.ceil(total / PAGE_SIZE))}
        total={total}
      />
    </div>
  );
}
