import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { yearGroupSchema } from "@/lib/validation";
import { listYearGroupsForAdmin, createYearGroup, logAudit } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin("manage_executives");
  if (error) return error;

  const yearGroups = await listYearGroupsForAdmin();
  return NextResponse.json({ yearGroups });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_executives");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = yearGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [yearGroup] = await createYearGroup({
    label: parsed.data.label,
    description: parsed.data.description || null,
    active: parsed.data.active ?? true,
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "executive_year_group.create",
    targetType: "executive_year_group",
    targetId: yearGroup.id,
    metadata: { label: yearGroup.label },
  });

  return NextResponse.json({ yearGroup });
}
