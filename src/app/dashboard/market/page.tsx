import Link from "next/link";
import { ClipboardList, ShoppingBag } from "lucide-react";
import { MarketplaceCatalog } from "@/components/market/MarketplaceCatalog";
import type { MarketplaceSearchParams } from "@/components/market/MarketplaceCatalog";
import { CartLink } from "@/components/market/CartLink";

export const dynamic = "force-dynamic";

export default async function DashboardMarketPage({
  searchParams,
}: {
  searchParams: Promise<MarketplaceSearchParams>;
}) {
  const params = await searchParams;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            Marketplace
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Buy, sell and trade with verified Knutsford students
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/market/orders"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 px-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
          >
            <ClipboardList className="h-4 w-4" />
            My orders
          </Link>
          <Link
            href="/dashboard/market/stores"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-black/10 px-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
          >
            <ShoppingBag className="h-4 w-4" />
            Stores
          </Link>
          <CartLink className="border border-black/10 dark:border-white/10" />
        </div>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <div>
          <p className="text-sm font-semibold text-ink dark:text-neutral-100">
            Want to sell on campus?
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Apply for a student store, get verified by the SRC and start
            selling.
          </p>
        </div>
        <Link
          href="/dashboard/store"
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          Open my store
        </Link>
      </div>

      <MarketplaceCatalog
        searchParams={params}
        basePath="/dashboard/market"
      />
    </div>
  );
}
