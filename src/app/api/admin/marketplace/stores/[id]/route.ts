import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { getStoreDetail, setStoreStatus } from "@/db/marketplaceQueries";
import { logAudit } from "@/db/adminQueries";
import { marketplaceStoreStatusSchema } from "@/lib/validation";
import type { StoreStatus } from "@/db/marketplaceQueries";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_BY_ACTION: Record<string, StoreStatus> = {
  suspend: "suspended",
  reactivate: "active",
  close: "closed",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_market");
  if (error) return error;

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = marketplaceStoreStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const detail = await getStoreDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const { action, reason } = parsed.data;
  const trimmedReason = reason?.trim() ?? "";

  if ((action === "suspend" || action === "close") && !trimmedReason) {
    return NextResponse.json(
      { error: "A reason is required for this action." },
      { status: 400 }
    );
  }

  const status = STATUS_BY_ACTION[action];
  const [store] = await setStoreStatus(
    id,
    status,
    status === "active" ? null : trimmedReason || null
  );

  await logAudit({
    actorId: admin.id,
    action: `marketplace.store.${action}`,
    targetType: "marketplace_store",
    targetId: id,
    metadata: {
      storeName: detail.store.name,
      studentId: detail.store.studentId,
      status,
      reason: trimmedReason || null,
    },
  });

  return NextResponse.json({ store });
}
