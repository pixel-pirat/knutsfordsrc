import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminGuard";
import { tournamentParticipantsSchema } from "@/lib/validation";
import {
  addTournamentParticipants,
  getTournamentById,
  listTournamentParticipants,
  removeTournamentParticipant,
} from "@/db/sportsQueries";
import { logAudit } from "@/db/adminQueries";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_sports");
  if (error) return error;

  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = tournamentParticipantsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await addTournamentParticipants(id, parsed.data.studentIds);
  const participants = await listTournamentParticipants(id);

  await logAudit({
    actorId: admin.id,
    action: "tournament.participants_add",
    targetType: "sport_tournament",
    targetId: id,
    metadata: { count: parsed.data.studentIds.length },
  });

  return NextResponse.json({ participants });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_sports");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = z
    .object({ participantId: z.uuid("Invalid participant") })
    .safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [removed] = await removeTournamentParticipant(parsed.data.participantId);
  if (!removed || removed.tournamentId !== id) {
    return NextResponse.json(
      { error: "Participant not found" },
      { status: 404 }
    );
  }

  await logAudit({
    actorId: admin.id,
    action: "tournament.participants_remove",
    targetType: "sport_tournament",
    targetId: id,
    metadata: { participantId: parsed.data.participantId },
  });

  const participants = await listTournamentParticipants(id);
  return NextResponse.json({ participants });
}
