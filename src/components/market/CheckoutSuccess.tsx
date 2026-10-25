import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  ShoppingBag,
} from "lucide-react";
import type { BuyerOrderDetail } from "@/lib/marketplace";
import { formatCurrency } from "@/lib/permits";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadges";

export function CheckoutSuccess({
  orders,
}: {
  orders: BuyerOrderDetail[];
}) {
  const total = orders.reduce((sum, order) => sum + order.subtotal, 0);

  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-extrabold text-ink dark:text-neutral-100 sm:text-3xl">
          Order placed
        </h1>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          Your cart was split into {orders.length} store order
          {orders.length === 1 ? "" : "s"}. Each seller will confirm payment and
          fulfilment directly with you.
        </p>
        <p className="mt-3 text-lg font-extrabold text-ink dark:text-neutral-100">
          {formatCurrency(total)}
        </p>
      </div>

      <div className="mt-8 space-y-4">
        {orders.map((order) => (
          <article
            key={order.id}
            className="rounded-2xl bg-white p-5 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
                  {order.storeName}
                </p>
                <p className="mt-1 text-lg font-extrabold text-ink dark:text-neutral-100">
                  {order.orderNumber}
                </p>
                <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
                  {order.itemCount} item{order.itemCount === 1 ? "" : "s"} ·{" "}
                  {formatCurrency(order.subtotal)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge paymentStatus={order.paymentStatus} />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {order.items.slice(0, 4).map((item) => (
                <span
                  key={item.id}
                  className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
                  title={item.name}
                >
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <ShoppingBag className="h-5 w-5 text-neutral-300 dark:text-neutral-600" />
                  )}
                </span>
              ))}
              {order.items.length > 4 && (
                <span className="flex h-12 min-w-12 items-center justify-center rounded-lg bg-neutral-100 px-2 text-xs font-semibold text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  +{order.items.length - 4}
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4 dark:border-white/10">
              <Link
                href={`/market/orders/${order.orderNumber}`}
                className="text-sm font-semibold text-gold-dark hover:underline dark:text-gold-light"
              >
                View order details
              </Link>
              <span className="text-xs text-neutral-400 dark:text-neutral-500">
                Payment pending
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex items-start gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900">
        <CreditCard className="mt-0.5 h-4 w-4 shrink-0" />
        <p>
          Each seller will contact you with manual payment instructions. You
          can track all of your orders from your dashboard.
        </p>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/dashboard/market/orders"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-ink px-5 text-sm font-semibold text-white transition-colors hover:bg-ink/90 dark:bg-gold dark:text-ink dark:hover:bg-gold/90"
        >
          View my orders
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href="/market"
          className="inline-flex h-10 items-center justify-center rounded-lg border border-black/10 px-5 text-sm font-semibold text-neutral-600 transition-colors hover:bg-black/[0.03] dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/[0.05]"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
