import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/db/queries";
import { getBuyerOrderByNumber } from "@/db/orderQueries";
import {
  OrderActionError,
  submitBuyerPayment,
} from "@/db/orderMutations";
import { buyerPaymentSubmissionSchema } from "@/lib/validation";
import { notifySellerPaymentSubmitted } from "@/lib/orderNotifications";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ orderNumber: string }> }
) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { orderNumber } = await params;
  const order = await getBuyerOrderByNumber(student.id, orderNumber);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = buyerPaymentSubmissionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  try {
    await submitBuyerPayment({
      orderId: order.id,
      buyer: {
        type: "buyer",
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
      },
      reference: parsed.data.reference,
      note: parsed.data.note?.trim() || null,
    });

    await notifySellerPaymentSubmitted(
      order.id,
      parsed.data.note?.trim() || null,
      new URL(request.url).origin
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof OrderActionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Buyer payment submission failed", error);
    return NextResponse.json(
      { error: "Could not submit payment details. Please try again." },
      { status: 500 }
    );
  }
}
