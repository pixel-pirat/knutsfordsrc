import Image from "next/image";
import { upcomingEvents, trendingProducts } from "@/data/site";
import { StarIcon } from "./icons";

export function EventsMarket() {
  return (
    <section id="market" className="bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-5 lg:px-8 lg:py-24">
        <div className="rounded-2xl bg-neutral-50 p-6 ring-1 ring-black/5 lg:col-span-2 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
              UPCOMING EVENTS
            </h2>
            <a
              href="#events"
              className="text-sm font-semibold text-gold-dark hover:underline"
            >
              view all
            </a>
          </div>

          <ul className="divide-y divide-black/5">
            {upcomingEvents.map((event) => (
              <li key={event.title + event.day} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-200">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-xl border border-black/10 bg-white text-ink">
                  <span className="text-xl font-extrabold leading-none">
                    {event.day}
                  </span>
                  <span className="mt-1 text-[10px] font-semibold tracking-wide text-neutral-500">
                    {event.month}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-ink sm:text-base">
                    {event.title}
                  </h3>
                  <p className="mt-0.5 truncate text-xs text-neutral-500 sm:text-sm">
                    {event.location}
                  </p>
                  <p className="truncate text-xs text-neutral-400 sm:text-sm">
                    {event.time}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-ink sm:text-xl">
              TRENDING IN THE MARKETPLACE
            </h2>
            <a
              href="#market"
              className="text-sm font-semibold text-gold-dark hover:underline"
            >
              view all
            </a>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5">
            {trendingProducts.map((product, i) => (
              <div key={product.name + i}>
                <div className="relative aspect-square overflow-hidden rounded-2xl bg-neutral-200 ring-1 ring-black/5">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-ink sm:text-base">
                  {product.name}
                </h3>
                <p className="text-sm font-bold text-ink">{product.price}</p>
                <div className="mt-1 flex items-center gap-1 text-xs text-neutral-500 sm:text-sm">
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
