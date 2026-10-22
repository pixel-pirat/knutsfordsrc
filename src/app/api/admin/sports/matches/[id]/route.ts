import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { matchResultSchema } from "@/lib/validation";
import { reportMatchResult } from "@/db/sportsQueries";
import { logAudit } from "@/db/adminQueries";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_sports");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = matchResultSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const match = await reportMatchResult(id, parsed.data);
    await logAudit({
      actorId: admin.id,
      action: "sport_match.update",
      targetType: "sport_tournament",
      targetId: match.tournamentId,
      metadata: {
        matchId: match.id,
        status: match.status,
        scoreA: match.scoreA,
        scoreB: match.scoreB,
      },
    });
    return NextResponse.json({ match });
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    throw err;
  }
}
