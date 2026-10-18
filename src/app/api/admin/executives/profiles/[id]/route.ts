import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { executiveProfileSchema } from "@/lib/validation";
import { getProfileById, updateProfile, deleteProfile, logAudit } from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { id } = await params;
  const profile = await getProfileById(id);
  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }
  return NextResponse.json({ profile });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = executiveProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [profile] = await updateProfile(id, {
    yearGroupId: parsed.data.yearGroupId,
    name: parsed.data.name,
    position: parsed.data.position,
    bio: parsed.data.bio || null,
    avatarUrl: parsed.data.avatarUrl || null,
    socialLinks: parsed.data.socialLinks || null,
    adminUserId: parsed.data.adminUserId || null,
    displayOrder: parsed.data.displayOrder ?? 0,
  });

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "executive_profile.update",
    targetType: "executive_profile",
    targetId: profile.id,
    metadata: { name: profile.name, position: profile.position },
  });

  return NextResponse.json({ profile });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_executives");
  if (error) return error;

  const { id } = await params;
  const [deleted] = await deleteProfile(id);
  if (!deleted) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "executive_profile.delete",
    targetType: "executive_profile",
    targetId: id,
    metadata: { name: deleted.name },
  });

  return NextResponse.json({ success: true });
}
