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
      <MarketGrid products={marketProducts} categories={marketCategories} />
    </div>
  );
}
