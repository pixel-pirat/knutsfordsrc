import { NextResponse } from "next/server";
import { permitIssueSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminGuard";
import { hasPermission } from "@/lib/permissions";
import { hashPassword, generateTempPassword } from "@/lib/crypto";
import { getStudentByIndexNumber, createStudent } from "@/db/queries";
import { createPermit, generatePermitReference, logAudit } from "@/db/adminQueries";

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("issue_permit");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = permitIssueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { student: studentInput, permitType, notes } = parsed.data;

  let student = await getStudentByIndexNumber(studentInput.indexNumber);
  let temporaryPassword: string | null = null;

  if (!student) {
    if (!hasPermission(admin, "create_student")) {
      return NextResponse.json(
        {
          error:
            "This student isn't registered yet, and you don't have permission to create student records.",
        },
        { status: 403 }
      );
    }

    temporaryPassword = generateTempPassword();
    const passwordHash = await hashPassword(temporaryPassword);

    const [created] = await createStudent({
      indexNumber: studentInput.indexNumber,
      firstName: studentInput.firstName,
      lastName: studentInput.lastName,
      passwordHash,
      createdByAdminId: admin.id,
    });
    student = created;

    await logAudit({
      actorId: admin.id,
      action: "student.create",
      targetType: "student",
      targetId: student.id,
      metadata: {
        indexNumber: student.indexNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        viaPermitIssuance: true,
      },
    });
  }

  const referenceNumber = generatePermitReference();
  const [permit] = await createPermit({
    studentId: student.id,
    permitType,
    referenceNumber,
    notes: notes || null,
    issuedBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "permit.issue",
    targetType: "permit",
    targetId: permit.id,
    metadata: {
      referenceNumber,
      permitType,
      studentIndexNumber: student.indexNumber,
    },
  });

  return NextResponse.json({
    student: {
      id: student.id,
      indexNumber: student.indexNumber,
      firstName: student.firstName,
      lastName: student.lastName,
    },
    permit: {
      id: permit.id,
      referenceNumber: permit.referenceNumber,
      permitType: permit.permitType,
      status: permit.status,
      issuedAt: permit.issuedAt,
    },
    temporaryPassword,
  });
}
