import Link from "next/link";
import { getCurrentAdmin } from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import {
  GAME_KEYS,
  GAME_LABELS,
  getOverallGameLeaderboard,
  getTopScoresForGame,
  type GameKey,
} from "@/db/gameQueries";

export const dynamic = "force-dynamic";

const TABS = [{ key: "overall" as const, label: "Overall" }, ...GAME_KEYS.map((key) => ({ key, label: GAME_LABELS[key] }))];

export default async function GamesLeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  const { tab } = await searchParams;
  const activeTab = TABS.some((t) => t.key === tab) ? (tab as (typeof TABS)[number]["key"]) : "overall";

  const rows =
    activeTab === "overall"
      ? await getOverallGameLeaderboard(50)
      : await getTopScoresForGame(activeTab as GameKey, 50);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Games Leaderboard
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Top scores across every student who has played the arcade games.
        </p>
      </div>

      <nav className="mb-5 flex gap-1.5 overflow-x-auto rounded-xl bg-white p-1.5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={`/admin/games/leaderboard?tab=${t.key}`}
            className={`whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              activeTab === t.key
                ? "bg-ink text-white dark:bg-gold dark:text-ink"
                : "text-neutral-500 hover:bg-black/[0.04] hover:text-ink dark:text-neutral-400 dark:hover:bg-white/[0.06] dark:hover:text-neutral-100"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </nav>

      <div className="rounded-2xl bg-white ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
              <th className="px-5 py-3.5 w-12">#</th>
              <th className="px-5 py-3.5">Student</th>
              <th className="px-5 py-3.5 text-right">
                {activeTab === "overall" ? "Total score" : "Best score"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-neutral-400 dark:text-neutral-500">
                  No scores recorded yet.
                </td>
              </tr>
            )}
            {rows.map((row, index) => (
              <tr key={row.studentId}>
                <td className="px-5 py-3.5 font-bold text-neutral-400 dark:text-neutral-500">
                  {index + 1}
                </td>
                <td className="px-5 py-3.5 font-medium text-ink dark:text-neutral-100">
                  {row.firstName} {row.lastName}
                  <span className="ml-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                    {row.indexNumber}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-right font-bold text-ink dark:text-neutral-100">
                  {"best" in row ? row.best : row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
