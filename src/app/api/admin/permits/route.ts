import { NextResponse } from "next/server";
import { permitIssueSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminGuard";
import { getStudentById } from "@/db/queries";
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

  const { studentId, amount, expiresAt, notes } = parsed.data;

  const student = await getStudentById(studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const expiresAtDate = new Date(expiresAt);
  if (Number.isNaN(expiresAtDate.getTime())) {
    return NextResponse.json({ error: "Invalid expiry date" }, { status: 400 });
  }

  const referenceNumber = generatePermitReference();
  const [permit] = await createPermit({
    studentId: student.id,
    permitType: "Permit",
    referenceNumber,
    amount: amount.toFixed(2),
    notes: notes || null,
    issuedBy: admin.id,
    expiresAt: expiresAtDate,
  });

  await logAudit({
    actorId: admin.id,
    action: "permit.issue",
    targetType: "permit",
    targetId: permit.id,
    metadata: {
      referenceNumber,
      amount: amount.toFixed(2),
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
      amount: permit.amount,
      expiresAt: permit.expiresAt,
      issuedAt: permit.issuedAt,
    },
  });
}
