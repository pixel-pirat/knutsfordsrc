import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import {
  advanceGroupStage,
  getTournamentById,
  listMatchesForTournament,
} from "@/db/sportsQueries";
import { logAudit } from "@/db/adminQueries";

/** Build the knockout bracket from final group standings (group_knockout). */
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

  try {
    await advanceGroupStage(id);
    const matches = await listMatchesForTournament(id);

    await logAudit({
      actorId: admin.id,
      action: "tournament.advance_groups",
      targetType: "sport_tournament",
      targetId: id,
      metadata: { name: tournament.name },
    });

    return NextResponse.json({ matches });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
