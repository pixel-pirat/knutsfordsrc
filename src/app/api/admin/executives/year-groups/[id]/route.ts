import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { yearGroupSchema } from "@/lib/validation";
import {
  getYearGroupById,
  updateYearGroup,
  deleteYearGroup,
  logAudit,
} from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { id } = await params;
  const yearGroup = await getYearGroupById(id);
  if (!yearGroup) {
    return NextResponse.json({ error: "Year group not found" }, { status: 404 });
  }
  return NextResponse.json({ yearGroup });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = yearGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [yearGroup] = await updateYearGroup(id, {
    label: parsed.data.label,
    description: parsed.data.description || null,
    active: parsed.data.active ?? true,
  });

  if (!yearGroup) {
    return NextResponse.json({ error: "Year group not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "executive_year_group.update",
    targetType: "executive_year_group",
    targetId: yearGroup.id,
    metadata: { label: yearGroup.label },
  });

  return NextResponse.json({ yearGroup });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { id } = await params;
  const [deleted] = await deleteYearGroup(id);
  if (!deleted) {
    return NextResponse.json({ error: "Year group not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "executive_year_group.delete",
    targetType: "executive_year_group",
    targetId: id,
    metadata: { label: deleted.label },
  });

  return NextResponse.json({ success: true });
}
