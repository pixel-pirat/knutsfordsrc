import { NextResponse } from "next/server";
import { permitIssueSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminGuard";
import { getStudentById } from "@/db/queries";
import {
  createPermit,
  generatePermitReference,
  markPermitEmailSent,
  logAudit,
  getPermitExpiryDays,
} from "@/db/adminQueries";
import { sendPermitEmail, isEmailConfigured } from "@/lib/email";

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

  const { studentId, amount, paymentMethod } = parsed.data;

  const student = await getStudentById(studentId);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const expiryDays = await getPermitExpiryDays();
  const expiresAtDate = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

  const referenceNumber = generatePermitReference();
  const [permit] = await createPermit({
    studentId: student.id,
    permitType: "Permit",
    referenceNumber,
    amount: amount.toFixed(2),
    paymentMethod: paymentMethod || null,
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

  let emailSent = false;
  if (isEmailConfigured() && student.email) {
    const result = await sendPermitEmail({
      to: student.email,
      studentName: `${student.firstName} ${student.lastName}`,
      referenceNumber,
      amount: permit.amount,
      issuedAt: permit.issuedAt,
      expiresAt: permit.expiresAt,
    });
    if (result.sent) {
      await markPermitEmailSent(permit.id);
      emailSent = true;
    }
  }

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
      cardStatus: permit.cardStatus,
    },
    emailSent,
  });
}
