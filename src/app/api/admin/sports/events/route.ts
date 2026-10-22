import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { sportEventSchema } from "@/lib/validation";
import {
  createSportEvent,
  listSportEventsForAdmin,
} from "@/db/sportsQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin("manage_sports");
  if (error) return error;

  const events = await listSportEventsForAdmin();
  return NextResponse.json({ events });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_sports");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = sportEventSchema.safeParse(body);
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

  const [event] = await createSportEvent({
    title: parsed.data.title,
    sport: parsed.data.sport,
    description: parsed.data.description || null,
    venue: parsed.data.venue || null,
    startsAt,
    endsAt,
    imageUrl: parsed.data.imageUrl || null,
    published: parsed.data.published ?? true,
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "sport_event.create",
    targetType: "sport_event",
    targetId: event.id,
    metadata: { title: event.title },
  });

  return NextResponse.json({ event });
}
