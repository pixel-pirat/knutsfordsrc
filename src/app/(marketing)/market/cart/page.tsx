import type { Metadata } from "next";
import { CartPage } from "@/components/market/CartPage";

export const metadata: Metadata = {
  title: "Your Cart | Knutsford Marketplace",
  description: "Review items in your Knutsford Marketplace cart.",
};

export default function MarketCartPage() {
  return (
    <section className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <CartPage />
      </div>
    </section>
  );
}
