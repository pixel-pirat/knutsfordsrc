import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudent } from "@/db/queries";
import {
  cancelBooking,
  createBooking,
  getBookingCount,
  getStudentBooking,
} from "@/db/hallQueries";

const bodySchema = z.object({ eventId: z.uuid() });

/** Book a seat for a hall event (self-service). */
export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const existing = await getStudentBooking(parsed.data.eventId, student.id);
  if (existing && existing.status !== "cancelled") {
    return NextResponse.json(
      { error: "You already have a booking for this event" },
      { status: 409 }
    );
  }

  const [booking] = await createBooking(parsed.data.eventId, student.id);

  // capacity is advisory — count and warn, don't block
  const count = await getBookingCount(parsed.data.eventId);

  return NextResponse.json({ booking, bookingCount: count, atCapacityWarning: false });
}

/** Cancel a booking. */
export async function DELETE(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const [booking] = await cancelBooking(parsed.data.eventId, student.id);
  const count = await getBookingCount(parsed.data.eventId);

  return NextResponse.json({ booking, bookingCount: count });
}
