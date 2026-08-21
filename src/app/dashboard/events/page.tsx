import Image from "next/image";
import { upcomingEvents } from "@/data/site";

export default function DashboardEventsPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Events
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Everything happening on campus, RSVP in one tap
        </p>
      </div>

      <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
        <ul className="divide-y divide-black/5 dark:divide-white/10">
          {upcomingEvents.map((event) => (
            <li
              key={event.title + event.day}
              className="flex flex-col gap-4 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
            >
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 text-ink dark:text-neutral-100">
                <span className="text-xl font-extrabold leading-none">
                  {event.day}
                </span>
                <span className="mt-1 text-[10px] font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">
                  {event.month}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-semibold text-ink dark:text-neutral-100 sm:text-base">
                  {event.title}
                </h3>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                  {event.location}
                </p>
                <p className="text-xs text-neutral-400 dark:text-neutral-500 sm:text-sm">
                  {event.time}
                </p>
              </div>
              <button
                type="button"
                className="shrink-0 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-gold dark:text-ink dark:hover:bg-gold-dark"
              >
                RSVP
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
