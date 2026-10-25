import Link from "next/link";
import {
  DEFAULT_TICKER_SPEED,
  getTickerAnnouncements,
  getTickerSpeed,
} from "@/db/announcementQueries";
import { breakingNews } from "@/data/site";

type TickerItem = { id: string; text: string; linkUrl: string | null };

const defaultItems = (): TickerItem[] =>
  breakingNews.map((text, index) => ({
    id: `default-${index}`,
    text,
    linkUrl: null,
  }));

export async function NewsTicker() {
  let configured = false;
  let rows: Awaited<ReturnType<typeof getTickerAnnouncements>>["items"] = [];
  let speed = DEFAULT_TICKER_SPEED;

  try {
    const [data, savedSpeed] = await Promise.all([
      getTickerAnnouncements(),
      getTickerSpeed(),
    ]);
    configured = data.configured;
    rows = data.items;
    speed = savedSpeed;
  } catch {
    configured = false;
  }

  const items: TickerItem[] = configured
    ? rows.map((row) => ({
        id: row.id,
        text: row.text,
        linkUrl: row.linkUrl,
      }))
    : defaultItems();

  if (items.length === 0) return null;

  const looped = [...items, ...items];

  return (
    <div className="flex items-stretch bg-ink">
      <div className="flex shrink-0 items-center gap-2 bg-gold px-5 text-xs font-bold tracking-wide text-ink sm:px-6 sm:text-sm">
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
          <path d="M4 4h9l3 3-3 3H4V4zm0 8h2v6H4v-6z" />
        </svg>
        LATEST
      </div>
      <div className="relative flex min-w-0 flex-1 items-center overflow-hidden">
        <div
          className="animate-marquee flex w-max shrink-0 items-center gap-10 py-3.5 pl-8 whitespace-nowrap"
          style={{ animationDuration: `${speed}s` }}
        >
          {looped.map((item, i) => (
            <span
              key={`${item.id}-${i}`}
              className="flex items-center gap-10 text-sm text-neutral-200"
            >
              {item.linkUrl ? (
                <Link
                  href={item.linkUrl}
                  className="transition-colors hover:text-gold"
                >
                  {item.text}
                </Link>
              ) : (
                item.text
              )}
              <span className="text-gold">&#9679;</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
