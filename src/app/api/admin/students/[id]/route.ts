import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { adminStudentUpdateSchema } from "@/lib/validation";
import { getStudentWithPermits, updateStudentByAdmin } from "@/db/queries";
import { getStudentByIndexNumber } from "@/db/queries";
import { logAudit } from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("view_students");
  if (error) return error;

  const { id } = await params;
  const student = await getStudentWithPermits(id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json({
    student: {
      id: student.id,
      indexNumber: student.indexNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      program: student.program,
      level: student.level,
      studyMode: student.studyMode,
      profileCompleted: student.profileCompleted,
      avatarUrl: student.avatarUrl,
      createdAt: student.createdAt,
      permits: student.permits.map((p) => ({
        id: p.id,
        referenceNumber: p.referenceNumber,
        amount: p.amount,
        cardStatus: p.cardStatus,
        issuedAt: p.issuedAt,
        expiresAt: p.expiresAt,
        issuer: p.issuer,
      })),
    },
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("create_student");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = adminStudentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const {
    indexNumber,
    firstName,
    lastName,
    email,
    phone,
    program,
    level,
    studyMode,
    avatarUrl,
  } = parsed.data;

  const conflict = await getStudentByIndexNumber(indexNumber);
  if (conflict && conflict.id !== id) {
    return NextResponse.json(
      { error: "Another student already uses this index number" },
      { status: 409 }
    );
  }

  const [updated] = await updateStudentByAdmin(id, {
    indexNumber,
    firstName,
    lastName,
    email: email || null,
    phone: phone || null,
    program: program || null,
    level: level || null,
    studyMode: studyMode || null,
    ...(avatarUrl ? { avatarUrl } : {}),
  });

  if (!updated) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "student.update",
    targetType: "student",
    targetId: updated.id,
    metadata: { indexNumber: updated.indexNumber },
  });

  return NextResponse.json({
    student: {
      id: updated.id,
      indexNumber: updated.indexNumber,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      program: updated.program,
      level: updated.level,
      studyMode: updated.studyMode,
      avatarUrl: updated.avatarUrl,
    },
  });
}
