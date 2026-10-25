import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { decideApplication, getApplicationDetail } from "@/db/marketplaceQueries";
import { logAudit } from "@/db/adminQueries";
import { marketplaceDecisionSchema } from "@/lib/validation";
import type { ApplicationStatus } from "@/db/marketplaceQueries";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_BY_ACTION: Record<string, ApplicationStatus> = {
  start_review: "under_review",
  request_info: "additional_info_required",
  approve: "approved",
  reject: "rejected",
};

const NOTE_BY_ACTION: Record<string, string> = {
  start_review: "Application marked as under review",
  request_info: "Additional information requested",
  approve: "Application approved",
  reject: "Application rejected",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_market");
  if (error) return error;

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = marketplaceDecisionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const detail = await getApplicationDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 });
  }

  const { action, reason } = parsed.data;
  const trimmedReason = reason?.trim() ?? "";

  if ((action === "request_info" || action === "reject") && !trimmedReason) {
    return NextResponse.json(
      { error: "A reason is required for this decision." },
      { status: 400 }
    );
  }

  const status = STATUS_BY_ACTION[action];
  const application = await decideApplication({
    applicationId: id,
    status,
    adminId: admin.id,
    adminName: admin.name,
    decisionReason: trimmedReason || null,
    adminNotes: parsed.data.adminNotes?.trim() || null,
    note: trimmedReason || NOTE_BY_ACTION[action],
  });

  await logAudit({
    actorId: admin.id,
    action: `marketplace.application.${action}`,
    targetType: "marketplace_application",
    targetId: id,
    metadata: {
      storeName: detail.application.storeName,
      studentId: detail.application.studentId,
      status,
      reason: trimmedReason || null,
    },
  });

  return NextResponse.json({ application });
}
