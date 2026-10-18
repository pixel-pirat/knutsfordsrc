import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { executiveSelfProfileSchema } from "@/lib/validation";
import { getProfileByAdminUserId, updateProfile, logAudit } from "@/db/adminQueries";

export async function GET() {
  const { admin, error } = await requireAdmin();
  if (error) return error;

  const profile = await getProfileByAdminUserId(admin.id);
  return NextResponse.json({ profile: profile ?? null });
}

export async function PATCH(request: Request) {
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
  const parsed = executiveSelfProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [updated] = await updateProfile(profile.id, {
    bio: parsed.data.bio || null,
    avatarUrl: parsed.data.avatarUrl || null,
    socialLinks: parsed.data.socialLinks || null,
  });

  await logAudit({
    actorId: admin.id,
    action: "executive_profile.self_update",
    targetType: "executive_profile",
    targetId: updated.id,
    metadata: {},
  });

  return NextResponse.json({ profile: updated });
}
