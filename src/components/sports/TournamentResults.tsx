import { roundLabel } from "@/lib/tournament";

type Participant = {
  id: string;
  firstName: string;
  lastName: string;
};

type Match = {
  id: string;
  stage: string;
  groupLabel: string | null;
  round: number;
  participantAId: string | null;
  participantBId: string | null;
  scoreA: number | null;
  scoreB: number | null;
  winnerId: string | null;
  status: string;
  scheduledAt: Date | null;
  venue: string | null;
};

type StandingsRow = {
  participantId: string;
  name: string;
  groupLabel: string | null;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scored: number;
  conceded: number;
  points: number;
};

export function TournamentResults({
  participants,
  matches,
  standings,
  bracketRounds = null,
}: {
  participants: Participant[];
  matches: Match[];
  standings: StandingsRow[];
  bracketRounds?: number | null;
}) {
  const namesById = new Map(
    participants.map((p) => [p.id, `${p.firstName} ${p.lastName}`])
  );

  const groupMatches = matches.filter((m) => m.stage === "group");
  const knockoutMatches = matches.filter((m) => m.stage === "knockout");
  const groupLabels = [
    ...new Set(groupMatches.map((m) => m.groupLabel ?? "").filter(Boolean)),
  ].sort();

  const knockoutRounds = new Map<number, Match[]>();
  for (const m of knockoutMatches) {
    knockoutRounds.set(m.round, [...(knockoutRounds.get(m.round) ?? []), m]);
  }

  return (
    <>
      {standings.length > 0 && (
        <div className="mb-6 overflow-x-auto rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
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
            title={`Knockout · ${roundLabel(round, bracketRounds)}`}
            matches={roundMatches}
            namesById={namesById}
          />
        ))}

      {standings.length === 0 && matches.length === 0 && (
        <p className="rounded-2xl bg-white px-6 py-10 text-center text-sm text-neutral-400 dark:bg-neutral-900 dark:text-neutral-500 ring-1 ring-black/5 dark:ring-white/10">
          No matches have been played yet.
        </p>
      )}
    </>
  );
}

function MatchSection({
  title,
  matches,
  namesById,
}: {
  title: string;
  matches: Match[];
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
