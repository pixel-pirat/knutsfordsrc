import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentStudent } from "@/db/queries";
import {
  getTournamentById,
  listMatchesForTournament,
  listTournamentParticipants,
  listTournamentStandings,
} from "@/db/sportsQueries";
import { TournamentResults } from "@/components/sports/TournamentResults";
import { TournamentRegisterButton } from "./TournamentRegisterButton";

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: "Knockout",
  round_robin: "League",
  group_knockout: "Groups + knockout",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Registration open",
  active: "In progress",
  completed: "Completed",
};

export default async function StudentTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await getCurrentStudent();

  const tournament = await getTournamentById(id);
  if (!tournament) notFound();

  const [participants, matches, standings] = await Promise.all([
    listTournamentParticipants(id).catch(() => []),
    listMatchesForTournament(id).catch(() => []),
    listTournamentStandings(id).catch(() => []),
  ]);

  const isRegistered = Boolean(
    student && participants.some((p) => p.studentId === student.id)
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/dashboard/sports"
            className="text-sm font-medium text-gold-dark dark:text-gold-light hover:underline"
          >
            ← Sports
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {tournament.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {FORMAT_LABELS[tournament.format] ?? tournament.format} ·{" "}
            {STATUS_LABELS[tournament.status] ?? tournament.status} ·{" "}
            {participants.length} participants
            {tournament.championName ? ` · 🏆 Champion: ${tournament.championName}` : ""}
          </p>
          {isRegistered && (
            <span className="mt-2 inline-flex rounded-md border border-green-200 bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700 dark:border-green-800 dark:bg-green-950/40">
              You&apos;re registered
            </span>
          )}
        </div>
        {student && tournament.status === "draft" && (
          <TournamentRegisterButton tournamentId={tournament.id} registered={isRegistered} />
        )}
      </div>

      <TournamentResults
        participants={participants}
        matches={matches}
        standings={standings}
        bracketRounds={tournament.bracketRounds}
      />
    </div>
  );
}
