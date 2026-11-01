import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/db/queries";
import { getBuyerOrderByNumber } from "@/db/orderQueries";
import { createComplaint, hasOpenComplaintForOrder } from "@/db/complaintQueries";
import { marketplaceComplaintFileSchema } from "@/lib/validation";

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
  const parsed = marketplaceComplaintFileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const alreadyOpen = await hasOpenComplaintForOrder(order.id, student.id);
  if (alreadyOpen) {
    return NextResponse.json(
      { error: "You already have an open complaint for this order." },
      { status: 409 }
    );
  }

  const complaint = await createComplaint({
    orderId: order.id,
    storeId: order.storeId,
    complainant: {
      id: student.id,
      name: `${student.firstName} ${student.lastName}`,
      phone: order.buyerPhone,
      email: order.buyerEmail,
    },
    category: parsed.data.category,
    subject: parsed.data.subject,
    description: parsed.data.description,
    evidence: parsed.data.evidence,
  });

  return NextResponse.json({ ok: true, referenceNumber: complaint.referenceNumber });
}
