import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CheckoutSuccess } from "@/components/market/CheckoutSuccess";
import { getBuyerOrdersByGroup } from "@/db/orderQueries";
import { getCurrentStudent } from "@/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Order Confirmed | Knutsford Marketplace",
  robots: { index: false },
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string }>;
}) {
  const { group } = await searchParams;
  const student = await getCurrentStudent();
  if (!student) {
    const next = group
      ? `/market/checkout/success?group=${encodeURIComponent(group)}`
      : "/market/checkout";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (!group || !UUID_PATTERN.test(group)) notFound();

  const orders = await getBuyerOrdersByGroup(student.id, group);
  if (orders.length === 0) notFound();

  return (
    <section className="bg-neutral-50 dark:bg-neutral-950">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8 lg:py-16">
        <CheckoutSuccess orders={orders} />
      </div>
    </section>
  );
}
