import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  marketplaceOrderItems,
  marketplaceOrders,
  marketplaceStores,
  students,
} from "@/db/schema";
import {
  sendMarketplaceOrderUpdateEmail,
  sendMarketplacePaymentSubmittedEmail,
  sendNewMarketplaceOrderEmail,
} from "./orderEmails";
import { FULFILMENT_LABELS } from "./marketplace";

async function getOrderContact(orderId: string) {
  const [row] = await db
    .select({
      orderNumber: marketplaceOrders.orderNumber,
      storeName: marketplaceStores.name,
      storeContactEmail: marketplaceStores.contactEmail,
      sellerName: sql<string>`${students.firstName} || ' ' || ${students.lastName}`,
      sellerEmail: students.email,
      buyerName: marketplaceOrders.buyerName,
      buyerEmail: marketplaceOrders.buyerEmail,
      buyerNote: marketplaceOrders.buyerNote,
      subtotal: marketplaceOrders.subtotal,
      fulfilmentMethod: marketplaceOrders.fulfilmentMethod,
      status: marketplaceOrders.status,
      paymentStatus: marketplaceOrders.paymentStatus,
      paymentReference: marketplaceOrders.paymentReference,
    })
    .from(marketplaceOrders)
    .innerJoin(
      marketplaceStores,
      eq(marketplaceOrders.storeId, marketplaceStores.id)
    )
    .innerJoin(students, eq(marketplaceStores.studentId, students.id))
    .where(eq(marketplaceOrders.id, orderId));

  return row ?? null;
}

export async function notifyNewMarketplaceOrder(
  orderId: string,
  origin: string
) {
  try {
    const order = await getOrderContact(orderId);
    if (!order) return;

    const email = order.storeContactEmail || order.sellerEmail;
    if (!email) return;

    const [countRow] = await db
      .select({
        count: sql<number>`coalesce(sum(${marketplaceOrderItems.quantity}), 0)::int`,
      })
      .from(marketplaceOrderItems)
      .where(eq(marketplaceOrderItems.orderId, orderId));

    await sendNewMarketplaceOrderEmail({
      to: email,
      name: order.sellerName,
      orderNumber: order.orderNumber,
      storeName: order.storeName,
      buyerName: order.buyerName,
      total: Number(order.subtotal),
      itemCount: countRow?.count ?? 0,
      fulfilment:
        FULFILMENT_LABELS[order.fulfilmentMethod] ?? order.fulfilmentMethod,
      note: order.buyerNote,
      orderUrl: `${origin}/dashboard/store/orders/${order.orderNumber}`,
    });
  } catch (error) {
    console.error("Could not send new marketplace order email", error);
  }
}

export async function notifyBuyerOrderUpdate(
  orderId: string,
  note: string | null | undefined,
  origin: string
) {
  try {
    const order = await getOrderContact(orderId);
    if (!order?.buyerEmail) return;

    await sendMarketplaceOrderUpdateEmail({
      to: order.buyerEmail,
      name: order.buyerName,
      orderNumber: order.orderNumber,
      storeName: order.storeName,
      status: order.status,
      paymentStatus: order.paymentStatus,
      note,
      orderUrl: `${origin}/dashboard/market/orders/${order.orderNumber}`,
    });
  } catch (error) {
    console.error("Could not send marketplace order update email", error);
  }
}

export async function notifySellerPaymentSubmitted(
  orderId: string,
  note: string | null | undefined,
  origin: string
) {
  try {
    const order = await getOrderContact(orderId);
    if (!order) return;

    const email = order.storeContactEmail || order.sellerEmail;
    if (!email) return;

    await sendMarketplacePaymentSubmittedEmail({
      to: email,
      name: order.sellerName,
      orderNumber: order.orderNumber,
      storeName: order.storeName,
      buyerName: order.buyerName,
      reference: order.paymentReference ?? "Not provided",
      note,
      orderUrl: `${origin}/dashboard/store/orders/${order.orderNumber}`,
    });
  } catch (error) {
    console.error("Could not send marketplace payment email", error);
  }
}
