import type { Metadata } from "next";
import { PageBanner } from "@/components/PageBanner";
import { MarketGrid } from "@/components/MarketGrid";
import { marketProducts, marketCategories } from "@/data/site";

export const metadata: Metadata = {
  title: "Marketplace | Knutsford University",
  description:
    "Buy, sell and trade with verified Knutsford students on the Digital Hub Marketplace.",
};

export default function MarketPage() {
  return (
    <>
      <PageBanner
        eyebrow="STUDENT MARKETPLACE"
        title="Buy, Sell and Trade With Fellow Students"
        description="From laptops to textbooks, the Marketplace connects verified Knutsford students directly — no middlemen, no hassle."
        image="https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=2000&q=80"
        imageAlt="Overhead view of a study workspace with laptops"
      />

      <section className="bg-white dark:bg-neutral-900">
        <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
          <MarketGrid products={marketProducts} categories={marketCategories} />
        </div>
      </section>
    </>
  );
}
