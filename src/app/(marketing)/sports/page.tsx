import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Trophy } from "lucide-react";
import {
  listPublicSportAnnouncements,
  listPublicSportEvents,
  listPublicTournaments,
  listRecentSportResults,
} from "@/db/sportsQueries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Sports | Knutsford University",
  description:
    "Fixtures, results and standings for Knutsford SRC sports events and tournaments.",
};

const TOURNAMENT_STATUS_LABELS: Record<string, string> = {
  draft: "Registration open",
  active: "In progress",
  completed: "Completed",
};

const FORMAT_LABELS: Record<string, string> = {
  single_elimination: "Knockout",
  round_robin: "League",
  group_knockout: "Groups + knockout",
};

function formatDateTime(value: Date) {
  return new Date(value).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function PublicSportsPage() {
  const [events, tournaments, results, announcements] = await Promise.all([
    listPublicSportEvents(),
    listPublicTournaments(),
    listRecentSportResults(),
    listPublicSportAnnouncements(),
  ]);

  return (
    <section className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <div className="mb-8">
          <span className="text-xs font-bold uppercase tracking-wide text-gold-dark dark:text-gold-light">
            SRC Sports
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Fixtures, results &amp; standings
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-neutral-500 dark:text-neutral-400">
            Everything happening across Knutsford&apos;s internal sports events and
            tournaments. Students register and follow live brackets from the{" "}
            <Link href="/login" className="font-semibold text-gold-dark hover:underline dark:text-gold-light">
              student dashboard
            </Link>
            .
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            {/* Latest results */}
            <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
              <h2 className="border-b border-black/5 px-6 py-4 text-sm font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                Latest results
              </h2>
              {results.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  No results yet — check back once matches get underway.
                </p>
              ) : (
                <ul className="divide-y divide-black/5 dark:divide-white/10">
                  {results.map((m) => (
                    <li key={m.id} className="flex flex-wrap items-center gap-3 px-6 py-4">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/sports/tournaments/${m.tournamentId}`}
                          className="text-sm font-semibold text-ink hover:text-gold-dark hover:underline dark:text-neutral-100 dark:hover:text-gold-light"
                        >
                          {m.nameA ?? "TBD"} <span className="text-neutral-400">vs</span> {m.nameB ?? "TBD"}
                        </Link>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          {m.tournamentName}
                          {m.sport ? ` · ${m.sport}` : ""} ·{" "}
                          {m.stage === "group"
                            ? m.groupLabel
                              ? `Group ${m.groupLabel}`
                              : "League"
                            : `Knockout · round ${m.round}`}
                        </p>
                      </div>
                      <span className="shrink-0 rounded bg-neutral-100 px-2.5 py-1 font-mono text-sm font-bold text-ink dark:bg-neutral-800 dark:text-neutral-100">
                        {m.scoreA ?? "–"} : {m.scoreB ?? "–"}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Tournaments */}
            <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
              <h2 className="border-b border-black/5 px-6 py-4 text-sm font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                Tournaments
              </h2>
              {tournaments.length === 0 ? (
                <p className="px-6 py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  No tournaments yet.
                </p>
              ) : (
                <ul className="divide-y divide-black/5 dark:divide-white/10">
                  {tournaments.map((t) => (
                    <li key={t.id} className="flex flex-wrap items-center gap-2 px-6 py-4">
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/sports/tournaments/${t.id}`}
                          className="text-sm font-semibold text-ink hover:text-gold-dark hover:underline dark:text-neutral-100 dark:hover:text-gold-light"
                        >
                          {t.name}
                        </Link>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          {t.sport ?? "General"}
                          {t.eventTitle ? ` · ${t.eventTitle}` : ""} ·{" "}
                          {FORMAT_LABELS[t.format] ?? t.format} · {t.participantCount} participants
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-xs font-semibold uppercase tracking-wide ${
                            t.status === "draft"
                              ? "text-green-600 dark:text-green-400"
                              : "text-neutral-400 dark:text-neutral-500"
                          }`}
                        >
                          {TOURNAMENT_STATUS_LABELS[t.status] ?? t.status}
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
          </div>

          <div className="space-y-8">
            {/* Upcoming events */}
            <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
              <h2 className="border-b border-black/5 px-6 py-4 text-sm font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                Upcoming events
              </h2>
              {events.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  No upcoming sports events right now.
                </p>
              ) : (
                <ul className="divide-y divide-black/5 dark:divide-white/10">
                  {events.map((event) => (
                    <li key={event.id} className="flex gap-3 px-6 py-4">
                      {event.imageUrl ? (
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-200">
                          <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
                        </div>
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gold/15 text-gold-dark dark:text-gold-light">
                          <Trophy className="h-5 w-5" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                          {event.title}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                          <Calendar className="h-3 w-3 shrink-0" />
                          {formatDateTime(event.startsAt)}
                        </p>
                        {event.venue && (
                          <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-400 dark:text-neutral-500">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {event.venue}
                          </p>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Announcements */}
            <div className="rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10">
              <h2 className="border-b border-black/5 px-6 py-4 text-sm font-bold uppercase tracking-wide text-neutral-400 dark:border-white/10 dark:text-neutral-500">
                Updates
              </h2>
              {announcements.length === 0 ? (
                <p className="px-6 py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
                  No sports updates yet.
                </p>
              ) : (
                <ul className="space-y-3 px-5 py-4">
                  {announcements.map((a) => (
                    <li key={a.id} className="rounded-xl bg-neutral-50 px-4 py-3 dark:bg-neutral-800/60">
                      <p className="text-sm font-semibold text-ink dark:text-neutral-100">{a.title}</p>
                      <p className="mt-1 whitespace-pre-line text-sm text-neutral-600 dark:text-neutral-300">
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
        </div>
      </div>
    </section>
  );
}
