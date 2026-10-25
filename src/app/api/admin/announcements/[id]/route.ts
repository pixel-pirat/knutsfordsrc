import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { announcementSchema } from "@/lib/validation";
import {
  deleteAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
} from "@/db/announcementQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("manage_news");
  if (error) return error;

  const { id } = await params;
  const announcement = await getAnnouncementById(id);
  if (!announcement) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  return NextResponse.json({ announcement });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_news");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = announcementSchema.partial().safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [updated] = await updateAnnouncement(id, {
    ...(parsed.data.text !== undefined ? { text: parsed.data.text } : {}),
    ...(parsed.data.linkUrl !== undefined
      ? { linkUrl: parsed.data.linkUrl || null }
      : {}),
    ...(parsed.data.active !== undefined ? { active: parsed.data.active } : {}),
  });

  if (!updated) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "announcement.update",
    targetType: "announcement",
    targetId: updated.id,
    metadata: { text: updated.text, active: updated.active },
  });

  return NextResponse.json({ announcement: updated });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_news");
  if (error) return error;

  const { id } = await params;
  const [deleted] = await deleteAnnouncement(id);
  if (!deleted) {
    return NextResponse.json({ error: "Announcement not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "announcement.delete",
    targetType: "announcement",
    targetId: id,
    metadata: { text: deleted.text },
  });

  return NextResponse.json({ success: true });
}
