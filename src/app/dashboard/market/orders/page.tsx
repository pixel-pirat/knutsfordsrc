import Link from "next/link";
import { ArrowRight, ClipboardList, Store } from "lucide-react";
import { CartLink } from "@/components/market/CartLink";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
} from "@/components/market/OrderStatusBadges";
import { getBuyerOrders } from "@/db/orderQueries";
import { getCurrentStudent } from "@/db/queries";
import { formatMarketplaceDate } from "@/lib/marketplace";
import { formatCurrency } from "@/lib/permits";

export const dynamic = "force-dynamic";

export default async function DashboardOrdersPage() {
  const student = await getCurrentStudent();
  if (!student) return null;

  const orders = await getBuyerOrders(student.id);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
            My orders
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Track orders placed with Knutsford student stores.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/market"
            className="inline-flex h-9 items-center rounded-lg border border-black/10 px-3 text-sm font-semibold text-neutral-600 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
          >
            Browse marketplace
          </Link>
          <CartLink className="border border-black/10 dark:border-white/10" />
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-16 text-center ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold/15 text-gold-dark dark:text-gold-light">
            <ClipboardList className="h-7 w-7" />
          </div>
          <h2 className="mt-4 text-lg font-extrabold text-ink dark:text-neutral-100">
            No orders yet
          </h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-neutral-500 dark:text-neutral-400">
            When you check out from a student store, your orders will appear
            here.
          </p>
          <Link
            href="/dashboard/market"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white dark:bg-gold dark:text-ink"
          >
            Start shopping
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/dashboard/market/orders/${order.orderNumber}`}
              className="block rounded-2xl bg-white p-5 ring-1 ring-black/5 transition-shadow hover:shadow-md dark:bg-neutral-900 dark:ring-white/10"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-extrabold text-ink dark:text-neutral-100">
                      {order.orderNumber}
                    </p>
                    <OrderStatusBadge status={order.status} />
                    <PaymentStatusBadge
                      paymentStatus={order.paymentStatus}
                    />
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500 dark:text-neutral-400">
                    <Store className="h-4 w-4 shrink-0" />
                    <span className="truncate">{order.storeName}</span>
                  </p>
                  <p className="mt-1 text-xs text-neutral-400 dark:text-neutral-500">
                    {formatMarketplaceDate(order.createdAt)} · {order.itemCount}{" "}
                    item{order.itemCount === 1 ? "" : "s"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-extrabold text-ink dark:text-neutral-100">
                    {formatCurrency(order.subtotal)}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-gold-dark dark:text-gold-light">
                    View order
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
