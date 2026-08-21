import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getPermitById } from "@/db/adminQueries";
import { getPermitStatus } from "@/lib/permits";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("view_permits");
  if (error) return error;

  const { id } = await params;
  const permit = await getPermitById(id);
  if (!permit) {
    return NextResponse.json({ error: "Permit not found" }, { status: 404 });
  }

  return NextResponse.json({
    permit: {
      id: permit.id,
      referenceNumber: permit.referenceNumber,
      amount: permit.amount,
      paymentMethod: permit.paymentMethod,
      paymentStatus: permit.paymentStatus,
      cardStatus: permit.cardStatus,
      status: getPermitStatus(permit),
      issuedAt: permit.issuedAt,
      expiresAt: permit.expiresAt,
      emailSentAt: permit.emailSentAt,
      issuer: permit.issuer,
      student: {
        id: permit.student.id,
        indexNumber: permit.student.indexNumber,
        firstName: permit.student.firstName,
        lastName: permit.student.lastName,
        email: permit.student.email,
        phone: permit.student.phone,
      },
    },
  });
}
