import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { executiveSelfAchievementSchema } from "@/lib/validation";
import {
  getProfileByAdminUserId,
  getAchievementById,
  updateAchievement,
  deleteAchievement,
  logAudit,
} from "@/db/adminQueries";

async function requireOwnAchievement(adminId: string, achievementId: string) {
  const profile = await getProfileByAdminUserId(adminId);
  if (!profile) return null;
  const achievement = await getAchievementById(achievementId);
  if (!achievement || achievement.profileId !== profile.id) return null;
  return achievement;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = await requireOwnAchievement(admin.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = executiveSelfAchievementSchema.safeParse(body);
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
  });

  await logAudit({
    actorId: admin.id,
    action: "executive_achievement.self_update",
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
  const { admin, error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const existing = await requireOwnAchievement(admin.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Achievement not found" }, { status: 404 });
  }

  await deleteAchievement(id);

  await logAudit({
    actorId: admin.id,
    action: "executive_achievement.self_delete",
    targetType: "executive_achievement",
    targetId: id,
    metadata: { title: existing.title },
  });

  return NextResponse.json({ success: true });
}
