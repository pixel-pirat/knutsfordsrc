import Image from "next/image";
import Link from "next/link";
import { getCurrentStudent } from "@/db/queries";
import {
  listPublicSportAnnouncements,
  listPublicTournaments,
  listStudentSportEvents,
} from "@/db/sportsQueries";
import { SportRegisterButton } from "./SportRegisterButton";

function formatDateTime(value: Date) {
  return new Date(value).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function SportsPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const [events, tournaments, announcements] = await Promise.all([
    listStudentSportEvents(student.id),
    listPublicTournaments(),
    listPublicSportAnnouncements(),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Sports
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Internal sports activities — register, get confirmed and follow tournaments
        </p>
      </div>

      {/* Events */}
      <div className="mb-6 rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          Sport events
        </h2>
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No upcoming sports events right now.
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
              >
                {event.imageUrl ? (
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                    <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
                  </div>
                ) : (
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-dark dark:text-gold-light">
                    <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
                      <circle cx="12" cy="12" r="8.5" />
                      <path d="M12 3.5l3 2.3-1.2 3.6h-3.6L9 5.8l3-2.3zM8 13.8l-2.8 1.2M16 13.8l2.8 1.2M9.5 21.3L12 18l2.5 3.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-ink dark:text-neutral-100 sm:text-base">
                    {event.title}
                  </h3>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500 sm:text-sm">
                    {event.sport}
                    {event.venue ? ` · ${event.venue}` : ""} · {formatDateTime(event.startsAt)}
                  </p>
                  {event.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                      {event.description}
                    </p>
                  )}
                </div>
                <SportRegisterButton
                  eventId={event.id}
                  status={event.myStatus}
                  confirmed={Boolean(student && event.myStatus === "confirmed")}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Tournaments */}
      <div className="mb-6 rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
        <h2 className="border-b border-black/5 px-6 py-4 text-sm font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
          Tournaments
        </h2>
        {tournaments.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No tournaments yet.
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {tournaments.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center gap-2 px-6 py-4"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/dashboard/sports/tournaments/${t.id}`}
                    className="text-sm font-semibold text-ink hover:text-gold-dark hover:underline dark:text-neutral-100 dark:hover:text-gold-light"
                  >
                    {t.name}
                  </Link>
                  <p className="text-xs text-neutral-400 dark:text-neutral-500">
                    {t.sport ?? "General"}
                    {t.eventTitle ? ` · ${t.eventTitle}` : ""} ·{" "}
                    {t.format === "single_elimination"
                      ? "Knockout"
                      : t.format === "round_robin"
                        ? "League"
                        : "Groups + knockout"}{" "}
                    · {t.participantCount} participants
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                    {t.status.replace("_", " ")}
                  </p>
                  {t.championName && (
                    <p className="text-xs font-bold text-gold-dark dark:text-gold-light">
                      🏆 {t.championName}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Updates */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          Sports updates
        </h2>
        {announcements.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No sports updates yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {announcements.map((a) => (
              <li
                key={a.id}
                className="rounded-xl bg-neutral-50 px-4 py-3.5 dark:bg-neutral-800/60"
              >
                <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                  {a.title}
                </p>
                <p className="mt-1 text-sm whitespace-pre-line text-neutral-600 dark:text-neutral-300">
                  {a.body}
                </p>
                <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                  {a.eventTitle ? `${a.eventTitle} · ` : ""}
                  {formatDateTime(a.sentAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
