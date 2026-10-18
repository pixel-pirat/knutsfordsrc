import Image from "next/image";
import { listPublishedNews } from "@/db/queries";

function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function DashboardNewsPage() {
  const news = await listPublishedNews();
  const [featured, ...rest] = news;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          News
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Announcements and updates from the SRC
        </p>
      </div>

      {news.length === 0 ? (
        <div className="rounded-2xl bg-white dark:bg-neutral-900 p-10 text-center ring-1 ring-black/5 dark:ring-white/10">
          <p className="text-sm text-neutral-400 dark:text-neutral-500">
            No news posted yet — check back soon.
          </p>
        </div>
      ) : (
        <div>
          {featured && (
            <div className="mb-8 grid gap-0 overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10 lg:grid-cols-2">
              <div className="relative aspect-[16/10] lg:aspect-auto">
                {featured.imageUrl ? (
                  <Image src={featured.imageUrl} alt={featured.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full min-h-48 items-center justify-center bg-gold/10" />
                )}
              </div>
              <div className="flex flex-col justify-center p-6 lg:p-8">
                <span className="text-xs font-bold uppercase tracking-wide text-gold-dark dark:text-gold-light">
                  Latest
                </span>
                <h2 className="mt-2 text-xl font-extrabold leading-tight text-ink dark:text-neutral-100 sm:text-2xl">
                  {featured.title}
                </h2>
                {featured.excerpt && (
                  <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                    {featured.excerpt}
                  </p>
                )}
                <p className="mt-4 text-xs text-neutral-400 dark:text-neutral-500">
                  {formatDate(featured.publishedAt)}
                </p>
              </div>
            </div>
          )}

          {rest.length > 0 && (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((post) => (
                <div
                  key={post.id}
                  className="flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-neutral-900 ring-1 ring-black/5 dark:ring-white/10"
                >
                  <div className="relative aspect-[4/3]">
                    {post.imageUrl ? (
                      <Image src={post.imageUrl} alt={post.title} fill className="object-cover" />
                    ) : (
                      <div className="h-full w-full bg-gold/10" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-sm font-semibold leading-snug text-ink dark:text-neutral-100">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="mt-2 line-clamp-2 text-xs text-neutral-500 dark:text-neutral-400">
                        {post.excerpt}
                      </p>
                    )}
                    <p className="mt-3 text-xs text-neutral-400 dark:text-neutral-500">
                      {formatDate(post.publishedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
