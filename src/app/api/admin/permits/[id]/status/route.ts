import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/adminGuard";
import { getPermitById, updatePermitCardStatus, logAudit } from "@/db/adminQueries";
import { getPermitStatus } from "@/lib/permits";

const bodySchema = z.object({
  cardStatus: z.enum(["pending", "active"]),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("issue_permit");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const existing = await getPermitById(id);
  if (!existing) {
    return NextResponse.json({ error: "Permit not found" }, { status: 404 });
  }
  if (getPermitStatus(existing) === "expired") {
    return NextResponse.json(
      { error: "This permit has expired and can no longer be updated" },
      { status: 400 }
    );
  }

  const [updated] = await updatePermitCardStatus(id, parsed.data.cardStatus);

  await logAudit({
    actorId: admin.id,
    action: "permit.card_status",
    targetType: "permit",
    targetId: id,
    metadata: {
      referenceNumber: existing.referenceNumber,
      cardStatus: parsed.data.cardStatus,
    },
  });

  return NextResponse.json({
    permit: { id: updated.id, cardStatus: updated.cardStatus },
  });
}
