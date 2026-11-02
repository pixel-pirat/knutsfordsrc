import { getCurrentAdmin } from "@/db/adminQueries";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { Pagination } from "@/components/admin/Pagination";
import { PAGE_SIZE, parsePage } from "@/lib/pagination";
import {
  GAME_KEYS,
  GAME_LABELS,
  countGamePlayers,
  getStudentBestScores,
  listGamePlayers,
} from "@/db/gameQueries";

export const dynamic = "force-dynamic";

function formatDate(value: Date) {
  return new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function GamesUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || admin.role !== "super_admin") {
    return <AccessRestricted />;
  }

  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const page = parsePage(params.page);

  const [players, total] = await Promise.all([
    listGamePlayers({ q, limit: PAGE_SIZE, offset: (page - 1) * PAGE_SIZE }),
    countGamePlayers({ q }),
  ]);

  const bestsByStudent = new Map(
    await Promise.all(
      players.map(
        async (p) => [p.studentId, await getStudentBestScores(p.studentId)] as const
      )
    )
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Game Activity
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Students who have played the arcade games, and their best scores.
        </p>
      </div>

      <form
        method="get"
        className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
      >
        <input
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search name or index number"
          className="h-9 min-w-56 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-neutral-400 focus:border-gold dark:border-white/10 dark:text-neutral-100"
        />
        <button
          type="submit"
          className="h-9 rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          Search
        </button>
      </form>

      <div className="rounded-2xl bg-white ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-black/5 text-left text-xs font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                <th className="px-5 py-3.5">Student</th>
                {GAME_KEYS.map((key) => (
                  <th key={key} className="px-4 py-3.5 text-center">
                    {GAME_LABELS[key]}
                  </th>
                ))}
                <th className="px-5 py-3.5 text-center">Plays</th>
                <th className="px-5 py-3.5">Last played</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/10">
              {players.length === 0 && (
                <tr>
                  <td
                    colSpan={GAME_KEYS.length + 3}
                    className="px-5 py-10 text-center text-neutral-400 dark:text-neutral-500"
                  >
                    No students have played yet.
                  </td>
                </tr>
              )}
              {players.map((p) => {
                const bests = bestsByStudent.get(p.studentId);
                return (
                  <tr key={p.studentId}>
                    <td className="px-5 py-3.5 font-medium text-ink dark:text-neutral-100">
                      {p.firstName} {p.lastName}
                      <span className="ml-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                        {p.indexNumber}
                      </span>
                    </td>
                    {GAME_KEYS.map((key) => (
                      <td
                        key={key}
                        className="px-4 py-3.5 text-center text-neutral-600 dark:text-neutral-300"
                      >
                        {bests?.[key] ?? 0}
                      </td>
                    ))}
                    <td className="px-5 py-3.5 text-center font-semibold text-ink dark:text-neutral-100">
                      {p.totalPlays}
                    </td>
                    <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                      {formatDate(p.lastPlayedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        basePath="/admin/games/users"
        searchParams={{ q }}
      />
    </div>
  );
}
