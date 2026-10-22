import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { hallEventSchema } from "@/lib/validation";
import {
  createHallEvent,
  listHallEventsForAdmin,
} from "@/db/hallQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin("manage_hall_events");
  if (error) return error;

  const events = await listHallEventsForAdmin();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_hall_events");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = hallEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const startsAt = new Date(parsed.data.startsAt);
  if (Number.isNaN(startsAt.getTime())) {
    return NextResponse.json({ error: "Enter a valid start date & time" }, { status: 400 });
  }
  let endsAt: Date | null = null;
  if (parsed.data.endsAt) {
    endsAt = new Date(parsed.data.endsAt);
    if (Number.isNaN(endsAt.getTime())) {
      return NextResponse.json({ error: "Enter a valid end date & time" }, { status: 400 });
    }
  }

  const [event] = await createHallEvent({
    hallId: parsed.data.hallId || null,
    title: parsed.data.title,
    description: parsed.data.description || null,
    location: parsed.data.location || null,
    startsAt,
    endsAt,
    capacity: parsed.data.capacity ?? null,
    bookingRequired: parsed.data.bookingRequired ?? true,
    imageUrl: parsed.data.imageUrl || null,
    published: parsed.data.published ?? true,
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "hall_event.create",
    targetType: "hall_event",
    targetId: event.id,
    metadata: { title: event.title },
  });

  return NextResponse.json({ event });
}
