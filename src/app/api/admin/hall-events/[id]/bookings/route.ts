import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { bookingStatusSchema } from "@/lib/validation";
import {
  getHallEventById,
  listBookingsForEvent,
  updateBookingStatus,
} from "@/db/hallQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("manage_hall_events");
  if (error) return error;

  const { id } = await params;
  const event = await getHallEventById(id);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const bookings = await listBookingsForEvent(id);
  return NextResponse.json({ event, bookings });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_hall_events");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bookingStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [booking] = await updateBookingStatus(
    parsed.data.bookingId,
    parsed.data.status
  );
  if (!booking || booking.eventId !== id) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "hall_event.booking_status",
    targetType: "hall_event",
    targetId: id,
    metadata: { bookingId: booking.id, status: booking.status },
  });

  return NextResponse.json({ booking });
}
