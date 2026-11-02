"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Crown, Trophy, X } from "lucide-react";
import { UserAvatar } from "@/components/UserAvatar";
import type { WeeklyLeaderboardRow } from "@/db/gameQueries";

function todayKey() {
  const d = new Date();
  return `knutsford-leaderboard-dismissed-${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function Rows({ rows }: { rows: WeeklyLeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="px-4 py-6 text-center text-sm text-neutral-400 dark:text-neutral-500">
        No games played yet this week — be the first!
      </p>
    );
  }

  const [leader, ...rest] = rows;

  return (
    <div>
      <div className="flex items-center gap-3 rounded-xl bg-gold/10 p-3">
        <div className="relative">
          <UserAvatar
            name={`${leader.firstName} ${leader.lastName}`}
            avatarUrl={leader.avatarUrl}
            size="lg"
          />
          <Crown className="absolute -top-2 -right-1.5 h-5 w-5 rotate-12 text-gold-dark" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wide text-gold-dark dark:text-gold-light">
            Face of the Week
          </p>
          <p className="truncate text-sm font-extrabold text-ink dark:text-neutral-100">
            {leader.firstName} {leader.lastName}
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">{leader.total} pts this week</p>
        </div>
      </div>

      {rest.length > 0 && (
        <ul className="mt-2 divide-y divide-black/5 dark:divide-white/10">
          {rest.map((row, i) => (
            <li key={row.studentId} className="flex items-center gap-2.5 py-2">
              <span className="w-4 shrink-0 text-xs font-bold text-neutral-400 dark:text-neutral-500">
                {i + 2}
              </span>
              <UserAvatar name={`${row.firstName} ${row.lastName}`} avatarUrl={row.avatarUrl} size="sm" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink dark:text-neutral-100">
                {row.firstName} {row.lastName}
              </span>
              <span className="shrink-0 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                {row.total}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function WeeklyLeaderboardCard({
  rows,
  variant,
}: {
  rows: WeeklyLeaderboardRow[];
  variant: "floating" | "inline";
}) {
  const [dismissed, setDismissed] = useState(variant === "floating");
  const [hydrated, setHydrated] = useState(variant !== "floating");

  useEffect(() => {
    if (variant !== "floating") return;
    const wasDismissed = window.localStorage.getItem(todayKey()) === "1";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reading a per-day dismissal flag from localStorage, unavailable during SSR
    setDismissed(wasDismissed);
    setHydrated(true);
  }, [variant]);

  function dismiss() {
    setDismissed(true);
    try {
      window.localStorage.setItem(todayKey(), "1");
    } catch {
      // ignore — card will just reappear next load
    }
  }

  if (variant === "inline") {
    return (
      <div className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <div className="mb-3 flex items-center gap-2">
          <Trophy className="h-4 w-4 text-gold-dark dark:text-gold-light" />
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            This week&apos;s leaderboard
          </h2>
        </div>
        <Rows rows={rows} />
        <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
          Resets every Monday.{" "}
          <Link href="/login" className="font-semibold text-gold-dark hover:underline dark:text-gold-light">
            Log in
          </Link>{" "}
          to play and climb the board.
        </p>
      </div>
    );
  }

  if (!hydrated || dismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 w-72 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/10 dark:bg-neutral-900 dark:ring-white/10 sm:w-80">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-gold-dark dark:text-gold-light" />
          <h2 className="text-xs font-bold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            This week&apos;s leaderboard
          </h2>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="rounded-full p-1 text-neutral-400 hover:bg-black/5 hover:text-neutral-600 dark:hover:bg-white/10 dark:hover:text-neutral-200"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Rows rows={rows} />
      <Link
        href="/games"
        className="mt-3 block text-center text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
      >
        See the full leaderboard
      </Link>
    </div>
  );
}
