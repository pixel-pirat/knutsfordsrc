import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BuyerOrderDetail } from "@/components/market/BuyerOrderDetail";
import { getBuyerOrderByNumber } from "@/db/orderQueries";
import { getCurrentStudent } from "@/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Details | Knutsford Marketplace",
  robots: { index: false },
};

export default async function MarketplaceOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const student = await getCurrentStudent();
  if (!student) {
    redirect(
      `/login?next=${encodeURIComponent(`/market/orders/${orderNumber}`)}`
    );
  }

  const order = await getBuyerOrderByNumber(student.id, orderNumber);
  if (!order) notFound();

  return (
    <section className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <BuyerOrderDetail
          order={order}
          backHref="/dashboard/market/orders"
          basePath="/market"
        />
      </div>
    </section>
  );
}
