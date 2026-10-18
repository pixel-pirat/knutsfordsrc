import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { executiveAchievementSchema } from "@/lib/validation";
import { listAchievementsForAdmin, createAchievement, logAudit } from "@/db/adminQueries";

export async function GET(request: Request) {
  const { error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const yearGroupId = searchParams.get("yearGroupId") || undefined;
  const profileId = searchParams.get("profileId") || undefined;

  const achievements = await listAchievementsForAdmin({ yearGroupId, profileId });
  return NextResponse.json({ achievements });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_executives");
  if (error) return error;

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

  const [achievement] = await createAchievement({
    yearGroupId: parsed.data.yearGroupId,
    profileId: parsed.data.profileId || null,
    title: parsed.data.title,
    description: parsed.data.description || null,
    achievedAt,
    imageUrl: parsed.data.imageUrl || null,
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "executive_achievement.create",
    targetType: "executive_achievement",
    targetId: achievement.id,
    metadata: { title: achievement.title },
  });

  return NextResponse.json({ achievement });
}
