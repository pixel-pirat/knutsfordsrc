import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { logAudit } from "@/db/adminQueries";
import { getAdminComplaintByReference } from "@/db/complaintQueries";
import {
  ComplaintActionError,
  addComplaintNote,
  assignComplaint,
  updateComplaintStatus,
} from "@/db/complaintMutations";
import { marketplaceComplaintActionSchema } from "@/lib/validation";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ reference: string }> }
) {
  const { admin, error } = await requireAdmin("manage_market");
  if (error) return error;

  const { reference } = await params;
  const complaint = await getAdminComplaintByReference(reference);
  if (!complaint) {
    return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = marketplaceComplaintActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const actor = { type: "admin" as const, id: admin.id, name: admin.name };

  try {
    if (parsed.data.action === "status") {
      const note = parsed.data.note?.trim() || null;
      await updateComplaintStatus({
        complaintId: complaint.id,
        fromStatus: complaint.status,
        toStatus: parsed.data.status,
        actor,
        note,
      });

      await logAudit({
        actorId: admin.id,
        action: "marketplace.complaint.status_update",
        targetType: "marketplace_complaint",
        targetId: complaint.id,
        metadata: {
          referenceNumber: complaint.referenceNumber,
          from: complaint.status,
          to: parsed.data.status,
          note,
        },
      });

      return NextResponse.json({ ok: true });
    }

    if (parsed.data.action === "assign") {
      await assignComplaint({
        complaintId: complaint.id,
        assign: parsed.data.assign,
        actor,
      });

      await logAudit({
        actorId: admin.id,
        action: parsed.data.assign
          ? "marketplace.complaint.assigned"
          : "marketplace.complaint.unassigned",
        targetType: "marketplace_complaint",
        targetId: complaint.id,
        metadata: { referenceNumber: complaint.referenceNumber },
      });

      return NextResponse.json({ ok: true });
    }

    await addComplaintNote({
      complaintId: complaint.id,
      actor,
      note: parsed.data.note,
    });

    await logAudit({
      actorId: admin.id,
      action: "marketplace.complaint.note",
      targetType: "marketplace_complaint",
      targetId: complaint.id,
      metadata: { referenceNumber: complaint.referenceNumber },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof ComplaintActionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status }
      );
    }
    console.error("Admin complaint update failed", error);
    return NextResponse.json(
      { error: "Could not update this complaint. Please try again." },
      { status: 500 }
    );
  }
}
