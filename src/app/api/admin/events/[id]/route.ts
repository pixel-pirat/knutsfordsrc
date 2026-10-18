import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { eventSchema } from "@/lib/validation";
import { getEventById, updateEvent, deleteEvent, logAudit } from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("manage_events");
  if (error) return error;

  const { id } = await params;
  const event = await getEventById(id);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }
  return NextResponse.json({ event });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_events");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);
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

  const [event] = await updateEvent(id, {
    title: parsed.data.title,
    description: parsed.data.description || null,
    location: parsed.data.location || null,
    startsAt,
    endsAt,
    imageUrl: parsed.data.imageUrl || null,
    published: parsed.data.published ?? true,
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "event.update",
    targetType: "event",
    targetId: event.id,
    metadata: { title: event.title },
  });

  return NextResponse.json({ event });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_events");
  if (error) return error;

  const { id } = await params;
  const [deleted] = await deleteEvent(id);
  if (!deleted) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "event.delete",
    targetType: "event",
    targetId: id,
    metadata: { title: deleted.title },
  });

  return NextResponse.json({ success: true });
}
