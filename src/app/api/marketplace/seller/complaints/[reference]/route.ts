import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/db/queries";
import { getStoreForStudent } from "@/db/marketplaceQueries";
import { getSellerComplaintByReference } from "@/db/complaintQueries";
import {
  ComplaintActionError,
  respondToComplaintAsSeller,
} from "@/db/complaintMutations";
import { marketplaceComplaintSellerResponseSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const store = await getStoreForStudent(student.id);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const { reference } = await params;
  const complaint = await getSellerComplaintByReference(store.id, reference);
  if (!complaint) {
    return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = marketplaceComplaintSellerResponseSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  try {
    await respondToComplaintAsSeller({
      complaintId: complaint.id,
      actor: {
        type: "seller",
        id: student.id,
        name: `${student.firstName} ${student.lastName}`,
      },
      note: parsed.data.note,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ComplaintActionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Seller complaint response failed", error);
    return NextResponse.json(
      { error: "Could not submit your response. Please try again." },
      { status: 500 }
    );
  }
}
