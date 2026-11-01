import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { logAudit } from "@/db/adminQueries";
import { getAdminOrderByNumber } from "@/db/orderQueries";
import {
  OrderActionError,
  updateOrderPayment,
  updateOrderStatus,
} from "@/db/orderMutations";
import { marketplaceOrderActionSchema } from "@/lib/validation";
import { notifyBuyerOrderUpdate } from "@/lib/orderNotifications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const { admin, error } = await requireAdmin("manage_market");
  if (error) return error;

  const { orderNumber } = await params;
  const order = await getAdminOrderByNumber(orderNumber);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = marketplaceOrderActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const actor = {
    type: "admin" as const,
    id: admin.id,
    name: admin.name,
  };

  try {
    if (parsed.data.action === "status") {
      const note = parsed.data.note?.trim() || null;
      await updateOrderStatus({
        orderId: order.id,
        fromStatus: order.status,
        toStatus: parsed.data.status,
        actor,
        note,
      });

      await logAudit({
        actorId: admin.id,
        action: "marketplace.order.status_update",
        targetType: "marketplace_order",
        targetId: order.id,
        metadata: {
          orderNumber: order.orderNumber,
          from: order.status,
          to: parsed.data.status,
          note,
        },
      });

      await notifyBuyerOrderUpdate(
        order.id,
        note,
        new URL(request.url).origin
      );

      return NextResponse.json({ ok: true });
    }

    const { paymentStatus, reference } = parsed.data;
    const note =
      parsed.data.note?.trim() ||
      `Payment status changed to ${paymentStatus} by an administrator.`;

    await updateOrderPayment({
      orderId: order.id,
      fromPaymentStatus: order.paymentStatus,
      toPaymentStatus: paymentStatus,
      actor,
      note,
      reference: reference?.trim() || null,
    });

    await logAudit({
      actorId: admin.id,
      action: "marketplace.order.payment_update",
      targetType: "marketplace_order",
      targetId: order.id,
      metadata: {
        orderNumber: order.orderNumber,
        from: order.paymentStatus,
        to: paymentStatus,
        reference: reference?.trim() || null,
        note,
      },
    });

    await notifyBuyerOrderUpdate(order.id, note, new URL(request.url).origin);
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof OrderActionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Admin order update failed", error);
    return NextResponse.json(
      { error: "Could not update this order. Please try again." },
      { status: 500 }
    );
  }
}
