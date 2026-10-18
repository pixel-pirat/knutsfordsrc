import Image from "next/image";
import { listUpcomingEvents } from "@/db/queries";

function formatDay(date: Date) {
  return {
    day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
  };
}

function formatTimeRange(startsAt: Date, endsAt: Date | null) {
  const opts: Intl.DateTimeFormatOptions = { hour: "numeric", minute: "2-digit" };
  const start = startsAt.toLocaleTimeString("en-GB", opts);
  if (!endsAt) return start;
  return `${start} - ${endsAt.toLocaleTimeString("en-GB", opts)}`;
}

export default async function DashboardEventsPage() {
  const events = await listUpcomingEvents();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Events
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Everything happening on campus
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
        {events.length === 0 ? (
          <p className="py-10 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No upcoming events right now — check back soon.
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {events.map((event) => {
              const { day, month } = formatDay(event.startsAt);
              return (
                <li
                  key={event.id}
                  className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                >
                  {event.imageUrl ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                      <Image src={event.imageUrl} alt={event.title} fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-dark dark:text-gold-light">
                      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path d="M7 2v3M17 2v3M3.5 8.5h17M5 5h14a1.5 1.5 0 011.5 1.5V19A1.5 1.5 0 0119 20.5H5A1.5 1.5 0 013.5 19V6.5A1.5 1.5 0 015 5z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 text-ink dark:text-neutral-100">
                    <span className="text-xl font-extrabold leading-none">{day}</span>
                    <span className="mt-1 text-[10px] font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">
                      {month}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-ink dark:text-neutral-100 sm:text-base">
                      {event.title}
                    </h3>
                    {event.location && (
                      <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                        {event.location}
                      </p>
                    )}
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 sm:text-sm">
                      {formatTimeRange(event.startsAt, event.endsAt)}
                    </p>
                    {event.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                        {event.description}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
