import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission } from "@/lib/permissions";
import { AccessRestricted } from "@/components/admin/AccessRestricted";
import { getAdminOrderByNumber } from "@/db/orderQueries";
import { BuyerOrderDetail } from "@/components/market/BuyerOrderDetail";
import { OrderActionsPanel } from "@/components/market/OrderActionsPanel";
import { Badge } from "@/components/ui/badge";
import {
  STORE_STATUS_LABELS,
  STORE_STATUS_STYLES,
} from "@/lib/marketplace";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin || !hasPermission(admin, "manage_market")) {
    return <AccessRestricted />;
  }

  const { orderNumber } = await params;
  const order = await getAdminOrderByNumber(orderNumber);
  if (!order) notFound();

  return (
    <BuyerOrderDetail
      order={order}
      backHref="/admin/market/orders"
      backLabel="Orders & Transactions"
      basePath="/market"
      buyerIndexNumber={order.buyerIndexNumber}
      showStoreHelp={false}
      sellerMeta={
        <section className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-4 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400 dark:text-neutral-500">
              Seller
            </p>
            <p className="mt-1 text-sm font-semibold text-ink dark:text-neutral-100">
              {order.sellerName} · {order.sellerIndexNumber}
            </p>
            <Link
              href={`/admin/market/stores/${order.storeId}`}
              className="text-xs font-semibold text-gold-dark hover:underline dark:text-gold-light"
            >
              View store record
            </Link>
          </div>
          <Badge
            variant="outline"
            className={STORE_STATUS_STYLES[order.storeStatus]}
          >
            {STORE_STATUS_LABELS[order.storeStatus] ?? order.storeStatus}
          </Badge>
        </section>
      }
      asideExtra={
        <OrderActionsPanel
          orderNumber={order.orderNumber}
          status={order.status}
          paymentStatus={order.paymentStatus}
          paymentReference={order.paymentReference}
          endpoint={`/api/admin/marketplace/orders/${encodeURIComponent(
            order.orderNumber
          )}`}
          mode="admin"
        />
      }
    />
  );
}
