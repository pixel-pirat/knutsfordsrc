import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/adminGuard";
import { contactInfoSchema } from "@/lib/validation";
import { getJsonSetting, setJsonSetting, logAudit, CONTACT_INFO_KEY } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const contactInfo = await getJsonSetting(CONTACT_INFO_KEY);
  return NextResponse.json({ contactInfo });
}

export async function PATCH(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (!requireSuperAdmin(admin)) {
    return NextResponse.json(
      { error: "Only super admins can change contact info" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = contactInfoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await setJsonSetting(CONTACT_INFO_KEY, parsed.data);

  await logAudit({
    actorId: admin.id,
    action: "settings.update_contact_info",
    targetType: "settings",
    metadata: {},
  });

  return NextResponse.json({ contactInfo: parsed.data });
}
