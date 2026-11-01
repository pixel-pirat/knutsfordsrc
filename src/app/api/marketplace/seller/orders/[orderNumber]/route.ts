import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/db/queries";
import { getStoreForStudent } from "@/db/marketplaceQueries";
import {
  getSellerOrderByNumber,
} from "@/db/orderQueries";
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
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const store = await getStoreForStudent(student.id);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const { orderNumber } = await params;
  const order = await getSellerOrderByNumber(store.id, orderNumber);
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
    type: "seller" as const,
    id: student.id,
    name: `${student.firstName} ${student.lastName}`,
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

      await notifyBuyerOrderUpdate(
        order.id,
        note,
        new URL(request.url).origin
      );

      return NextResponse.json({ ok: true });
    }

    const { paymentStatus, reference } = parsed.data;
    if (paymentStatus === "pending_confirmation" || paymentStatus === "refunded") {
      return NextResponse.json(
        { error: "Only an administrator can set that payment status." },
        { status: 403 }
      );
    }
    if (paymentStatus === "paid" && order.paymentStatus === "unpaid") {
      // A seller can confirm a manual payment before the buyer submits a reference.
    } else if (
      paymentStatus === "paid" &&
      order.paymentStatus !== "pending_confirmation"
    ) {
      return NextResponse.json(
        { error: "This payment cannot be confirmed from its current status." },
        { status: 409 }
      );
    }
    if (
      paymentStatus === "unpaid" &&
      order.paymentStatus !== "pending_confirmation"
    ) {
      return NextResponse.json(
        { error: "Only a submitted payment can be marked as not received." },
        { status: 409 }
      );
    }

    const note =
      parsed.data.note?.trim() ||
      (paymentStatus === "paid"
        ? "Payment received and confirmed by the seller."
        : "Payment could not be confirmed by the seller.");

    await updateOrderPayment({
      orderId: order.id,
      fromPaymentStatus: order.paymentStatus,
      toPaymentStatus: paymentStatus,
      actor,
      note,
      reference: reference?.trim() || null,
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
    console.error("Seller order update failed", error);
    return NextResponse.json(
      { error: "Could not update this order. Please try again." },
      { status: 500 }
    );
  }
}
