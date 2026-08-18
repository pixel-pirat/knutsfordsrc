import { NextResponse } from "next/server";
import { changePasswordSchema } from "@/lib/validation";
import { getCurrentStudent, updateStudentPassword } from "@/db/queries";
import { verifyPassword, hashPassword } from "@/lib/crypto";
import { sendPasswordChangedEmail } from "@/lib/email";

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;
  const valid = await verifyPassword(currentPassword, student.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const passwordHash = await hashPassword(newPassword);
  await updateStudentPassword(student.id, passwordHash);

  let emailSent = false;
  if (student.email) {
    const result = await sendPasswordChangedEmail({
      to: student.email,
      name: student.firstName,
    });
    emailSent = result.sent;
  }

  return NextResponse.json({ success: true, emailSent });
}
