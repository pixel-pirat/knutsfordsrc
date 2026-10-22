import { getCurrentAdmin } from "@/db/adminQueries";
import {
  getTournamentById,
  listMatchesForTournament,
  listTournamentParticipants,
  listTournamentStandings,
} from "@/db/sportsQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { TournamentDetailClient } from "./TournamentDetailClient";

export default async function AdminTournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_sports")) {
    return <AccessRestricted />;
  }

  const { id } = await params;
  const tournament = await getTournamentById(id);
  if (!tournament) {
    return (
      <div className="rounded-2xl bg-white dark:bg-neutral-900 p-10 text-center ring-1 ring-black/5 dark:ring-white/10">
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          Tournament not found.
        </p>
      </div>
    );
  }

  const [participants, matches, standings] = await Promise.all([
    listTournamentParticipants(id),
    listMatchesForTournament(id),
    listTournamentStandings(id),
  ]);

  return (
    <TournamentDetailClient
      tournament={{
        id: tournament.id,
        name: tournament.name,
        sport: tournament.sport,
        description: tournament.description,
        format: tournament.format,
        status: tournament.status,
        eventId: tournament.eventId,
        numberOfGroups: tournament.numberOfGroups,
        qualifiersPerGroup: tournament.qualifiersPerGroup,
        bracketRounds: tournament.bracketRounds,
        championName: tournament.championName,
      }}
      participants={participants.map((p) => ({
        id: p.id,
        seed: p.seed,
        groupLabel: p.groupLabel,
        name: `${p.firstName} ${p.lastName}`,
        indexNumber: p.indexNumber,
      }))}
      matches={matches.map((m) => ({
        id: m.id,
        stage: m.stage,
        groupLabel: m.groupLabel,
        round: m.round,
        matchIndex: m.matchIndex,
        participantAId: m.participantAId,
        participantBId: m.participantBId,
        scoreA: m.scoreA,
        scoreB: m.scoreB,
        winnerId: m.winnerId,
        status: m.status,
        scheduledAt: m.scheduledAt ? m.scheduledAt.toISOString() : null,
        venue: m.venue,
      }))}
      standings={standings.map((s) => ({
        participantId: s.participantId,
        name: s.name,
        groupLabel: s.groupLabel,
        played: s.played,
        won: s.won,
        drawn: s.drawn,
        lost: s.lost,
        scored: s.scored,
        conceded: s.conceded,
        points: s.points,
      }))}
      namesById={Object.fromEntries([
        ...participants.map((p) => [p.id, `${p.firstName} ${p.lastName}`]),
      ])}
    />
  );
}
