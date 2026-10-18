import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/adminGuard";
import { permitConfigSchema } from "@/lib/validation";
import { getJsonSetting, setJsonSetting, logAudit, PERMIT_CONFIG_KEY } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const permitConfig = await getJsonSetting(PERMIT_CONFIG_KEY);
  return NextResponse.json({ permitConfig });
}

export async function PATCH(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (!requireSuperAdmin(admin)) {
    return NextResponse.json(
      { error: "Only super admins can change the permit config" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = permitConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await setJsonSetting(PERMIT_CONFIG_KEY, parsed.data);

  await logAudit({
    actorId: admin.id,
    action: "settings.update_permit_config",
    targetType: "settings",
    metadata: parsed.data,
  });

  return NextResponse.json({ permitConfig: parsed.data });
}
