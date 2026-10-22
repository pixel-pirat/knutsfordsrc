import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { tournamentCreateSchema } from "@/lib/validation";
import { createTournament, listTournaments } from "@/db/sportsQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin("manage_sports");
  if (error) return error;

  const tournaments = await listTournaments();
  return NextResponse.json({ tournaments });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_sports");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = tournamentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [tournament] = await createTournament({
    name: parsed.data.name,
    sport: parsed.data.sport || null,
    description: parsed.data.description || null,
    format: parsed.data.format,
    eventId: parsed.data.eventId || null,
    numberOfGroups: parsed.data.numberOfGroups ?? null,
    qualifiersPerGroup: parsed.data.qualifiersPerGroup ?? null,
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "tournament.create",
    targetType: "sport_tournament",
    targetId: tournament.id,
    metadata: { name: tournament.name, format: tournament.format },
  });

  return NextResponse.json({ tournament });
}
