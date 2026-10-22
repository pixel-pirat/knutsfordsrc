import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "./index";
import {
  halls,
  sportAnnouncements,
  sportEvents,
  sportMatches,
  sportParticipations,
  sportTournaments,
  students,
  tournamentParticipants,
  type NewSportEvent,
  type NewSportTournament,
} from "./schema";
import {
  computeStandings,
  generatePairings,
  groupKnockoutSeeds,
  nextKnockoutSlot,
  type GenerationPlan,
  type SeedParticipant,
  type TournamentFormat,
} from "@/lib/tournament";

// ---------------------------------------------------------------------------
// Sport events
// ---------------------------------------------------------------------------

export async function listSportEventsForAdmin({ limit = 200, offset = 0 } = {}) {
  return db
    .select({
      id: sportEvents.id,
      title: sportEvents.title,
      sport: sportEvents.sport,
      venue: sportEvents.venue,
      startsAt: sportEvents.startsAt,
      endsAt: sportEvents.endsAt,
      published: sportEvents.published,
      registrationCount: sql<number>`(
        select count(*)::int from ${sportParticipations} p where p.event_id = ${sportEvents.id}
      )`,
      confirmedCount: sql<number>`(
        select count(*)::int from ${sportParticipations} p
        where p.event_id = ${sportEvents.id} and p.status = 'confirmed'
      )`,
    })
    .from(sportEvents)
    .orderBy(desc(sportEvents.startsAt))
    .limit(limit)
    .offset(offset);
}

export function getSportEventById(id: string) {
  return db.query.sportEvents.findFirst({
    where: eq(sportEvents.id, id),
  });
}

export function createSportEvent(values: NewSportEvent) {
  return db.insert(sportEvents).values(values).returning();
}

export function updateSportEvent(
  id: string,
  values: Partial<
    Pick<
      NewSportEvent,
      "title" | "sport" | "description" | "venue" | "startsAt" | "endsAt" | "imageUrl" | "published"
    >
  >
) {
  return db
    .update(sportEvents)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(sportEvents.id, id))
    .returning();
}

export function deleteSportEvent(id: string) {
  return db.delete(sportEvents).where(eq(sportEvents.id, id)).returning();
}

// ---------------------------------------------------------------------------
// Participations
// ---------------------------------------------------------------------------

export function listParticipationsForEvent(eventId: string) {
  return db
    .select({
      id: sportParticipations.id,
      status: sportParticipations.status,
      createdAt: sportParticipations.createdAt,
      studentId: students.id,
      indexNumber: students.indexNumber,
      firstName: students.firstName,
      lastName: students.lastName,
      email: students.email,
      program: students.program,
      level: students.level,
      hallName: halls.name,
    })
    .from(sportParticipations)
    .innerJoin(students, eq(sportParticipations.studentId, students.id))
    .leftJoin(halls, eq(students.hallId, halls.id))
    .where(eq(sportParticipations.eventId, eventId))
    .orderBy(asc(sportParticipations.createdAt));
}

export function getStudentParticipation(eventId: string, studentId: string) {
  return db.query.sportParticipations.findFirst({
    where: and(
      eq(sportParticipations.eventId, eventId),
      eq(sportParticipations.studentId, studentId)
    ),
  });
}

export function registerStudentForEvent(eventId: string, studentId: string) {
  return db
    .insert(sportParticipations)
    .values({ eventId, studentId })
    .onConflictDoUpdate({
      target: [sportParticipations.eventId, sportParticipations.studentId],
      set: { status: "registered", updatedAt: new Date() },
    })
    .returning();
}

export function cancelStudentRegistration(eventId: string, studentId: string) {
  return db
    .delete(sportParticipations)
    .where(
      and(
        eq(sportParticipations.eventId, eventId),
        eq(sportParticipations.studentId, studentId)
      )
    )
    .returning();
}

export function setParticipationStatus(
  participationId: string,
  status: "registered" | "confirmed" | "declined"
) {
  return db
    .update(sportParticipations)
    .set({ status, updatedAt: new Date() })
    .where(eq(sportParticipations.id, participationId))
    .returning();
}

export async function countConfirmedParticipations(eventId: string) {
  const [row] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sportParticipations)
    .where(
      and(
        eq(sportParticipations.eventId, eventId),
        eq(sportParticipations.status, "confirmed")
      )
    );
  return row?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Tournaments
// ---------------------------------------------------------------------------

export function listTournaments({ limit = 100, offset = 0 } = {}) {
  return db
    .select({
      id: sportTournaments.id,
      name: sportTournaments.name,
      sport: sportTournaments.sport,
      format: sportTournaments.format,
      status: sportTournaments.status,
      championName: sportTournaments.championName,
      eventTitle: sportEvents.title,
      participantCount: sql<number>`(
        select count(*)::int from ${tournamentParticipants} p
        where p.tournament_id = ${sportTournaments.id}
      )`,
      matchCount: sql<number>`(
        select count(*)::int from ${sportMatches} m
        where m.tournament_id = ${sportTournaments.id}
      )`,
    })
    .from(sportTournaments)
    .leftJoin(sportEvents, eq(sportTournaments.eventId, sportEvents.id))
    .orderBy(desc(sportTournaments.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getTournamentById(id: string) {
  return db.query.sportTournaments.findFirst({
    where: eq(sportTournaments.id, id),
  });
}

export function createTournament(values: NewSportTournament) {
  return db.insert(sportTournaments).values(values).returning();
}

export function updateTournament(
  id: string,
  values: Partial<
    Pick<
      NewSportTournament,
      "name" | "sport" | "description" | "format" | "status" | "eventId" | "numberOfGroups" | "qualifiersPerGroup" | "championName" | "bracketRounds"
    >
  >
) {
  return db
    .update(sportTournaments)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(sportTournaments.id, id))
    .returning();
}

export function deleteTournament(id: string) {
  return db.delete(sportTournaments).where(eq(sportTournaments.id, id)).returning();
}

export function listTournamentParticipants(tournamentId: string) {
  return db
    .select({
      id: tournamentParticipants.id,
      seed: tournamentParticipants.seed,
      groupLabel: tournamentParticipants.groupLabel,
      studentId: students.id,
      indexNumber: students.indexNumber,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(tournamentParticipants)
    .innerJoin(students, eq(tournamentParticipants.studentId, students.id))
    .where(eq(tournamentParticipants.tournamentId, tournamentId))
    .orderBy(asc(tournamentParticipants.seed));
}

export function listConfirmedParticipantsForEvent(eventId: string) {
  return db
    .select({
      studentId: students.id,
      indexNumber: students.indexNumber,
      firstName: students.firstName,
      lastName: students.lastName,
    })
    .from(sportParticipations)
    .innerJoin(students, eq(sportParticipations.studentId, students.id))
    .where(
      and(
        eq(sportParticipations.eventId, eventId),
        eq(sportParticipations.status, "confirmed")
      )
    )
    .orderBy(students.lastName, students.firstName);
}

export async function addTournamentParticipants(
  tournamentId: string,
  studentIds: string[]
) {
  if (studentIds.length === 0) return [];
  const [{ maxSeed }] = await db
    .select({
      maxSeed: sql<number>`coalesce(max(${tournamentParticipants.seed}), 0)`,
    })
    .from(tournamentParticipants)
    .where(eq(tournamentParticipants.tournamentId, tournamentId));

  return db
    .insert(tournamentParticipants)
    .values(
      studentIds.map((studentId, i) => ({
        tournamentId,
        studentId,
        seed: maxSeed + i + 1,
      }))
    )
    .onConflictDoNothing()
    .returning();
}

export async function removeTournamentParticipant(participantId: string) {
  return db
    .delete(tournamentParticipants)
    .where(eq(tournamentParticipants.id, participantId))
    .returning();
}

/** Search students not yet in this tournament, for the picker. */
export async function searchStudentsForTournament(
  tournamentId: string,
  query: string,
  limit = 8
) {
  return db
    .select({
      studentId: students.id,
      indexNumber: students.indexNumber,
      firstName: students.firstName,
      lastName: students.lastName,
      program: students.program,
    })
    .from(students)
    .where(
      and(
        sql`not exists (
          select 1 from ${tournamentParticipants} p
          where p.tournament_id = ${tournamentId} and p.student_id = ${students.id}
        )`,
        or(
          ilike(students.indexNumber, `%${query}%`),
          ilike(students.firstName, `%${query}%`),
          ilike(students.lastName, `%${query}%`)
        )
      )
    )
    .orderBy(asc(students.indexNumber))
    .limit(limit);
}

/**
 * Insert (or refresh) the matches produced by a generation plan.
 * - Matches whose (stage, round, matchIndex) already exist are updated, unless
 *   they are already completed (results are never silently overwritten).
 * - Leftover matches that are no longer part of the plan are removed
 *   (including their bookings), and participants' group labels are set.
 */
async function insertGeneratedMatches(
  tournamentId: string,
  plan: GenerationPlan
) {
  if (plan.groupLabels) {
    const idByParticipant = plan.groupLabels;
    for (const [participantId, label] of Object.entries(idByParticipant)) {
      await db
        .update(tournamentParticipants)
        .set({ groupLabel: label })
        .where(eq(tournamentParticipants.id, participantId));
    }
  }

  const existing = await db
    .select()
    .from(sportMatches)
    .where(eq(sportMatches.tournamentId, tournamentId));

  const positionKey = (m: {
    stage: string;
    round: number;
    matchIndex: number;
  }) => `${m.stage}:${m.round}:${m.matchIndex}`;

  const planKeys = new Set(plan.matches.map(positionKey));
  const result = { created: 0, updated: 0, skipped: 0, removed: 0 };

  // remove leftovers that the plan no longer includes
  for (const m of existing) {
    if (!planKeys.has(positionKey(m))) {
      await db.delete(sportMatches).where(eq(sportMatches.id, m.id));
      result.removed++;
    }
  }

  for (const {
    stage,
    groupLabel,
    round,
    matchIndex,
    participantAId,
    participantBId,
    autoWinnerId,
  } of plan.matches) {
    const existingMatch = existing.find(
      (m) =>
        m.stage === stage && m.round === round && m.matchIndex === matchIndex
    );

    if (existingMatch) {
      if (existingMatch.status === "completed") {
        // a recorded result (or walkover) is never silently overwritten
        result.skipped++;
      } else {
        await db
          .update(sportMatches)
          .set({
            stage,
            groupLabel,
            participantAId,
            participantBId,
            winnerId: autoWinnerId,
            status: autoWinnerId ? "completed" : "pending",
            updatedAt: new Date(),
          })
          .where(eq(sportMatches.id, existingMatch.id));
        result.updated++;
      }
    } else {
      await db.insert(sportMatches).values({
        tournamentId,
        stage,
        groupLabel,
        round,
        matchIndex,
        participantAId,
        participantBId,
        winnerId: autoWinnerId,
        status: autoWinnerId ? "completed" : "pending",
      });
      result.created++;
    }
  }

  return result;
}

export async function generateTournamentPairings(tournamentId: string) {
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  const participants = await listTournamentParticipants(tournamentId);
  if (participants.length < 2) {
    throw new Error("Add at least 2 participants before generating pairings");
  }

  const seeds: SeedParticipant[] = participants.map((p, i) => ({
    participantId: p.id,
    seed: i + 1,
  }));

  const plan = generatePairings(tournament.format as TournamentFormat, seeds, {
    numberOfGroups: tournament.numberOfGroups ?? undefined,
    qualifiersPerGroup: tournament.qualifiersPerGroup ?? undefined,
  });

  await insertGeneratedMatches(tournamentId, plan);

  if (plan.immediateChampionId) {
    // every round on one side was a bye — the lone participant wins outright
    const participant = participants.find(
      (p) => p.id === plan.immediateChampionId
    );
    if (participant) {
      await updateTournament(tournamentId, {
        status: "completed",
        bracketRounds: plan.bracketRounds,
        championName: `${participant.firstName} ${participant.lastName}`,
      });
    }
  } else {
    await updateTournament(tournamentId, {
      status: tournament.status === "completed" ? "completed" : "active",
      bracketRounds: plan.bracketRounds,
    });
  }

  return plan;
}

/**
 * Report a result for a match. For knockout matches the winner is advanced
 * into the next round; when the final completes the champion is recorded.
 */
export async function reportMatchResult(
  matchId: string,
  input: {
    scoreA?: number | null;
    scoreB?: number | null;
    winnerId?: string | null;
    scheduledAt?: string | null;
    venue?: string | null;
  }
) {
  const match = await db.query.sportMatches.findFirst({
    where: eq(sportMatches.id, matchId),
  });
  if (!match) throw new Error("Match not found");

  const tournament = await getTournamentById(match.tournamentId);
  if (!tournament) throw new Error("Tournament not found");

  const patch: Record<string, unknown> = {
    scoreA: input.scoreA ?? null,
    scoreB: input.scoreB ?? null,
    scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : match.scheduledAt,
    venue: input.venue ?? match.venue,
    updatedAt: new Date(),
  };

  const participantsSet = Boolean(match.participantAId && match.participantBId);
  const scoresGiven =
    input.scoreA != null && input.scoreB != null && match.participantAId && match.participantBId;

  if (input.winnerId != null && participantsSet) {
    patch.winnerId = input.winnerId;
    patch.status = "completed";
  } else if (scoresGiven) {
    // derive the winner from the scores; knockout games can't be drawn
    if (match.stage === "knockout" && input.scoreA === input.scoreB) {
      throw new Error(
        "Knockout games can't end in a draw — enter a higher score for the winner."
      );
    }
    if (input.scoreA! > input.scoreB!) {
      patch.winnerId = match.participantAId;
      patch.status = "completed";
    } else if (input.scoreB! > input.scoreA!) {
      patch.winnerId = match.participantBId;
      patch.status = "completed";
    } else {
      // league draw — completed with no winner
      patch.winnerId = null;
      patch.status = "completed";
    }
  }

  const [updated] = await db
    .update(sportMatches)
    .set(patch)
    .where(eq(sportMatches.id, matchId))
    .returning();

  const completed =
    updated.status === "completed" &&
    updated.winnerId &&
    updated.participantAId &&
    updated.participantBId;

  // Knockout advancement
  if (completed && updated.stage === "knockout") {
    await advanceKnockoutWinner(updated);
  }

  // League completion: all matches done → champion is standings leader
  if (tournament.format === "round_robin") {
    const [counts] = await db
      .select({
        pending: sql<number>`count(*) filter (where ${sportMatches.status} = 'pending')::int`,
        total: sql<number>`count(*) filter (where ${sportMatches.participantAId} is not null and ${sportMatches.participantBId} is not null)::int`,
      })
      .from(sportMatches)
      .where(eq(sportMatches.tournamentId, tournament.id));

    if (counts.total > 0 && counts.pending === 0) {
      const standings = await listTournamentStandings(tournament.id);
      const champion = standings[0];
      if (champion) {
        await db
          .update(sportTournaments)
          .set({
            status: "completed",
            championName: champion.name,
            updatedAt: new Date(),
          })
          .where(eq(sportTournaments.id, tournament.id));
      }
    }
  }

  return updated;
}

/** Place the winner of a finished knockout match into the next round slot. */
async function advanceKnockoutWinner(
  match: typeof sportMatches.$inferSelect
) {
  const tournament = await getTournamentById(match.tournamentId);
  if (!tournament) return;

  const next = nextKnockoutSlot({ round: match.round, matchIndex: match.matchIndex });
  const isFinal = tournament.bracketRounds !== null && match.round >= tournament.bracketRounds;

  if (isFinal) {
    // Champion: look up the student behind the winning participant
    const participant = await db.query.tournamentParticipants.findFirst({
      where: eq(tournamentParticipants.id, match.winnerId!),
      with: { student: true },
    });
    if (participant) {
      await db
        .update(sportTournaments)
        .set({
          status: "completed",
          championName: `${participant.student.firstName} ${participant.student.lastName}`,
          updatedAt: new Date(),
        })
        .where(eq(sportTournaments.id, tournament.id));
    }
    return;
  }

  // find or create the next round match
  const [existingNext] = await db
    .select({ id: sportMatches.id })
    .from(sportMatches)
    .where(
      and(
        eq(sportMatches.tournamentId, match.tournamentId),
        eq(sportMatches.stage, match.stage),
        eq(sportMatches.round, next.round),
        eq(sportMatches.matchIndex, next.matchIndex)
      )
    );

  if (existingNext) {
    await db
      .update(sportMatches)
      .set({ [next.slot]: match.winnerId, updatedAt: new Date() })
      .where(eq(sportMatches.id, existingNext.id));
  } else {
    await db.insert(sportMatches).values({
      tournamentId: match.tournamentId,
      stage: match.stage,
      groupLabel: null,
      round: next.round,
      matchIndex: next.matchIndex,
      [next.slot]: match.winnerId,
    });
  }
}

/**
 * For group_knockout tournaments: build the knockout bracket from the final
 * standings of every group.
 */
export async function advanceGroupStage(tournamentId: string) {
  const tournament = await getTournamentById(tournamentId);
  if (!tournament) throw new Error("Tournament not found");
  if (tournament.format !== "group_knockout") {
    throw new Error("Only group + knockout tournaments advance this way");
  }

  const groupMatches = await db
    .select()
    .from(sportMatches)
    .where(
      and(
        eq(sportMatches.tournamentId, tournamentId),
        eq(sportMatches.stage, "group")
      )
    );
  if (groupMatches.length === 0) {
    throw new Error("Generate the group stage first");
  }

  const unfinished = groupMatches.filter((m) => m.status === "pending");
  if (unfinished.length > 0) {
    throw new Error("All group matches must be completed first");
  }

  const participants = await listTournamentParticipants(tournamentId);
  const groupsMap = new Map<string, string[]>();
  for (const p of participants) {
    const label = p.groupLabel ?? "A";
    groupsMap.set(label, [...(groupsMap.get(label) ?? []), p.id]);
  }

  const standings = [...groupsMap.entries()].map(([label, ids]) => ({
    label,
    rows: computeStandings(ids, groupMatches),
  }));

  const qualifiersPerGroup = tournament.qualifiersPerGroup ?? 1;
  const knockoutSeeds = groupKnockoutSeeds(standings, qualifiersPerGroup);
  if (knockoutSeeds.length < 2) {
    throw new Error("Not enough qualifiers to build the knockout bracket");
  }

  const plan = generatePairings("single_elimination", knockoutSeeds);
  await insertGeneratedMatches(tournamentId, plan);
  await updateTournament(tournamentId, {
    bracketRounds: plan.bracketRounds,
    status: tournament.status === "completed" ? "completed" : tournament.status,
  });

  return plan;
}

export function listMatchesForTournament(tournamentId: string) {
  return db
    .select()
    .from(sportMatches)
    .where(eq(sportMatches.tournamentId, tournamentId))
    .orderBy(asc(sportMatches.round), asc(sportMatches.matchIndex));
}

// ---------------------------------------------------------------------------
// Standings / schedule (with joined names for display)
// ---------------------------------------------------------------------------

export async function listTournamentStandings(
  tournamentId: string
): Promise<
  {
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
  }[]
> {
  const participants = await listTournamentParticipants(tournamentId);
  const completed = await db
    .select()
    .from(sportMatches)
    .where(
      and(
        eq(sportMatches.tournamentId, tournamentId),
        eq(sportMatches.stage, "group"),
        eq(sportMatches.status, "completed")
      )
    );

  const groupsMap = new Map<string, string[]>();
  for (const p of participants) {
    const label = p.groupLabel ?? "League";
    groupsMap.set(label, [...(groupsMap.get(label) ?? []), p.id]);
  }
  const idToName = new Map(
    participants.map((p) => [p.id, `${p.firstName} ${p.lastName}`])
  );
  const idToGroup = new Map(
    participants.map((p) => [p.id, p.groupLabel])
  );

  const result = [];
  for (const ids of groupsMap.values()) {
    const rows = computeStandings(ids, completed);
    for (const row of rows) {
      result.push({
        participantId: row.participantId,
        name: idToName.get(row.participantId) ?? "Unknown",
        groupLabel: idToGroup.get(row.participantId) ?? null,
        played: row.played,
        won: row.won,
        drawn: row.drawn,
        lost: row.lost,
        scored: row.scored,
        conceded: row.conceded,
        points: row.points,
      });
    }
  }

  // overall sort (points, diff) for display
  return result.sort(
    (a, b) =>
      (a.groupLabel ?? "").localeCompare(b.groupLabel ?? "") ||
      b.points - a.points ||
      b.scored - b.conceded - (a.scored - a.conceded)
  );
}

export async function listMatchSchedule({ limit = 200 } = {}) {
  const rows = await db
    .select({
      id: sportMatches.id,
      tournamentId: sportMatches.tournamentId,
      tournamentName: sportTournaments.name,
      tournamentFormat: sportTournaments.format,
      stage: sportMatches.stage,
      groupLabel: sportMatches.groupLabel,
      round: sportMatches.round,
      matchIndex: sportMatches.matchIndex,
      status: sportMatches.status,
      scoreA: sportMatches.scoreA,
      scoreB: sportMatches.scoreB,
      scheduledAt: sportMatches.scheduledAt,
      venue: sportMatches.venue,
      nameA: sql<string | null>`(
        select s.first_name || ' ' || s.last_name
        from ${tournamentParticipants} tp
        join ${students} s on s.id = tp.student_id
        where tp.id = ${sportMatches.participantAId}
      )`,
      nameB: sql<string | null>`(
        select s.first_name || ' ' || s.last_name
        from ${tournamentParticipants} tp
        join ${students} s on s.id = tp.student_id
        where tp.id = ${sportMatches.participantBId}
      )`,
    })
    .from(sportMatches)
    .innerJoin(
      sportTournaments,
      eq(sportMatches.tournamentId, sportTournaments.id)
    )
    .orderBy(desc(sql`${sportMatches.scheduledAt} is null`), asc(sportMatches.scheduledAt), asc(sportMatches.round))
    .limit(limit);
  return rows;
}

// ---------------------------------------------------------------------------
// Announcements
// ---------------------------------------------------------------------------

export async function listSportAnnouncementsForAdmin({ limit = 100 } = {}) {
  return db
    .select({
      id: sportAnnouncements.id,
      title: sportAnnouncements.title,
      body: sportAnnouncements.body,
      eventId: sportAnnouncements.eventId,
      eventTitle: sportEvents.title,
      recipientCount: sportAnnouncements.recipientCount,
      failedCount: sportAnnouncements.failedCount,
      sentAt: sportAnnouncements.sentAt,
    })
    .from(sportAnnouncements)
    .leftJoin(sportEvents, eq(sportAnnouncements.eventId, sportEvents.id))
    .orderBy(desc(sportAnnouncements.sentAt))
    .limit(limit);
}

export function createSportAnnouncement(values: {
  title: string;
  body: string;
  eventId: string | null;
  recipientCount: number;
  failedCount: number;
  createdBy: string;
}) {
  return db.insert(sportAnnouncements).values(values).returning();
}

export async function listAnnouncementRecipients(eventId: string | null) {
  if (eventId) {
    return db
      .select({ id: students.id, firstName: students.firstName, lastName: students.lastName, email: students.email })
      .from(sportParticipations)
      .innerJoin(students, eq(sportParticipations.studentId, students.id))
      .where(
        and(
          eq(sportParticipations.eventId, eventId),
          eq(sportParticipations.status, "confirmed")
        )
      );
  }
  return db
    .select({ id: students.id, firstName: students.firstName, lastName: students.lastName, email: students.email })
    .from(students);
}

// ---------------------------------------------------------------------------
// Student-facing queries
// ---------------------------------------------------------------------------

export async function listStudentSportEvents(
  studentId: string,
  { limit = 50 } = {}
) {
  const now = new Date();
  return db
    .select({
      id: sportEvents.id,
      title: sportEvents.title,
      sport: sportEvents.sport,
      description: sportEvents.description,
      venue: sportEvents.venue,
      startsAt: sportEvents.startsAt,
      endsAt: sportEvents.endsAt,
      imageUrl: sportEvents.imageUrl,
      myStatus: sql<string | null>`(
        select p.status from ${sportParticipations} p
        where p.event_id = ${sportEvents.id} and p.student_id = ${studentId}
        limit 1
      )`,
    })
    .from(sportEvents)
    .where(
      and(
        eq(sportEvents.published, true),
        sql`coalesce(${sportEvents.endsAt}, ${sportEvents.startsAt}) >= ${now.toISOString()}`
      )
    )
    .orderBy(desc(sportEvents.startsAt))
    .limit(limit);
}

export function listPublicTournaments() {
  return db
    .select({
      id: sportTournaments.id,
      name: sportTournaments.name,
      sport: sportTournaments.sport,
      format: sportTournaments.format,
      status: sportTournaments.status,
      championName: sportTournaments.championName,
      eventTitle: sportEvents.title,
      participantCount: sql<number>`(
        select count(*)::int from ${tournamentParticipants} p
        where p.tournament_id = ${sportTournaments.id}
      )`,
    })
    .from(sportTournaments)
    .leftJoin(sportEvents, eq(sportTournaments.eventId, sportEvents.id))
    .orderBy(desc(sportTournaments.createdAt))
    .limit(50);
}

export function listPublicSportAnnouncements({ limit = 20 } = {}) {
  return db
    .select({
      id: sportAnnouncements.id,
      title: sportAnnouncements.title,
      body: sportAnnouncements.body,
      sentAt: sportAnnouncements.sentAt,
      eventTitle: sportEvents.title,
    })
    .from(sportAnnouncements)
    .leftJoin(sportEvents, eq(sportAnnouncements.eventId, sportEvents.id))
    .where(eq(sportAnnouncements.published, true))
    .orderBy(desc(sportAnnouncements.sentAt))
    .limit(limit);
}
