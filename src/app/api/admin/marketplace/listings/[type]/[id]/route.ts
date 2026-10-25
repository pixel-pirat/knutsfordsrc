import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import {
  getListingDetail,
  moderateProduct,
  moderateService,
  type ListingStatus,
  type ListingType,
} from "@/db/listingQueries";
import { logAudit } from "@/db/adminQueries";
import { listingModerationSchema } from "@/lib/validation";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const STATUS_BY_ACTION: Record<string, ListingStatus> = {
  flag: "pending_review",
  remove: "removed",
  restore: "active",
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_market");
  if (error) return error;

  const { type, id } = await params;
  if (type !== "product" && type !== "service") {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const detail = await getListingDetail(type as ListingType, id);
  if (!detail) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = listingModerationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const { action } = parsed.data;
  const reason = parsed.data.reason?.trim() ?? "";
  if ((action === "flag" || action === "remove") && !reason) {
    return NextResponse.json(
      { error: "A reason is required for this action." },
      { status: 400 }
    );
  }

  const status = STATUS_BY_ACTION[action];
  const values = {
    status,
    reason: action === "restore" ? null : reason,
    adminId: admin.id,
  };

  const [listing] =
    type === "product"
      ? await moderateProduct(id, values)
      : await moderateService(id, values);

  await logAudit({
    actorId: admin.id,
    action: `marketplace.listing.${action}`,
    targetType: `marketplace_${type}`,
    targetId: id,
    metadata: {
      name: detail.listing.name,
      storeName: detail.store.name,
      status,
      reason: action === "restore" ? null : reason,
    },
  });

  return NextResponse.json({ listing });
}
