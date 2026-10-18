import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/adminGuard";
import { semesterConfigSchema } from "@/lib/validation";
import { getJsonSetting, setJsonSetting, logAudit, SEMESTER_CONFIG_KEY } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const semester = await getJsonSetting(SEMESTER_CONFIG_KEY);
  return NextResponse.json({ semester });
}

export async function PATCH(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (!requireSuperAdmin(admin)) {
    return NextResponse.json(
      { error: "Only super admins can change the semester config" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = semesterConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await setJsonSetting(SEMESTER_CONFIG_KEY, parsed.data);

  await logAudit({
    actorId: admin.id,
    action: "settings.update_semester",
    targetType: "settings",
    metadata: parsed.data,
  });

  return NextResponse.json({ semester: parsed.data });
}
