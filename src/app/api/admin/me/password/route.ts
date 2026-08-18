import { NextResponse } from "next/server";
import { changePasswordSchema } from "@/lib/validation";
import { getCurrentAdmin, updateAdminPassword, logAudit } from "@/db/adminQueries";
import { verifyPassword, hashPassword } from "@/lib/crypto";
import { sendPasswordChangedEmail } from "@/lib/email";

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
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
  const valid = await verifyPassword(currentPassword, admin.passwordHash);
  if (!valid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }

  const passwordHash = await hashPassword(newPassword);
  await updateAdminPassword(admin.id, passwordHash);

  await logAudit({
    actorId: admin.id,
    action: "admin.change_password",
    targetType: "admin_user",
    targetId: admin.id,
  });

  const result = await sendPasswordChangedEmail({ to: admin.email, name: admin.name });

  return NextResponse.json({ success: true, emailSent: result.sent });
}
