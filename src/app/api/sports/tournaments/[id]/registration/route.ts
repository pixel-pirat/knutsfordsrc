import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/db/queries";
import {
  addTournamentParticipants,
  getTournamentById,
  getTournamentParticipantForStudent,
  removeTournamentParticipantForStudent,
} from "@/db/sportsQueries";

/** Register interest in a tournament (self-service, only while registration is open). */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }
  if (tournament.status !== "draft") {
    return NextResponse.json(
      { error: "Registration is closed for this tournament" },
      { status: 409 }
    );
  }

  const existing = await getTournamentParticipantForStudent(id, student.id);
  if (existing) {
    return NextResponse.json(
      { error: "You are already registered for this tournament" },
      { status: 409 }
    );
  }

  const [participant] = await addTournamentParticipants(id, [student.id]);
  return NextResponse.json({ participant });
}

/** Withdraw from a tournament (self-service, only while registration is open). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }
  if (tournament.status !== "draft") {
    return NextResponse.json(
      {
        error:
          "Registration is closed — contact the SRC sports office to withdraw",
      },
      { status: 409 }
    );
  }

  const [removed] = await removeTournamentParticipantForStudent(id, student.id);
  return NextResponse.json({ participant: removed ?? null });
}
