import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { sportAnnouncementSchema } from "@/lib/validation";
import {
  createSportAnnouncement,
  getSportEventById,
  listAnnouncementRecipients,
  listSportAnnouncementsForAdmin,
} from "@/db/sportsQueries";
import { logAudit } from "@/db/adminQueries";
import { sendBroadcastEmail } from "@/lib/email";

export async function GET() {
  const { error } = await requireAdmin("manage_sports");
  if (error) return error;

  const announcements = await listSportAnnouncementsForAdmin();
  return NextResponse.json({ announcements });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_sports");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = sportAnnouncementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const eventId = parsed.data.eventId || null;
  if (eventId) {
    const event = await getSportEventById(eventId);
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }
  }

  const recipients = await listAnnouncementRecipients(eventId);
  const result = await sendBroadcastEmail({
    toList: recipients.map((r) => ({
      email: r.email ?? "",
      name: `${r.firstName} ${r.lastName}`,
    })),
    subject: `[Knutsford Sports] ${parsed.data.title}`,
    heading: parsed.data.title,
    body: parsed.data.body,
  });

  const [announcement] = await createSportAnnouncement({
    title: parsed.data.title,
    body: parsed.data.body,
    eventId,
    recipientCount: result.sent,
    failedCount: result.failed,
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "sport_announcement.send",
    targetType: "sport_announcement",
    targetId: announcement.id,
    metadata: {
      title: announcement.title,
      sent: result.sent,
      failed: result.failed,
    },
  });

  return NextResponse.json({
    announcement,
    sent: result.sent,
    failed: result.failed,
    noEmailConfigured: Boolean(result.error) && result.sent === 0,
  });
}
