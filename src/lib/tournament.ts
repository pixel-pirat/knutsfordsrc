// Pure tournament pairing logic. DB concerns live in src/db/sportsQueries.ts,
// this module only computes pairings / standings so it stays easy to reason
// about and test.

export type TournamentFormat =
  | "single_elimination"
  | "round_robin"
  | "group_knockout";

export type SeedParticipant = {
  participantId: string;
  seed: number;
};

export type GeneratedMatch = {
  stage: "group" | "knockout";
  groupLabel: string | null;
  round: number;
  matchIndex: number;
  participantAId: string | null;
  participantBId: string | null;
  // Walkover outcome known at generation time (a participant whose opponent
  // slot is a bye advances automatically).
  autoWinnerId: string | null;
};

export type GenerationPlan = {
  matches: GeneratedMatch[];
  // total knockout rounds (log2 of bracket size); null for round robin
  bracketRounds: number | null;
  // per-participant group labels for group formats
  groupLabels?: Record<string, string>;
  // participants promoted automatically (single left after full-bye side)
  immediateChampionId?: string;
};

function nextPow2(n: number) {
  let p = 1;
  while (p < n) p *= 2;
  return p;
}

/**
 * Standard bracket seed order, e.g. for 8: [1, 8, 5, 4, 3, 6, 7, 2].
 * Guarantees byes are never adjacent when n >= B/2.
 */
function bracketOrder(bracketSize: number): number[] {
  let arr = [1, 2];
  while (arr.length < bracketSize) {
    const total = arr.length * 2 + 1;
    arr = arr.flatMap((s) => [s, total - s]);
  }
  return arr;
}

function singleEliminationPlan(
  seeds: SeedParticipant[],
  stage: "knockout"
): GenerationPlan {
  const byId = new Map(seeds.map((s) => [s.seed, s.participantId]));
  const bracketSize = nextPow2(Math.max(seeds.length, 2));
  const totalRounds = Math.log2(bracketSize);
  const order = bracketOrder(bracketSize);

  const matches: GeneratedMatch[] = [];
  // slotValues[i] for the current round: participant ids or null.
  // null means "unknown yet" (a winner will arrive) or a bye.
  let slots: (string | null)[] = [];
  for (let i = 0; i < bracketSize; i += 2) {
    slots.push(byId.get(order[i]) ?? null, byId.get(order[i + 1]) ?? null);
  }

  let round = 1;
  let immediateChampionId: string | undefined;

  while (slots.length > 1) {
    const nextSlots: (string | null)[] = [];
    for (let m = 0; m < slots.length / 2; m++) {
      const a = slots[2 * m];
      const b = slots[2 * m + 1];
      if (a && b) {
        // Real match; winner arrives once scores are reported.
        matches.push({
          stage,
          groupLabel: null,
          round,
          matchIndex: m,
          participantAId: a,
          participantBId: b,
          autoWinnerId: null,
        });
        nextSlots.push(null);
      } else if (a ?? b) {
        // Walkover — the lone participant advances automatically.
        const auto = (a ?? b) as string;
        if (slots.length === 2 && m === 0) {
          // Was supposed to be the final; treat as immediate champion.
          immediateChampionId = auto;
        } else {
          matches.push({
            stage,
            groupLabel: null,
            round,
            matchIndex: m,
            participantAId: a,
            participantBId: b,
            autoWinnerId: auto,
          });
          nextSlots.push(auto);
        }
      }
      // both null (bye vs bye) — cannot happen with standard seed order,
      // nothing is created.
    }
    slots = nextSlots;
    round++;
  }

  return { matches, bracketRounds: totalRounds, immediateChampionId };
}

/** Circle method round robin; supports odd counts via bye (null). */
export function roundRobinPairs(idList: string[]): {
  round: number;
  pairs: [string | null, string | null][];
}[] {
  const ids = [...idList];
  if (ids.length === 0) return [];
  if (ids.length % 2 === 1) ids.push(null as unknown as string);
  const n = ids.length;
  const rounds: { round: number; pairs: [string | null, string | null][] }[] =
    [];
  let rotation = [...ids];
  for (let r = 0; r < n - 1; r++) {
    const pairs: [string | null, string | null][] = [];
    for (let i = 0; i < n / 2; i++) {
      const a = rotation[i];
      const b = rotation[n - 1 - i];
      pairs.push([a, b]);
    }
    rounds.push({ round: r + 1, pairs });
    // rotate all but the first element
    rotation = [rotation[0], rotation[n - 1], ...rotation.slice(1, n - 1)];
  }
  return rounds;
}

const GROUP_LETTERS = "ABCDEFGH";

function groupLabelFor(index: number) {
  return GROUP_LETTERS[index] ?? `G${index + 1}`;
}

/** Serpentine (fair) seed distribution across groups. */
function assignGroups(
  seeds: SeedParticipant[],
  numberOfGroups: number
): Record<string, string> {
  const labels: Record<string, string> = {};
  seeds.forEach((p, i) => {
    const wave = Math.floor(i / numberOfGroups);
    const pos = i % numberOfGroups;
    const groupIndex = wave % 2 === 0 ? pos : numberOfGroups - 1 - pos;
    labels[p.participantId] = groupLabelFor(groupIndex);
  });
  return labels;
}

export function generatePairings(
  format: TournamentFormat,
  seeds: SeedParticipant[],
  options: { numberOfGroups?: number; qualifiersPerGroup?: number } = {}
): GenerationPlan {
  if (format === "single_elimination") {
    return singleEliminationPlan(seeds, "knockout");
  }

  if (format === "round_robin") {
    const pairs = roundRobinPairs(seeds.map((s) => s.participantId));
    const matches: GeneratedMatch[] = [];
    for (const { round, pairs: roundPairs } of pairs) {
      roundPairs.forEach((pair, m) => {
        const [a, b] = pair;
        if (a && b) {
          matches.push({
            stage: "group",
            groupLabel: null,
            round,
            matchIndex: m,
            participantAId: a,
            participantBId: b,
            autoWinnerId: null,
          });
        }
        // solo = bye round for that participant, no match
      });
    }
    return { matches, bracketRounds: null };
  }

  // group_knockout
  const numberOfGroups = Math.max(2, options.numberOfGroups ?? 2);
  const labels = assignGroups(seeds, numberOfGroups);

  const groupsMap = new Map<string, string[]>();
  for (const s of seeds) {
    const label = labels[s.participantId];
    groupsMap.set(label, [...(groupsMap.get(label) ?? []), s.participantId]);
  }

  const matches: GeneratedMatch[] = [];
  for (const [label, ids] of groupsMap) {
    const pairs = roundRobinPairs(ids);
    for (const { round, pairs: roundPairs } of pairs) {
      roundPairs.forEach((pair, m) => {
        const [a, b] = pair;
        if (a && b) {
          matches.push({
            stage: "group",
            groupLabel: label,
            round,
            matchIndex: m,
            participantAId: a,
            participantBId: b,
            autoWinnerId: null,
          });
        }
      });
    }
  }
  return { matches, bracketRounds: null, groupLabels: labels };
}

/**
 * Where does the winner of a knockout match go next?
 */
export function nextKnockoutSlot(match: {
  round: number;
  matchIndex: number;
}) {
  return {
    round: match.round + 1,
    matchIndex: Math.floor(match.matchIndex / 2),
    // even matchIndex feeds slot A of the next match, odd feeds slot B
    slot: match.matchIndex % 2 === 0 ? ("participantAId" as const) : ("participantBId" as const),
  };
}

export function roundLabel(round: number, bracketRounds: number | null) {
  if (!bracketRounds) return `Round ${round}`;
  const remaining = bracketRounds - round;
  if (remaining === 0) return "Final";
  if (remaining === 1) return "Semi-finals";
  if (remaining === 2) return "Quarter-finals";
  if (remaining === 3) return "Round of 16";
  return `Round ${round}`;
}

// ---------------------------------------------------------------------------
// Standings
// ---------------------------------------------------------------------------

export type StandingsRow = {
  participantId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  scored: number;
  conceded: number;
  points: number;
};

export function computeStandings(
  participantIds: string[],
  completedMatches: {
    participantAId: string | null;
    participantBId: string | null;
    scoreA: number | null;
    scoreB: number | null;
  }[]
): StandingsRow[] {
  const rows = new Map<string, StandingsRow>();
  for (const id of participantIds) {
    rows.set(id, {
      participantId: id,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      scored: 0,
      conceded: 0,
      points: 0,
    });
  }

  for (const m of completedMatches) {
    if (!m.participantAId || !m.participantBId) continue;
    if (m.scoreA === null || m.scoreB === null) continue;
    const a = rows.get(m.participantAId);
    const b = rows.get(m.participantBId);
    if (!a || !b) continue;
    a.played++;
    b.played++;
    a.scored += m.scoreA;
    a.conceded += m.scoreB;
    b.scored += m.scoreB;
    b.conceded += m.scoreA;
    if (m.scoreA > m.scoreB) {
      a.won++;
      b.lost++;
      a.points += 3;
    } else if (m.scoreB > m.scoreA) {
      b.won++;
      a.lost++;
      b.points += 3;
    } else {
      a.drawn++;
      b.drawn++;
      a.points += 1;
      b.points += 1;
    }
  }

  return [...rows.values()].sort(
    (x, y) =>
      y.points - x.points ||
      y.scored - y.conceded - (x.scored - x.conceded) ||
      y.scored - x.scored ||
      x.participantId.localeCompare(y.participantId)
  );
}

/**
 * Build the knockout pairings once the group stage is complete.
 * Qualifiers interleave per group: A1, B1, ..., A2, B2, ...  The first half
 * of that list is paired against the reversed second half.
 */
export function groupKnockoutSeeds(
  groupStandings: { label: string; rows: StandingsRow[] }[],
  qualifiersPerGroup: number
): SeedParticipant[] {
  const seedList: SeedParticipant[] = [];
  for (let q = 0; q < qualifiersPerGroup; q++) {
    for (const { rows } of groupStandings) {
      const row = rows[q];
      if (row) seedList.push({ participantId: row.participantId, seed: seedList.length + 1 });
    }
  }

  // re-order: first half vs reversed second half pairing
  if (seedList.length >= 2) {
    const half = Math.ceil(seedList.length / 2);
    const first = seedList.slice(0, half);
    const rest = seedList.slice(half).reverse();
    const arranged: SeedParticipant[] = [];
    for (let i = 0; i < Math.max(first.length, rest.length); i++) {
      if (first[i]) arranged.push(first[i]);
      if (rest[i]) arranged.push(rest[i]);
    }
    return arranged.map((p, i) => ({ ...p, seed: i + 1 }));
  }
  return seedList;
}
