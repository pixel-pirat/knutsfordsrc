import Link from "next/link";
import { Trophy } from "lucide-react";
import { getCurrentStudent } from "@/db/queries";
import { GAME_LABELS, getStudentBestScores } from "@/db/gameQueries";

export const dynamic = "force-dynamic";

const GAMES = [
  {
    key: "draughts" as const,
    href: "/dashboard/games/draughts",
    description: "Classic checkers vs. the computer. Captures are mandatory.",
    emoji: "⚫",
  },
  {
    key: "breakout" as const,
    href: "/dashboard/games/breakout",
    description: "Paddle, ball, bricks — clear the board without losing all your lives.",
    emoji: "🧱",
  },
  {
    key: "snake" as const,
    href: "/dashboard/games/snake",
    description: "Grow as long as you can without hitting the walls or yourself.",
    emoji: "🐍",
  },
  {
    key: "2048" as const,
    href: "/dashboard/games/2048",
    description: "Slide and merge tiles to reach 2048 and beyond.",
    emoji: "🔢",
  },
];

export default async function DashboardGamesPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const bests = await getStudentBestScores(student.id);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Games
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            A few retro classics to take a break with — your best scores are saved.
          </p>
        </div>
        <Link
          href="/dashboard/games/leaderboard"
          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 px-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
        >
          <Trophy className="h-4 w-4" />
          Leaderboard
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {GAMES.map((game) => (
          <Link
            key={game.key}
            href={game.href}
            className="group rounded-2xl bg-white p-6 ring-1 ring-black/5 transition-shadow hover:shadow-md dark:bg-neutral-900 dark:ring-white/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-2xl">
              {game.emoji}
            </div>
            <h3 className="mt-4 text-base font-semibold text-ink dark:text-neutral-100">
              {GAME_LABELS[game.key]}
            </h3>
            <p className="mt-1.5 text-sm leading-6 text-neutral-500 dark:text-neutral-400">
              {game.description}
            </p>
            {game.key !== "draughts" && (
              <p className="mt-3 text-xs font-semibold text-gold-dark dark:text-gold-light">
                Your best: {bests[game.key]}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
