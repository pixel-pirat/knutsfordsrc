import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import {
  announcementReorderSchema,
  announcementSchema,
} from "@/lib/validation";
import {
  createAnnouncement,
  getNextAnnouncementSortOrder,
  listAnnouncementsForAdmin,
  reorderAnnouncements,
} from "@/db/announcementQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin("manage_news");
  if (error) return error;

  const rows = await listAnnouncementsForAdmin();
  return NextResponse.json({ announcements: rows });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_news");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = announcementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const sortOrder = await getNextAnnouncementSortOrder();
  const [announcement] = await createAnnouncement({
    text: parsed.data.text,
    linkUrl: parsed.data.linkUrl || null,
    active: parsed.data.active ?? true,
    sortOrder,
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "announcement.create",
    targetType: "announcement",
    targetId: announcement.id,
    metadata: { text: announcement.text },
  });

  return NextResponse.json({ announcement });
}

/** Replace the ticker order; ids are supplied in display order. */
export async function PUT(request: Request) {
  const { admin, error } = await requireAdmin("manage_news");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = announcementReorderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await reorderAnnouncements(parsed.data.ids);

  await logAudit({
    actorId: admin.id,
    action: "announcement.reorder",
    targetType: "announcement",
    metadata: { count: parsed.data.ids.length },
  });

  return NextResponse.json({ success: true });
}
