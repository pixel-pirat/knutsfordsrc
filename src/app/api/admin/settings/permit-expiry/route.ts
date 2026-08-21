import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/adminGuard";
import { permitExpiryDaysSchema } from "@/lib/validation";
import { getPermitExpiryDays, setSetting, logAudit, PERMIT_EXPIRY_DAYS_KEY } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const days = await getPermitExpiryDays();
  return NextResponse.json({ days });
}

export async function PATCH(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (!requireSuperAdmin(admin)) {
    return NextResponse.json(
      { error: "Only super admins can change the permit expiry policy" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = permitExpiryDaysSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await setSetting(PERMIT_EXPIRY_DAYS_KEY, String(parsed.data.days));

  await logAudit({
    actorId: admin.id,
    action: "settings.update_permit_expiry",
    targetType: "settings",
    metadata: { days: parsed.data.days },
  });

  return NextResponse.json({ days: parsed.data.days });
}
