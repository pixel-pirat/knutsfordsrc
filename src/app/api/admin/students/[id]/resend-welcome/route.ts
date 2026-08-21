import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { hashPassword, generateTempPassword } from "@/lib/crypto";
import { getStudentById, updateStudentPassword } from "@/db/queries";
import { logAudit } from "@/db/adminQueries";
import { sendStudentWelcomeEmail, isEmailConfigured } from "@/lib/email";
import { getAppUrl } from "@/lib/url";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("create_student");
  if (error) return error;

  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  const temporaryPassword = generateTempPassword();
  const passwordHash = await hashPassword(temporaryPassword);
  await updateStudentPassword(student.id, passwordHash);

  await logAudit({
    actorId: admin.id,
    action: "student.resend_welcome",
    targetType: "student",
    targetId: student.id,
    metadata: { indexNumber: student.indexNumber },
  });

  let emailSent = false;
  if (isEmailConfigured() && student.email) {
    const result = await sendStudentWelcomeEmail({
      to: student.email,
      name: `${student.firstName} ${student.lastName}`,
      indexNumber: student.indexNumber,
      temporaryPassword,
      program: student.program,
      level: student.level,
      loginUrl: `${getAppUrl()}/login`,
    });
    emailSent = result.sent;
  }

  return NextResponse.json({ temporaryPassword, emailSent });
}
