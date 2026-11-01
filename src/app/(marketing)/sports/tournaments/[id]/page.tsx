import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import {
  getTournamentById,
  listMatchesForTournament,
  listTournamentParticipants,
  listTournamentStandings,
} from "@/db/sportsQueries";
import { TournamentResults } from "@/components/sports/TournamentResults";

export const dynamic = "force-dynamic";

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const tournament = await getTournamentById(id);
  return {
    title: tournament ? `${tournament.name} | Knutsford Sports` : "Tournament | Knutsford Sports",
  };
}

export default async function PublicTournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const tournament = await getTournamentById(id);
  if (!tournament) notFound();

  const [participants, matches, standings] = await Promise.all([
    listTournamentParticipants(id).catch(() => []),
    listMatchesForTournament(id).catch(() => []),
    listTournamentStandings(id).catch(() => []),
  ]);

  return (
    <section className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-4xl px-6 py-12 lg:px-8 lg:py-16">
        <Link
          href="/sports"
          className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-ink dark:text-neutral-400 dark:hover:text-neutral-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Sports
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            {tournament.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {FORMAT_LABELS[tournament.format] ?? tournament.format} ·{" "}
            {STATUS_LABELS[tournament.status] ?? tournament.status} ·{" "}
            {participants.length} participants
            {tournament.championName ? ` · 🏆 Champion: ${tournament.championName}` : ""}
          </p>
          {tournament.status === "draft" && (
            <p className="mt-3 rounded-lg bg-gold/10 px-3.5 py-2.5 text-sm text-ink ring-1 ring-gold/25 dark:text-neutral-100">
              Registration is open —{" "}
              <Link href="/login" className="font-semibold text-gold-dark hover:underline dark:text-gold-light">
                log in to the student dashboard
              </Link>{" "}
              to join.
            </p>
          )}
        </div>

        <TournamentResults
          participants={participants}
          matches={matches}
          standings={standings}
          bracketRounds={tournament.bracketRounds}
        />
      </div>
    </section>
  );
}
