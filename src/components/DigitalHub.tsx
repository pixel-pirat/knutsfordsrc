import Link from "next/link";
import { hubFeatures } from "@/data/site";
import { HubIcon } from "./icons";

export function DigitalHub() {
  return (
    <section id="hub" className="bg-cream dark:bg-neutral-950">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        <div>
          <span className="text-sm font-bold tracking-wide text-gold-dark dark:text-gold-light">
            STUDENT DIGITAL HUB
          </span>
          <h2 className="mt-3 text-3xl font-extrabold leading-tight text-ink dark:text-neutral-100 sm:text-4xl lg:text-[2.75rem]">
            EVERYTHING YOU NEED IN ONE PLACE
          </h2>
          <p className="mt-5 max-w-md text-base leading-7 text-neutral-700 dark:text-neutral-300">
            From academics to entrepreneurship, from campus life to career
            growth &mdash; we&rsquo;ve got you covered.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-block rounded-md bg-ink px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-gold dark:text-ink dark:hover:bg-gold-dark"
          >
            Login
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:gap-5">
          {hubFeatures.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl bg-white dark:bg-neutral-900 p-5 shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all hover:-translate-y-1 hover:shadow-md sm:p-6"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold-dark dark:text-gold-light transition-colors group-hover:bg-gold group-hover:text-ink">
                <HubIcon name={feature.icon} className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-sm font-semibold text-ink dark:text-neutral-100 sm:text-base">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-xs leading-5 text-neutral-500 dark:text-neutral-400 sm:text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
