import Link from "next/link";
import { Store } from "lucide-react";
import { Pagination } from "@/components/admin/Pagination";
import {
  browseMarketplace,
  type MarketplaceBrowseFilters,
} from "@/db/marketplacePublicQueries";
import type { MarketplaceListingType } from "@/lib/marketplace";
import { MarketplaceListingCard } from "./MarketplaceListingCard";

export type MarketplaceSearchParams = {
  q?: string;
  type?: string;
  category?: string;
  sort?: string;
  page?: string;
  [key: string]: string | undefined;
};

function normalizeFilters(
  params: MarketplaceSearchParams
): MarketplaceBrowseFilters {
  const type: MarketplaceListingType | undefined =
    params.type === "product" || params.type === "service"
      ? params.type
      : undefined;
  const sort =
    params.sort === "price_asc" ||
    params.sort === "price_desc" ||
    params.sort === "name"
      ? params.sort
      : "newest";

  return {
    q: params.q?.trim() || undefined,
    type,
    category: params.category?.trim() || undefined,
    sort,
  };
}

function pageNumber(value: string | undefined) {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? page : 1;
}

export async function MarketplaceCatalog({
  searchParams,
  basePath,
}: {
  searchParams: MarketplaceSearchParams;
  basePath: string;
}) {
  const filters = normalizeFilters(searchParams);
  const result = await browseMarketplace({
    filters,
    page: pageNumber(searchParams.page),
  });

  function filterHref(next: {
    category?: string;
    type?: MarketplaceListingType;
  }) {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (next.type ?? filters.type) {
      params.set("type", next.type ?? filters.type ?? "");
    }
    if (next.category ?? filters.category) {
      params.set("category", next.category ?? filters.category ?? "");
    }
    if (filters.sort && filters.sort !== "newest") {
      params.set("sort", filters.sort);
    }
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  }

  const hasFilters = Boolean(
    filters.q || filters.type || filters.category || filters.sort !== "newest"
  );

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-extrabold text-ink dark:text-neutral-100 sm:text-2xl">
            Browse listings
          </h2>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {result.total} listing{result.total === 1 ? "" : "s"} from verified
            student stores
          </p>
        </div>
        <Link
          href={`${basePath}/stores`}
          className="inline-flex items-center gap-2 rounded-lg border border-black/10 px-4 py-2 text-sm font-semibold text-neutral-600 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
        >
          <Store className="h-4 w-4" />
          Browse stores
        </Link>
      </div>

      <form
        method="get"
        action={basePath}
        className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
      >
        <input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search products, services or stores"
          className="h-10 min-w-52 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-sm text-ink outline-none placeholder:text-neutral-400 focus:border-gold dark:border-white/10 dark:text-neutral-100"
        />
        <select
          name="type"
          defaultValue={filters.type ?? ""}
          className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="">All types</option>
          <option value="product">Products</option>
          <option value="service">Services</option>
        </select>
        <select
          name="category"
          defaultValue={filters.category ?? ""}
          className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="">All categories</option>
          {result.categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select
          name="sort"
          defaultValue={filters.sort ?? "newest"}
          className="h-10 rounded-lg border border-black/10 bg-white px-3 text-sm text-ink outline-none focus:border-gold dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-100"
        >
          <option value="newest">Newest first</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
          <option value="name">Name A-Z</option>
        </select>
        <button
          type="submit"
          className="h-10 rounded-lg bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          Apply
        </button>
        {hasFilters && (
          <Link
            href={basePath}
            className="text-xs font-semibold text-neutral-500 hover:underline dark:text-neutral-400"
          >
            Reset
          </Link>
        )}
      </form>

      {result.categories.length > 0 && (
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          <Link
            href={filterHref({ category: "" })}
            className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !filters.category
                ? "border-gold bg-gold text-ink"
                : "border-black/10 bg-white text-neutral-600 hover:border-gold/50 hover:text-ink dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
            }`}
          >
            All categories
          </Link>
          {result.categories.map((category) => (
            <Link
              key={category}
              href={filterHref({ category })}
              className={`whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                filters.category === category
                  ? "border-gold bg-gold text-ink"
                  : "border-black/10 bg-white text-neutral-600 hover:border-gold/50 hover:text-ink dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
              }`}
            >
              {category}
            </Link>
          ))}
        </div>
      )}

      {result.listings.length === 0 ? (
        <div className="mt-8 rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <p className="text-base font-semibold text-ink dark:text-neutral-100">
            No listings match your search.
          </p>
          <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            Try a different keyword, category or listing type.
          </p>
          {hasFilters && (
            <Link
              href={basePath}
              className="mt-5 inline-flex rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white dark:bg-gold dark:text-ink"
            >
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.listings.map((listing) => (
            <MarketplaceListingCard
              key={listing.key}
              listing={listing}
              basePath={basePath}
            />
          ))}
        </div>
      )}

      <div className="mt-6">
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          basePath={basePath}
          searchParams={{
            q: filters.q,
            type: filters.type,
            category: filters.category,
            sort:
              filters.sort && filters.sort !== "newest"
                ? filters.sort
                : undefined,
          }}
        />
      </div>
    </div>
  );
}
