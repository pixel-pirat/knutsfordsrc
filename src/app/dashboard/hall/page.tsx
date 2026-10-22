import Image from "next/image";
import Link from "next/link";
import { getCurrentStudent } from "@/db/queries";
import {
  getStudentHall,
  listHallMessagesForStudent,
  listStudentHallEvents,
} from "@/db/hallQueries";
import { HallBookingButton } from "./HallBookingButton";

function formatDateTime(date: Date) {
  return new Date(date).toLocaleString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function MyHallPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  if (!student.hallId) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            My Hall
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Your hall community
          </p>
        </div>
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-10 text-center ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-sm font-semibold text-ink dark:text-neutral-100">
            You haven&apos;t been assigned to a hall yet
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            Once the SRC office assigns you a hall, hall events, announcements
            and updates will appear here. Ask at the SRC office or reach the
            hall warden to get assigned.
          </p>
        </div>
      </div>
    );
  }

  const [hall, events, messages] = await Promise.all([
    getStudentHall(student.hallId),
    listStudentHallEvents(student.id, student.hallId),
    listHallMessagesForStudent(student.hallId),
  ]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          {hall?.name ?? "My Hall"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          {hall?.description ?? "Your hall community"}
        </p>
      </div>

      {hall && (
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Warden
            </p>
            <p className="mt-1 text-base font-bold text-ink dark:text-neutral-100">
              {hall.wardenName ?? "—"}
            </p>
            {hall.location && (
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {hall.location}
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Hall Contact
            </p>
            <p className="mt-1 text-sm font-semibold text-ink dark:text-neutral-100">
              {hall.contactEmail ?? "Ask the SRC office"}
            </p>
            {hall.capacity != null && (
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                Capacity {hall.capacity}
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-white dark:bg-neutral-900 p-5 ring-1 ring-black/5 dark:ring-white/10">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Upcoming Hall Events
            </p>
            <p className="mt-1 text-3xl font-extrabold text-ink dark:text-neutral-100">
              {events.length}
            </p>
          </div>
        </div>
      )}

      {/* Hall events */}
      <div className="mb-6 rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
            Hall events & programs
          </h2>
          <Link
            href="/dashboard/events"
            className="text-xs font-semibold text-gold-dark dark:text-gold-light hover:underline"
          >
            All campus events →
          </Link>
        </div>
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No upcoming hall events right now — check back soon.
          </p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {events.map((event) => {
              const booked =
                event.myBookingStatus === "booked" ||
                event.myBookingStatus === "attended";
              return (
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
                        <path d="M7 2v3M17 2v3M3.5 8.5h17M5 5h14a1.5 1.5 0 011.5 1.5V19A1.5 1.5 0 0119 20.5H5A1.5 1.5 0 013.5 19V6.5A1.5 1.5 0 015 5z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-ink dark:text-neutral-100 sm:text-base">
                      {event.title}
                    </h3>
                    <p className="text-xs text-neutral-400 dark:text-neutral-500 sm:text-sm">
                      {formatDateTime(event.startsAt)}
                      {event.location ? ` · ${event.location}` : ""}
                      {event.hallName ? ` · ${event.hallName}` : ""}
                    </p>
                    {event.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                        {event.description}
                      </p>
                    )}
                  </div>
                  {event.bookingRequired ? (
                    <HallBookingButton
                      eventId={event.id}
                      booked={booked}
                      bookingSummary={
                        event.capacity
                          ? `${event.bookingCount}/${event.capacity} booked`
                          : `${event.bookingCount} booked`
                      }
                    />
                  ) : (
                    <span className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
                      Open to all
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Hall messages */}
      <div className="rounded-2xl bg-white dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
          Hall announcements
        </h2>
        {messages.length === 0 ? (
          <p className="py-8 text-center text-sm text-neutral-400 dark:text-neutral-500">
            No announcements from your hall yet.
          </p>
        ) : (
          <ul className="space-y-4">
            {messages.map((m) => (
              <li
                key={m.id}
                className="rounded-xl bg-neutral-50 px-4 py-3.5 dark:bg-neutral-800/60"
              >
                <p className="text-sm font-semibold text-ink dark:text-neutral-100">
                  {m.subject}
                </p>
                <p className="mt-1 text-sm whitespace-pre-line text-neutral-600 dark:text-neutral-300">
                  {m.body}
                </p>
                <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                  {m.hallName ?? "SRC"} · {formatDateTime(m.sentAt)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
