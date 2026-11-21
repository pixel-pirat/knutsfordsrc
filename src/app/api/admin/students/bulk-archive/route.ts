import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { bulkStudentIdsSchema } from "@/lib/validation";
import { bulkArchiveStudents, logAudit } from "@/db/adminQueries";

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("create_student");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = bulkStudentIdsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const archived = await bulkArchiveStudents(parsed.data.ids);

  await logAudit({
    actorId: admin.id,
    action: "student.bulk_archive",
    targetType: "student",
    metadata: {
      count: archived.length,
      indexNumbers: archived.map((s) => s.indexNumber),
    },
  });

  return NextResponse.json({ archived: archived.length });
}
