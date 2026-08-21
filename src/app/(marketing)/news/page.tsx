import type { Metadata } from "next";
import Image from "next/image";
import { PageBanner } from "@/components/PageBanner";
import { campusNews } from "@/data/site";

export const metadata: Metadata = {
  title: "Campus News | Knutsford University",
  description:
    "The latest announcements, stories and updates from across Knutsford University.",
};

export default function NewsPage() {
  const [featured, ...rest] = campusNews;

  return (
    <>
      <PageBanner
        eyebrow="CAMPUS NEWS"
        title="What's Happening at Knutsford"
        description="Announcements, wins and updates from the SRC, faculties and the Digital Hub team."
        image="https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?w=2000&q=80"
        imageAlt="Student working on a laptop"
      />

      <section className="bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          {featured && (
            <a
              href="#"
              className="group mb-12 grid gap-6 overflow-hidden rounded-2xl bg-neutral-50 dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10 lg:grid-cols-2"
            >
              <div className="relative aspect-[16/10] lg:aspect-auto">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-6 lg:p-10">
                <span className="text-xs font-bold uppercase tracking-wide text-gold-dark dark:text-gold-light">
                  Featured
                </span>
                <h2 className="mt-3 text-2xl font-extrabold leading-tight text-ink dark:text-neutral-100 sm:text-3xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-4 text-base leading-7 text-neutral-600 dark:text-neutral-300">
                    {featured.excerpt}
                  </p>
                )}
                <div className="mt-6 flex items-center gap-3">
                  {featured.avatar && (
                    <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                      <Image
                        src={featured.avatar}
                        alt={featured.author ?? ""}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="text-sm">
                    <p className="font-medium text-ink dark:text-neutral-100">{featured.author}</p>
                    <p className="text-neutral-400 dark:text-neutral-500">{featured.time}</p>
                  </div>
                </div>
              </div>
            </a>
          )}

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((item) => (
              <a
                key={item.title}
                href="#"
                className="group flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10 transition-shadow hover:shadow-md"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-semibold leading-snug text-ink dark:text-neutral-100">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="mt-2 line-clamp-2 text-sm text-neutral-500 dark:text-neutral-400">
                      {item.excerpt}
                    </p>
                  )}
                  <div className="mt-4 flex items-center gap-2.5 pt-3">
                    {item.avatar && (
                      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-neutral-200">
                        <Image
                          src={item.avatar}
                          alt={item.author ?? ""}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">
                      {item.author} &middot; {item.time}
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
