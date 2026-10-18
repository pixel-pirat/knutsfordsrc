import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { executiveAchievementSchema } from "@/lib/validation";
import {
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  logAudit,
} from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { id } = await params;
  const achievement = await getAchievementById(id);
  if (!achievement) {
    return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
  }
  return NextResponse.json({ achievement });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = executiveAchievementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const achievedAt = parsed.data.achievedAt ? new Date(parsed.data.achievedAt) : null;
  if (parsed.data.achievedAt && Number.isNaN(achievedAt?.getTime())) {
    return NextResponse.json({ error: "Enter a valid achievement date" }, { status: 400 });
  }

  const [achievement] = await updateAchievement(id, {
    title: parsed.data.title,
    description: parsed.data.description || null,
    achievedAt,
    imageUrl: parsed.data.imageUrl || null,
    profileId: parsed.data.profileId || null,
  });

  if (!achievement) {
    return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "executive_achievement.update",
    targetType: "executive_achievement",
    targetId: achievement.id,
    metadata: { title: achievement.title },
  });

  return NextResponse.json({ achievement });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { id } = await params;
  const [deleted] = await deleteAchievement(id);
  if (!deleted) {
    return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "executive_achievement.delete",
    targetType: "executive_achievement",
    targetId: id,
    metadata: { title: deleted.title },
  });

  return NextResponse.json({ success: true });
}
