import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentStudent } from "@/db/queries";
import { getStoreForStudent } from "@/db/marketplaceQueries";
import { getSellerOrderByNumber } from "@/db/orderQueries";
import { BuyerOrderDetail } from "@/components/market/BuyerOrderDetail";
import { OrderActionsPanel } from "@/components/market/OrderActionsPanel";
import { SellerNav } from "../../SellerNav";

export const dynamic = "force-dynamic";

export default async function SellerOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const student = await getCurrentStudent();
  if (!student) return null;

  const store = await getStoreForStudent(student.id);
  if (!store) redirect("/dashboard/store");

  const { orderNumber } = await params;
  const order = await getSellerOrderByNumber(store.id, orderNumber);
  if (!order) notFound();

  return (
    <div>
      <SellerNav />

      {!store.paymentInstructions && (
        <div className="mb-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:ring-amber-900">
          This store has no payment instructions.{" "}
          <Link
            href="/dashboard/store/settings"
            className="font-semibold underline"
          >
            Add them in settings
          </Link>{" "}
          so future buyers can pay. This order keeps the instructions shown at
          checkout.
        </div>
      )}

      <BuyerOrderDetail
        order={order}
        backHref="/dashboard/store/orders"
        backLabel="Store orders"
        basePath="/market"
        buyerIndexNumber={order.buyerIndexNumber}
        showStoreHelp={false}
        asideExtra={
          <OrderActionsPanel
            orderNumber={order.orderNumber}
            status={order.status}
            paymentStatus={order.paymentStatus}
            paymentReference={order.paymentReference}
            endpoint={`/api/marketplace/seller/orders/${encodeURIComponent(
              order.orderNumber
            )}`}
            mode="seller"
          />
        }
      />
    </div>
  );
}
