import Image from "next/image";
import Link from "next/link";
import { listUpcomingEvents } from "@/db/queries";
import { marketProducts } from "@/data/site";
import { StarIcon } from "./icons";

function formatDay(date: Date) {
  return {
    day: date.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: date.toLocaleDateString("en-GB", { month: "short" }).toUpperCase(),
  };
}

function formatTime(date: Date) {
  return date
    .toLocaleTimeString("en-GB", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .replace(" ", "")
    .toLowerCase();
}

function formatTimeRange(startsAt: Date, endsAt: Date | null) {
  const start = formatTime(startsAt);
  return endsAt ? `${start} - ${formatTime(endsAt)}` : start;
}

export async function EventsMarket() {
  const events = await listUpcomingEvents({ limit: 3 });
  const featuredProducts = marketProducts.slice(0, 3);

  return (
    <section className="bg-white dark:bg-neutral-900">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-5 lg:px-8 lg:py-24">
        <div className="min-w-0 rounded-2xl bg-neutral-50 dark:bg-neutral-900 p-6 ring-1 ring-black/5 dark:ring-white/10 lg:col-span-2 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-ink dark:text-neutral-100 sm:text-xl">
              UPCOMING EVENTS
            </h2>
          </div>

          {events.length === 0 ? (
            <p className="py-8 text-sm text-neutral-400 dark:text-neutral-500">
              No upcoming events right now — check back soon.
            </p>
          ) : (
            <ul className="divide-y divide-black/5 dark:divide-white/10">
              {events.map((event) => {
                const { day, month } = formatDay(event.startsAt);
                return (
                  <li
                    key={event.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    {event.imageUrl ? (
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                        <Image
                          src={event.imageUrl}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-gold/15 text-gold-dark dark:text-gold-light">
                        <svg
                          viewBox="0 0 24 24"
                          className="h-7 w-7"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                        >
                          <path
                            d="M7 2v3M17 2v3M3.5 8.5h17M5 5h14a1.5 1.5 0 011.5 1.5V19A1.5 1.5 0 0119 20.5H5A1.5 1.5 0 013.5 19V6.5A1.5 1.5 0 015 5z"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 text-ink dark:text-neutral-100">
                      <span className="text-xl font-extrabold leading-none">
                        {day}
                      </span>
                      <span className="mt-1 text-[10px] font-semibold tracking-wide text-neutral-500 dark:text-neutral-400">
                        {month}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-ink dark:text-neutral-100 sm:text-base">
                        {event.title}
                      </h3>
                      {event.location && (
                        <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                          {event.location}
                        </p>
                      )}
                      <p className="truncate text-xs text-neutral-400 dark:text-neutral-500 sm:text-sm">
                        {formatTimeRange(event.startsAt, event.endsAt)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="min-w-0 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-ink dark:text-neutral-100 sm:text-xl">
              TRENDING IN THE MARKETPLACE
            </h2>
            <Link
              href="/market"
              className="text-sm font-semibold text-gold-dark dark:text-gold-light hover:underline"
            >
              view all
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
            {featuredProducts.map((product, i) => (
              <div key={product.name + i}>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-200 ring-1 ring-black/5 dark:ring-white/10">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink dark:text-neutral-100 sm:text-base">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-ink dark:text-neutral-100">{product.price}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                  <StarIcon className="h-3.5 w-3.5 text-gold" />
                  <span>{product.rating}</span>
                  <span>({product.reviews})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
