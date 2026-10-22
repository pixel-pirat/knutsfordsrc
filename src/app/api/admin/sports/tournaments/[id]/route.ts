import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { tournamentUpdateSchema } from "@/lib/validation";
import {
  deleteTournament,
  getTournamentById,
  listMatchesForTournament,
  listTournamentParticipants,
  updateTournament,
} from "@/db/sportsQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("manage_sports");
  if (error) return error;

  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  const [participants, matches] = await Promise.all([
    listTournamentParticipants(id),
    listMatchesForTournament(id),
  ]);

  return NextResponse.json({ tournament, participants, matches });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_sports");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = tournamentUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [tournament] = await updateTournament(id, {
    ...(parsed.data.name !== undefined ? { name: parsed.data.name } : {}),
    ...(parsed.data.sport !== undefined ? { sport: parsed.data.sport || null } : {}),
    ...(parsed.data.description !== undefined
      ? { description: parsed.data.description || null }
      : {}),
    ...(parsed.data.format !== undefined ? { format: parsed.data.format } : {}),
    ...(parsed.data.status !== undefined ? { status: parsed.data.status } : {}),
    ...(parsed.data.eventId !== undefined
      ? { eventId: parsed.data.eventId || null }
      : {}),
    ...(parsed.data.numberOfGroups !== undefined
      ? { numberOfGroups: parsed.data.numberOfGroups }
      : {}),
    ...(parsed.data.qualifiersPerGroup !== undefined
      ? { qualifiersPerGroup: parsed.data.qualifiersPerGroup }
      : {}),
  });

  if (!tournament) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "tournament.update",
    targetType: "sport_tournament",
    targetId: tournament.id,
    metadata: { name: tournament.name },
  });

  return NextResponse.json({ tournament });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_sports");
  if (error) return error;

  const { id } = await params;
  const [deleted] = await deleteTournament(id);
  if (!deleted) {
    return NextResponse.json({ error: "Tournament not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "tournament.delete",
    targetType: "sport_tournament",
    targetId: id,
    metadata: { name: deleted.name },
  });

  return NextResponse.json({ success: true });
}
