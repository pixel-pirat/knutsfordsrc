import Image from "next/image";
import Link from "next/link";
import { quickLinks, campusNews } from "@/data/site";

const quickLinkHrefs: Record<string, string> = {
  "Create Account": "/signup",
  "Pay Dues": "/dashboard/dues",
  "Visit the Market": "/market",
  "Tournament of Power": "/games",
};

export function Footer() {
  const preview = campusNews.slice(0, 3);

  return (
    <section className="bg-cream dark:bg-neutral-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-20 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div className="flex min-w-0 flex-col gap-8 rounded-2xl bg-cream-dark/60 p-8 sm:flex-row sm:items-center sm:gap-10">
          <Image
            src="/logo.png"
            alt="Knutsford University crest"
            width={440}
            height={398}
            className="h-36 w-auto shrink-0 sm:h-40"
          />
          <div>
            <h2 className="text-lg font-extrabold tracking-wide text-ink dark:text-neutral-100">
              QUICK LINKS
            </h2>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link}>
                  <Link
                    href={quickLinkHrefs[link] ?? "#"}
                    className="text-sm text-neutral-700 dark:text-neutral-300 transition-colors hover:text-gold-dark sm:text-base"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/about"
              className="mt-6 inline-block rounded-md bg-ink px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-gold dark:text-ink dark:hover:bg-gold-dark"
            >
              Learn More
            </Link>
          </div>
        </div>

        <div className="min-w-0 rounded-2xl bg-white dark:bg-neutral-900 p-6 shadow-sm ring-1 ring-black/5 dark:ring-white/10 sm:p-7">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-extrabold tracking-tight text-ink dark:text-neutral-100 sm:text-xl">
              LATEST CAMPUS NEWS
            </h2>
            <Link
              href="/news"
              className="text-sm font-semibold text-gold-dark dark:text-gold-light hover:underline"
            >
              view all
            </Link>
          </div>

          <div className="space-y-5">
            {preview.map((item) =>
              item.featured ? (
                <Link
                  key={item.title}
                  href="/news"
                  className="flex gap-4 border-b border-black/5 dark:border-white/10 pb-5"
                >
                  <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-neutral-200 sm:h-28 sm:w-32">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold leading-snug text-ink dark:text-neutral-100 sm:text-base">
                      {item.title}
                    </h3>
                    {item.excerpt && (
                      <p className="mt-1.5 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400 sm:text-sm">
                        {item.excerpt}
                      </p>
                    )}
                    <p className="mt-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                      {item.time}
                    </p>
                  </div>
                </Link>
              ) : (
                <Link
                  key={item.title}
                  href="/news"
                  className="flex items-center gap-3"
                >
                  <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                    <h3 className="truncate text-sm font-medium text-ink dark:text-neutral-100 sm:text-base">
                      {item.title}
                    </h3>
                    <span className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
                      {item.time}
                    </span>
                  </div>
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
