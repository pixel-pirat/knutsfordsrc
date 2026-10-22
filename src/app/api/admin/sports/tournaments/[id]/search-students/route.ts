import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import {
  listConfirmedParticipantsForEvent,
  searchStudentsForTournament,
} from "@/db/sportsQueries";

/**
 * GET ?q=&eventId=
 * - with eventId: confirmed participants of that sport event (picker source)
 * - with q: student search excluding those already in the tournament
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("manage_sports");
  if (error) return error;

  const { id: tournamentId } = await params;
  const url = new URL(request.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const eventId = url.searchParams.get("eventId")?.trim() ?? "";

  if (eventId) {
    const confirmed = await listConfirmedParticipantsForEvent(eventId);
    return NextResponse.json({ students: confirmed });
  }

  if (!q) {
    return NextResponse.json({ students: [] });
  }

  const students = await searchStudentsForTournament(tournamentId, q);
  return NextResponse.json({ students });
}
