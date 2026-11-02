import { and, desc, eq, gte, ilike, or, sql, type SQL } from "drizzle-orm";
import { db } from "./index";
import { gameScores, students } from "./schema";

export const GAME_KEYS = ["draughts", "breakout", "snake", "2048", "typing", "piano"] as const;
export type GameKey = (typeof GAME_KEYS)[number];

export const GAME_LABELS: Record<GameKey, string> = {
  draughts: "Draughts",
  breakout: "Breakout",
  snake: "Snake",
  "2048": "2048",
  typing: "Typing Speed",
  piano: "Piano Tiles",
};

const SCORE_CEILINGS: Record<GameKey, number> = {
  draughts: 200,
  breakout: 999_999,
  snake: 99_999,
  "2048": 999_999,
  typing: 400,
  piano: 99_999,
};

export function clampScore(game: GameKey, score: number) {
  return Math.max(0, Math.min(Math.round(score), SCORE_CEILINGS[game]));
}

export function recordGameScore(studentId: string, game: GameKey, score: number) {
  return db
    .insert(gameScores)
    .values({ studentId, game, score: clampScore(game, score) })
    .returning();
}

/** Each student's personal best for a single game. */
export async function getStudentBestScore(studentId: string, game: GameKey) {
  const [row] = await db
    .select({ best: sql<number>`coalesce(max(${gameScores.score}), 0)::int` })
    .from(gameScores)
    .where(and(eq(gameScores.studentId, studentId), eq(gameScores.game, game)));
  return row?.best ?? 0;
}

/** Personal bests across every game, for the games hub. */
export async function getStudentBestScores(studentId: string) {
  const rows = await db
    .select({
      game: gameScores.game,
      best: sql<number>`max(${gameScores.score})::int`,
    })
    .from(gameScores)
    .where(eq(gameScores.studentId, studentId))
    .groupBy(gameScores.game);

  const result: Record<GameKey, number> = Object.fromEntries(
    GAME_KEYS.map((key) => [key, 0])
  ) as Record<GameKey, number>;
  for (const row of rows) {
    result[row.game as GameKey] = row.best;
  }
  return result;
}

/** Top personal-best scores for one game (one row per student, their best only). */
export async function getTopScoresForGame(game: GameKey, limit = 20) {
  return db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      indexNumber: students.indexNumber,
      best: sql<number>`max(${gameScores.score})::int`,
    })
    .from(gameScores)
    .innerJoin(students, eq(gameScores.studentId, students.id))
    .where(eq(gameScores.game, game))
    .groupBy(students.id, students.firstName, students.lastName, students.indexNumber)
    .orderBy(desc(sql`max(${gameScores.score})`))
    .limit(limit);
}

/**
 * Combined leaderboard: sum of each student's personal best across every
 * game (0 counted for games they haven't played), ranked descending.
 */
export async function getOverallGameLeaderboard(limit = 20) {
  const rows = await db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      indexNumber: students.indexNumber,
      game: gameScores.game,
      best: sql<number>`max(${gameScores.score})::int`,
    })
    .from(gameScores)
    .innerJoin(students, eq(gameScores.studentId, students.id))
    .groupBy(students.id, students.firstName, students.lastName, students.indexNumber, gameScores.game);

  const byStudent = new Map<
    string,
    { firstName: string; lastName: string; indexNumber: string; total: number; gamesPlayed: number }
  >();
  for (const row of rows) {
    const entry =
      byStudent.get(row.studentId) ??
      { firstName: row.firstName, lastName: row.lastName, indexNumber: row.indexNumber, total: 0, gamesPlayed: 0 };
    entry.total += row.best;
    entry.gamesPlayed += 1;
    byStudent.set(row.studentId, entry);
  }

  return [...byStudent.entries()]
    .map(([studentId, entry]) => ({ studentId, ...entry }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Admin: player activity
// ---------------------------------------------------------------------------

function playerActivityWhere(q?: string): SQL | undefined {
  if (!q) return undefined;
  const term = `%${q}%`;
  return or(
    ilike(students.firstName, term),
    ilike(students.lastName, term),
    ilike(students.indexNumber, term)
  );
}

export async function listGamePlayers({
  q,
  limit = 20,
  offset = 0,
}: { q?: string; limit?: number; offset?: number } = {}) {
  return db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      indexNumber: students.indexNumber,
      totalPlays: sql<number>`count(${gameScores.id})::int`,
      lastPlayedAt: sql<Date>`max(${gameScores.createdAt})`,
    })
    .from(gameScores)
    .innerJoin(students, eq(gameScores.studentId, students.id))
    .where(playerActivityWhere(q))
    .groupBy(students.id, students.firstName, students.lastName, students.indexNumber)
    .orderBy(desc(sql`max(${gameScores.createdAt})`))
    .limit(limit)
    .offset(offset);
}

export async function countGamePlayers({ q }: { q?: string } = {}) {
  const [row] = await db
    .select({ count: sql<number>`count(distinct ${gameScores.studentId})::int` })
    .from(gameScores)
    .innerJoin(students, eq(gameScores.studentId, students.id))
    .where(playerActivityWhere(q));
  return row?.count ?? 0;
}

// ---------------------------------------------------------------------------
// Weekly leaderboard / Face of the Week
// ---------------------------------------------------------------------------

/** Midnight at the start of the current (Monday–Sunday) week, in UTC. */
export function startOfWeek(date: Date = new Date()): Date {
  const d = new Date(date);
  const day = d.getUTCDay();
  const diffToMonday = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diffToMonday);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export type WeeklyLeaderboardRow = {
  studentId: string;
  firstName: string;
  lastName: string;
  indexNumber: string;
  avatarUrl: string | null;
  total: number;
};

/**
 * This week's leaderboard: each student's total score is the sum of their
 * personal-best score per game, counting only scores set since Monday.
 */
export async function getWeeklyLeaderboard(limit = 10): Promise<WeeklyLeaderboardRow[]> {
  const since = startOfWeek();
  const rows = await db
    .select({
      studentId: students.id,
      firstName: students.firstName,
      lastName: students.lastName,
      indexNumber: students.indexNumber,
      avatarUrl: students.avatarUrl,
      game: gameScores.game,
      best: sql<number>`max(${gameScores.score})::int`,
    })
    .from(gameScores)
    .innerJoin(students, eq(gameScores.studentId, students.id))
    .where(gte(gameScores.createdAt, since))
    .groupBy(
      students.id,
      students.firstName,
      students.lastName,
      students.indexNumber,
      students.avatarUrl,
      gameScores.game
    );

  const byStudent = new Map<
    string,
    { firstName: string; lastName: string; indexNumber: string; avatarUrl: string | null; total: number }
  >();
  for (const row of rows) {
    const entry =
      byStudent.get(row.studentId) ??
      {
        firstName: row.firstName,
        lastName: row.lastName,
        indexNumber: row.indexNumber,
        avatarUrl: row.avatarUrl,
        total: 0,
      };
    entry.total += row.best;
    byStudent.set(row.studentId, entry);
  }

  return [...byStudent.entries()]
    .map(([studentId, entry]) => ({ studentId, ...entry }))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}
