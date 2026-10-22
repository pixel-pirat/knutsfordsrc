import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { hallMessageSchema } from "@/lib/validation";
import {
  createHallMessage,
  getHallById,
  listBroadcastRecipients,
  listHallMessagesForAdmin,
} from "@/db/hallQueries";
import { logAudit } from "@/db/adminQueries";
import { sendBroadcastEmail } from "@/lib/email";

export async function GET() {
  const { error } = await requireAdmin("manage_hall_comms");
  if (error) return error;

  const messages = await listHallMessagesForAdmin();
  return NextResponse.json({ messages });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_hall_comms");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = hallMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const hallId = parsed.data.hallId || null;
  if (hallId) {
    const hall = await getHallById(hallId);
    if (!hall) {
      return NextResponse.json({ error: "Hall not found" }, { status: 404 });
    }
  }

  const recipients = await listBroadcastRecipients(hallId);
  const hall = hallId ? await getHallById(hallId) : null;
  const audience = hall ? hall.name : "All Halls";

  const result = await sendBroadcastEmail({
    toList: recipients.map((r) => ({
      email: r.email ?? "",
      name: `${r.firstName} ${r.lastName}`,
    })),
    subject: `[${audience}] ${parsed.data.subject}`,
    heading: parsed.data.subject,
    body: parsed.data.body,
  });

  const [message] = await createHallMessage({
    hallId,
    subject: parsed.data.subject,
    body: parsed.data.body,
    recipientCount: result.sent,
    failedCount: result.failed,
    sentBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "hall_message.send",
    targetType: "hall_message",
    targetId: message.id,
    metadata: {
      subject: message.subject,
      audience,
      sent: result.sent,
      failed: result.failed,
    },
  });

  return NextResponse.json({
    message,
    sent: result.sent,
    failed: result.failed,
    noEmailConfigured: Boolean(result.error) && result.sent === 0,
  });
}
