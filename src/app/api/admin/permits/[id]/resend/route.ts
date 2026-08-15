import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getPermitById, markPermitEmailSent, logAudit } from "@/db/adminQueries";
import { sendPermitEmail, isEmailConfigured } from "@/lib/email";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("issue_permit");
  if (error) return error;

  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: "Email sending isn't configured yet (missing RESEND_API_KEY)." },
      { status: 503 }
    );
  }

  const { id } = await params;
  const permit = await getPermitById(id);
  if (!permit) {
    return NextResponse.json({ error: "Permit not found" }, { status: 404 });
  }
  if (!permit.student.email) {
    return NextResponse.json(
      { error: "This student has no email address on file" },
      { status: 400 }
    );
  }

  const result = await sendPermitEmail({
    to: permit.student.email,
    studentName: `${permit.student.firstName} ${permit.student.lastName}`,
    referenceNumber: permit.referenceNumber,
    amount: permit.amount,
    issuedAt: permit.issuedAt,
    expiresAt: permit.expiresAt,
  });

  if (!result.sent) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }

  const [updated] = await markPermitEmailSent(id);

  await logAudit({
    actorId: admin.id,
    action: "permit.email_resent",
    targetType: "permit",
    targetId: id,
    metadata: { referenceNumber: permit.referenceNumber, to: permit.student.email },
  });

  return NextResponse.json({ emailSentAt: updated.emailSentAt });
}
