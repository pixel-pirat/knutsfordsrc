import { notFound } from "next/navigation";
import { BuyerOrderDetail } from "@/components/market/BuyerOrderDetail";
import { getBuyerOrderByNumber } from "@/db/orderQueries";
import { getCurrentStudent } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function DashboardOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const student = await getCurrentStudent();
  if (!student) return null;

  const order = await getBuyerOrderByNumber(student.id, orderNumber);
  if (!order) notFound();

  return (
    <BuyerOrderDetail
      order={order}
      backHref="/dashboard/market/orders"
      basePath="/dashboard/market"
    />
  );
}
