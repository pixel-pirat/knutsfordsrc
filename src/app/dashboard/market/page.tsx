import Link from "next/link";
import { MarketGrid } from "@/components/MarketGrid";
import { marketProducts, marketCategories } from "@/data/site";

export default function DashboardMarketPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Marketplace
        </h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Buy, sell and trade with verified Knutsford students
        </p>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
        <div>
          <p className="text-sm font-semibold text-ink dark:text-neutral-100">
            Want to sell on campus?
          </p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Apply for a student store, get verified by the SRC and start selling.
          </p>
        </div>
        <Link
          href="/dashboard/store"
          className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          Open my store
        </Link>
      </div>
      <MarketGrid products={marketProducts} categories={marketCategories} />
    </div>
  );
}
