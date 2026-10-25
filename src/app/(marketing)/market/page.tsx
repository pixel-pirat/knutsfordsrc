import type { Metadata } from "next";
import Link from "next/link";
import { PageBanner } from "@/components/PageBanner";
import { MarketplaceCatalog } from "@/components/market/MarketplaceCatalog";
import type { MarketplaceSearchParams } from "@/components/market/MarketplaceCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Marketplace | Knutsford University",
  description:
    "Shop from verified Knutsford student stores. Browse products and services, add to cart and check out with your student account.",
};

export default async function MarketPage({
  searchParams,
}: {
  searchParams: Promise<MarketplaceSearchParams>;
}) {
  const params = await searchParams;

  return (
    <>
      <PageBanner
        eyebrow="STUDENT MARKETPLACE"
        title="Buy, Sell and Trade With Fellow Students"
        description="Shop products and services from verified Knutsford student stores — with campus pickup, delivery and direct seller support."
        image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=2000&q=80"
        imageAlt="Overhead view of a study workspace with laptops"
      />

      <section className="bg-neutral-50 dark:bg-neutral-950">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
          <MarketplaceCatalog searchParams={params} basePath="/market" />

          <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
            <div>
              <p className="text-sm font-bold text-ink dark:text-neutral-100">
                Want to sell on campus?
              </p>
              <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
                Apply for a student store, get verified by the SRC and start
                listing products or services.
              </p>
            </div>
            <Link
              href="/dashboard/store"
              className="rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
            >
              Open my store
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
