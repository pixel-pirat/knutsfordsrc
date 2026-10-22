import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentStudent } from "@/db/queries";
import {
  cancelStudentRegistration,
  getStudentParticipation,
  registerStudentForEvent,
} from "@/db/sportsQueries";

const bodySchema = z.object({ eventId: z.uuid() });

/** Register interest for a sports event (self-service). */
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

  const [participation] = await registerStudentForEvent(
    parsed.data.eventId,
    student.id
  );

  return NextResponse.json({ participation });
}

/** Withdraw registration. */
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

  const existing = await getStudentParticipation(parsed.data.eventId, student.id);
  if (existing && existing.status === "confirmed") {
    return NextResponse.json(
      { error: "Your participation was already confirmed — contact the SRC office" },
      { status: 409 }
    );
  }

  const [removed] = await cancelStudentRegistration(
    parsed.data.eventId,
    student.id
  );

  return NextResponse.json({ participation: removed ?? null });
}
