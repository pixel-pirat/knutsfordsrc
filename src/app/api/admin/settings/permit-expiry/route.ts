import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/adminGuard";
import { permitExpiryDateSchema } from "@/lib/validation";
import {
  getPermitExpiryDate,
  setSetting,
  bulkApplyPermitExpiry,
  logAudit,
  PERMIT_EXPIRY_DATE_KEY,
} from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const date = await getPermitExpiryDate();
  return NextResponse.json({ date: date ? date.toISOString().slice(0, 10) : null });
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
  const parsed = permitExpiryDateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const expiryDate = new Date(`${parsed.data.date}T23:59:59.000Z`);

  await setSetting(PERMIT_EXPIRY_DATE_KEY, parsed.data.date);
  const updated = await bulkApplyPermitExpiry(expiryDate);

  await logAudit({
    actorId: admin.id,
    action: "settings.update_permit_expiry",
    targetType: "settings",
    metadata: { date: parsed.data.date, permitsUpdated: updated.length },
  });

  return NextResponse.json({ date: parsed.data.date, updatedCount: updated.length });
}
