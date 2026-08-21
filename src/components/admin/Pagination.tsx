import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  total,
  basePath,
  searchParams,
}: {
  page: number;
  totalPages: number;
  total: number;
  basePath: string;
  searchParams?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function hrefFor(p: number) {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams ?? {})) {
      if (v) params.set(k, v);
    }
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 px-1 py-3">
      <p className="text-xs text-neutral-400">
        Page {page} of {totalPages} &middot; {total} total
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(page - 1)}
          aria-disabled={prevDisabled}
          tabIndex={prevDisabled ? -1 : undefined}
          className={`rounded-md border border-black/10 px-3 py-1.5 text-xs font-semibold ${
            prevDisabled
              ? "pointer-events-none opacity-40"
              : "text-ink transition-colors hover:bg-black/5"
          }`}
        >
          Previous
        </Link>
        <Link
          href={hrefFor(page + 1)}
          aria-disabled={nextDisabled}
          tabIndex={nextDisabled ? -1 : undefined}
          className={`rounded-md border border-black/10 px-3 py-1.5 text-xs font-semibold ${
            nextDisabled
              ? "pointer-events-none opacity-40"
              : "text-ink transition-colors hover:bg-black/5"
          }`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
