import { NextResponse } from "next/server";
import { adminStudentCreateSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminGuard";
import { hashPassword, generateTempPassword } from "@/lib/crypto";
import { getStudentByIndexNumber, createStudent } from "@/db/queries";
import { logAudit } from "@/db/adminQueries";

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("create_student");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = adminStudentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { indexNumber, firstName, lastName, email, phone, program, level, studyMode, avatarUrl } =
    parsed.data;

  const existing = await getStudentByIndexNumber(indexNumber);
  if (existing) {
    return NextResponse.json(
      { error: "A student with this index number already exists" },
      { status: 409 }
    );
  }

  const temporaryPassword = generateTempPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  const profileCompleted = Boolean(email && phone && program && level && studyMode);

  const [student] = await createStudent({
    indexNumber,
    firstName,
    lastName,
    passwordHash,
    email: email || null,
    phone: phone || null,
    program: program || null,
    level: level || null,
    studyMode: studyMode || null,
    avatarUrl: avatarUrl || null,
    profileCompleted,
    createdByAdminId: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "student.create",
    targetType: "student",
    targetId: student.id,
    metadata: {
      indexNumber: student.indexNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      viaPermitIssuance: false,
    },
  });

  return NextResponse.json({
    student: {
      id: student.id,
      indexNumber: student.indexNumber,
      firstName: student.firstName,
      lastName: student.lastName,
    },
    temporaryPassword,
  });
}
