import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "./index";
import {
  marketplaceOrderEvents,
  marketplaceOrderItems,
  marketplaceOrders,
  marketplaceProducts,
} from "./schema";
import { canTransitionOrder } from "@/lib/orderWorkflow";
import type {
  MarketplaceOrderStatus,
  MarketplacePaymentStatus,
} from "@/lib/orderWorkflow";

export type OrderActor = {
  type: "buyer" | "seller" | "admin";
  id: string;
  name: string;
};

export class OrderActionError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "OrderActionError";
    this.status = status;
  }
}

export async function updateOrderStatus({
  orderId,
  fromStatus,
  toStatus,
  actor,
  note,
}: {
  orderId: string;
  fromStatus: string;
  toStatus: MarketplaceOrderStatus;
  actor: OrderActor;
  note?: string | null;
}) {
  if (!canTransitionOrder(fromStatus, toStatus)) {
    throw new OrderActionError(
      `An order that is ${fromStatus} cannot move to ${toStatus}.`,
      409
    );
  }

  const cleanNote = note?.trim() || null;
  if (toStatus === "cancelled" && !cleanNote) {
    throw new OrderActionError("A cancellation reason is required.");
  }

  const now = new Date();
  const [updated] = await db
    .update(marketplaceOrders)
    .set({
      status: toStatus,
      cancelledAt: toStatus === "cancelled" ? now : null,
      cancellationReason: toStatus === "cancelled" ? cleanNote : null,
      updatedAt: now,
    })
    .where(
      and(
        eq(marketplaceOrders.id, orderId),
        eq(
          marketplaceOrders.status,
          fromStatus as MarketplaceOrderStatus
        )
      )
    )
    .returning();

  if (!updated) {
    throw new OrderActionError(
      "This order was updated by someone else. Refresh and try again.",
      409
    );
  }

  if (toStatus === "cancelled") {
    await restockOrder(orderId);
  }

  await db.insert(marketplaceOrderEvents).values({
    orderId,
    actorType: actor.type,
    actorId: actor.id,
    actorName: actor.name,
    eventType: "status_changed",
    status: toStatus,
    paymentStatus: updated.paymentStatus,
    note: cleanNote,
  });

  return updated;
}

async function restockOrder(orderId: string) {
  const items = await db
    .select({
      listingType: marketplaceOrderItems.listingType,
      listingId: marketplaceOrderItems.listingId,
      quantity: marketplaceOrderItems.quantity,
      stockTracked: marketplaceOrderItems.stockTracked,
    })
    .from(marketplaceOrderItems)
    .where(eq(marketplaceOrderItems.orderId, orderId));

  const restockable = items.filter(
    (item) => item.listingType === "product" && item.stockTracked
  );

  await Promise.all(
    restockable.map((item) =>
      db
        .update(marketplaceProducts)
        .set({
          stockQuantity: sql`${marketplaceProducts.stockQuantity} + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(eq(marketplaceProducts.id, item.listingId))
    )
  );
}

const PAYMENT_EVENT_TYPES: Record<MarketplacePaymentStatus, string> = {
  unpaid: "payment_reverted",
  pending_confirmation: "payment_submitted",
  paid: "payment_confirmed",
  refunded: "payment_refunded",
};

export async function updateOrderPayment({
  orderId,
  fromPaymentStatus,
  toPaymentStatus,
  actor,
  note,
  reference,
}: {
  orderId: string;
  fromPaymentStatus: string;
  toPaymentStatus: MarketplacePaymentStatus;
  actor: OrderActor;
  note?: string | null;
  reference?: string | null;
}) {
  if (fromPaymentStatus === "refunded" && toPaymentStatus !== "refunded") {
    throw new OrderActionError("A refunded payment cannot be changed.", 409);
  }
  if (fromPaymentStatus === "paid" && toPaymentStatus === "paid") {
    throw new OrderActionError("This payment is already marked as paid.");
  }

  const cleanNote = note?.trim() || null;
  const cleanReference = reference?.trim() || null;
  const now = new Date();

  const setValues: {
    paymentStatus: MarketplacePaymentStatus;
    paymentReference?: string | null;
    paymentSubmittedAt?: Date;
    paidAt?: Date | null;
    updatedAt: Date;
  } = {
    paymentStatus: toPaymentStatus,
    updatedAt: now,
  };

  if (toPaymentStatus === "pending_confirmation") {
    setValues.paymentSubmittedAt = now;
  }
  if (toPaymentStatus === "paid") {
    setValues.paidAt = now;
  }
  if (toPaymentStatus === "unpaid") {
    setValues.paidAt = null;
  }
  if (cleanReference) {
    setValues.paymentReference = cleanReference;
  }

  const [updated] = await db
    .update(marketplaceOrders)
    .set(setValues)
    .where(
      and(
        eq(marketplaceOrders.id, orderId),
        eq(
          marketplaceOrders.paymentStatus,
          fromPaymentStatus as MarketplacePaymentStatus
        )
      )
    )
    .returning();

  if (!updated) {
    throw new OrderActionError(
      "This payment was updated by someone else. Refresh and try again.",
      409
    );
  }

  await db.insert(marketplaceOrderEvents).values({
    orderId,
    actorType: actor.type,
    actorId: actor.id,
    actorName: actor.name,
    eventType: PAYMENT_EVENT_TYPES[toPaymentStatus],
    status: updated.status,
    paymentStatus: toPaymentStatus,
    note: cleanNote,
  });

  return updated;
}

export async function submitBuyerPayment({
  orderId,
  buyer,
  reference,
  note,
}: {
  orderId: string;
  buyer: OrderActor;
  reference: string;
  note?: string | null;
}) {
  const [order] = await db
    .select({
      status: marketplaceOrders.status,
      paymentStatus: marketplaceOrders.paymentStatus,
    })
    .from(marketplaceOrders)
    .where(eq(marketplaceOrders.id, orderId));

  if (!order) {
    throw new OrderActionError("Order not found", 404);
  }
  if (order.status === "cancelled") {
    throw new OrderActionError("This order has been cancelled.", 409);
  }
  if (order.paymentStatus === "paid") {
    throw new OrderActionError("This order is already marked as paid.", 409);
  }
  if (order.paymentStatus === "refunded") {
    throw new OrderActionError(
      "This order's payment has already been refunded.",
      409
    );
  }

  const now = new Date();
  const cleanNote = note?.trim() || null;
  const [updated] = await db
    .update(marketplaceOrders)
    .set({
      paymentStatus: "pending_confirmation",
      paymentReference: reference.trim(),
      paymentSubmittedAt: now,
      updatedAt: now,
    })
    .where(
      and(
        eq(marketplaceOrders.id, orderId),
        inArray(marketplaceOrders.paymentStatus, [
          "unpaid",
          "pending_confirmation",
        ])
      )
    )
    .returning();

  if (!updated) {
    throw new OrderActionError(
      "This payment was updated by someone else. Refresh and try again.",
      409
    );
  }

  await db.insert(marketplaceOrderEvents).values({
    orderId,
    actorType: buyer.type,
    actorId: buyer.id,
    actorName: buyer.name,
    eventType: "payment_submitted",
    status: updated.status,
    paymentStatus: "pending_confirmation",
    note: cleanNote ?? `Payment reference: ${reference.trim()}`,
  });

  return updated;
}
