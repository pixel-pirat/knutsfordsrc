import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { executiveProfileSchema } from "@/lib/validation";
import { listProfilesForAdmin, createProfile, logAudit } from "@/db/adminQueries";

export async function GET(request: Request) {
  const { error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const yearGroupId = searchParams.get("yearGroupId") || undefined;

  const profiles = await listProfilesForAdmin(yearGroupId);
  return NextResponse.json({ profiles });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_executives");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = executiveProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [profile] = await createProfile({
    yearGroupId: parsed.data.yearGroupId,
    name: parsed.data.name,
    position: parsed.data.position,
    bio: parsed.data.bio || null,
    avatarUrl: parsed.data.avatarUrl || null,
    socialLinks: parsed.data.socialLinks || null,
    adminUserId: parsed.data.adminUserId || null,
    displayOrder: parsed.data.displayOrder ?? 0,
  });

  await logAudit({
    actorId: admin.id,
    action: "executive_profile.create",
    targetType: "executive_profile",
    targetId: profile.id,
    metadata: { name: profile.name, position: profile.position },
  });

  return NextResponse.json({ profile });
}
