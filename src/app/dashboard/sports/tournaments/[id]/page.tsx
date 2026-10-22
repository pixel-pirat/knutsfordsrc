import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getTournamentById,
  listMatchesForTournament,
  listTournamentParticipants,
  listTournamentStandings,
} from "@/db/sportsQueries";
import { roundLabel } from "@/lib/tournament";

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: "Knockout",
  round_robin: "League",
  group_knockout: "Groups + knockout",
};

export default async function StudentTournamentPage({
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

  const namesById = new Map(participants.map((p) => [p.id, `${p.firstName} ${p.lastName}`]));

  const groupMatches = matches.filter((m) => m.stage === "group");
  const knockoutMatches = matches.filter((m) => m.stage === "knockout");
  const groupLabels = [
    ...new Set(groupMatches.map((m) => m.groupLabel ?? "").filter(Boolean)),
  ].sort();

  const knockoutRounds = new Map<number, typeof knockoutMatches>();
  for (const m of knockoutMatches) {
    knockoutRounds.set(m.round, [...(knockoutRounds.get(m.round) ?? []), m]);
  }

  return (
    <div>
      <div className="mb-6">
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
          {participants.length} participants
          {tournament.championName ? ` · 🏆 Champion: ${tournament.championName}` : ""}
        </p>
      </div>

      {standings.length > 0 && (
        <div className="mb-6 rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
          <h2 className="border-b border-black/5 px-6 py-4 text-sm font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
            Standings
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                <th className="px-6 py-3">Player</th>
                {standings[0].groupLabel && standings[0].groupLabel.length <= 2 && (
                  <th className="px-4 py-3">Group</th>
                )}
                <th className="px-4 py-3 text-center">P</th>
                <th className="px-4 py-3 text-center">W</th>
                <th className="px-4 py-3 text-center">D</th>
                <th className="px-4 py-3 text-center">L</th>
                <th className="px-4 py-3 text-center">GF:GA</th>
                <th className="px-6 py-3 text-center">Pts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {standings.map((s) => (
                <tr key={s.participantId}>
                  <td className="px-6 py-3 font-medium text-ink dark:text-neutral-100">
                    {s.name}
                  </td>
                  {standings[0].groupLabel && standings[0].groupLabel.length <= 2 && (
                    <td className="px-4 py-3 text-neutral-500 dark:text-neutral-400">
                      {s.groupLabel}
                    </td>
                  )}
                  <td className="px-4 py-3 text-center text-neutral-500 dark:text-neutral-400">{s.played}</td>
                  <td className="px-4 py-3 text-center text-neutral-500 dark:text-neutral-400">{s.won}</td>
                  <td className="px-4 py-3 text-center text-neutral-500 dark:text-neutral-400">{s.drawn}</td>
                  <td className="px-4 py-3 text-center text-neutral-500 dark:text-neutral-400">{s.lost}</td>
                  <td className="px-4 py-3 text-center text-neutral-500 dark:text-neutral-400">
                    {s.scored}:{s.conceded}
                  </td>
                  <td className="px-6 py-3 text-center font-bold text-ink dark:text-neutral-100">
                    {s.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {groupLabels.length > 0
        ? groupLabels.map((label) => (
            <MatchSection
              key={label}
              title={`Group ${label}`}
              matches={groupMatches.filter((m) => m.groupLabel === label)}
              namesById={namesById}
            />
          ))
        : groupMatches.length > 0 && (
            <MatchSection
              title="League matches"
              matches={groupMatches}
              namesById={namesById}
            />
          )}

      {[...knockoutRounds.entries()]
        .sort((a, b) => a[0] - b[0])
        .map(([round, roundMatches]) => (
          <MatchSection
            key={`ko-${round}`}
            title={`Knockout · ${roundLabel(round, null)}`}
            matches={roundMatches}
            namesById={namesById}
          />
        ))}
    </div>
  );
}

function MatchSection({
  title,
  matches,
  namesById,
}: {
  title: string;
  matches: {
    id: string;
    participantAId: string | null;
    participantBId: string | null;
    scoreA: number | null;
    scoreB: number | null;
    winnerId: string | null;
    status: string;
    scheduledAt: Date | null;
    venue: string | null;
  }[];
  namesById: Map<string, string>;
}) {
  if (matches.length === 0) return null;
  return (
    <div className="mb-6 rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
      <h2 className="border-b border-black/5 px-6 py-4 text-sm font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
        {title}
      </h2>
      <ul className="divide-y divide-black/5 dark:divide-white/10">
        {matches.map((m) => {
          const nameA = m.participantAId
            ? (namesById.get(m.participantAId) ?? "?")
            : "TBD";
          const nameB = m.participantBId
            ? (namesById.get(m.participantBId) ?? "?")
            : "TBD";
          const bold = (id: string | null) =>
            m.status === "completed" && m.winnerId === id
              ? "font-semibold text-ink dark:text-neutral-100"
              : "text-neutral-500 dark:text-neutral-400";
          return (
            <li key={m.id} className="flex flex-wrap items-center gap-2 px-6 py-3.5 text-sm">
              <span className={bold(m.participantAId)}>{nameA}</span>
              <span className="rounded bg-neutral-100 px-2 py-0.5 font-mono text-xs text-ink dark:bg-neutral-800 dark:text-neutral-100">
                {m.status === "completed" ? `${m.scoreA ?? "–"} : ${m.scoreB ?? "–"}` : "vs"}
              </span>
              <span className={bold(m.participantBId)}>{nameB}</span>
              <span className="ml-auto text-xs text-neutral-400 dark:text-neutral-500">
                {m.scheduledAt
                  ? new Date(m.scheduledAt).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                    })
                  : "Time TBC"}
                {m.venue ? ` · ${m.venue}` : ""}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
