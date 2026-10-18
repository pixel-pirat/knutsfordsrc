import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { executiveSelfAchievementSchema } from "@/lib/validation";
import {
  getProfileByAdminUserId,
  listAchievementsForAdmin,
  createAchievement,
  logAudit,
} from "@/db/adminQueries";

export async function GET() {
  const { admin, error } = await requireAdmin();
  if (error) return error;

  const profile = await getProfileByAdminUserId(admin.id);
  if (!profile) {
    return NextResponse.json({ achievements: [] });
  }

  const achievements = await listAchievementsForAdmin({ profileId: profile.id });
  return NextResponse.json({ achievements });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return error;

  const profile = await getProfileByAdminUserId(admin.id);
  if (!profile) {
    return NextResponse.json(
      { error: "You don't have a linked executive profile" },
      { status: 404 }
    );
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

  const [achievement] = await createAchievement({
    yearGroupId: profile.yearGroupId,
    profileId: profile.id,
    title: parsed.data.title,
    description: parsed.data.description || null,
    achievedAt,
    imageUrl: parsed.data.imageUrl || null,
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "executive_achievement.self_create",
    targetType: "executive_achievement",
    targetId: achievement.id,
    metadata: { title: achievement.title },
  });

  return NextResponse.json({ achievement });
}
