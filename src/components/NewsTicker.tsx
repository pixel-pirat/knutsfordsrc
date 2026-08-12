import { breakingNews } from "@/data/site";

export function NewsTicker() {
  const items = [...breakingNews, ...breakingNews];

  return (
    <div className="flex items-stretch bg-ink">
      <div className="flex shrink-0 items-center gap-2 bg-gold px-5 text-xs font-bold tracking-wide text-ink sm:px-6 sm:text-sm">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
          <path d="M4 4h9l3 3-3 3H4V4zm0 8h2v6H4v-6z" />
        </svg>
        LATEST
      </div>
      <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
        <div className="animate-marquee flex w-max shrink-0 items-center gap-10 py-3.5 pl-8 whitespace-nowrap">
          {items.map((headline, i) => (
            <span
              key={i}
              className="flex items-center gap-10 text-sm text-neutral-200"
            >
              {headline}
              <span className="text-gold">&#9679;</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
