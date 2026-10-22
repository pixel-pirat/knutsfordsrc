import { getCurrentAdmin } from "@/db/adminQueries";
import { listMatchSchedule } from "@/db/sportsQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import Link from "next/link";

export default async function AdminSportsSchedulePage() {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_sports")) {
    return <AccessRestricted />;
  }

  const schedule = await listMatchSchedule();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Schedule
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          All scheduled tournament fixtures across sports
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
              <th className="px-5 py-3.5 font-bold">Fixture</th>
              <th className="px-5 py-3.5 font-bold">Tournament</th>
              <th className="px-5 py-3.5 font-bold">Stage</th>
              <th className="px-5 py-3.5 font-bold">Kick-off</th>
              <th className="px-5 py-3.5 font-bold">Venue</th>
              <th className="px-5 py-3.5 font-bold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5 dark:divide-white/10">
            {schedule.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-10 text-center text-neutral-400 dark:text-neutral-500"
                >
                  No fixtures scheduled yet — open a tournament and set match times.
                </td>
              </tr>
            )}
            {schedule.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-3.5 font-medium text-ink dark:text-neutral-100">
                  {m.nameA ?? "TBD"} <span className="text-neutral-400">vs</span> {m.nameB ?? "TBD"}
                </td>
                <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                  <Link
                    href={`/admin/sports/tournaments/${m.tournamentId}`}
                    className="hover:text-gold-dark dark:hover:text-gold-light hover:underline"
                  >
                    {m.tournamentName}
                  </Link>
                </td>
                <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                  {m.stage === "group"
                    ? m.groupLabel
                      ? `Group ${m.groupLabel}`
                      : "League"
                    : `Knockout · round ${m.round}`}
                </td>
                <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                  {m.scheduledAt
                    ? new Date(m.scheduledAt).toLocaleString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })
                    : "Not set"}
                </td>
                <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                  {m.venue ?? "—"}
                </td>
                <td className="px-5 py-3.5 text-neutral-500 dark:text-neutral-400">
                  {m.status === "completed"
                    ? `${m.scoreA ?? "–"} : ${m.scoreB ?? "–"}`
                    : "Pending"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
