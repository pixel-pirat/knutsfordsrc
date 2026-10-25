import { NextResponse } from "next/server";
import { canManageStore, getSellerContext } from "@/lib/sellerGuard";
import {
  deleteService,
  getStoreService,
  updateService,
} from "@/db/listingQueries";
import { serviceListingSchema } from "@/lib/validation";
import type { ListingStatus } from "@/db/listingQueries";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { student, store } = await getSellerContext();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  if (!canManageStore(store.status)) {
    return NextResponse.json(
      { error: "This store is not currently editable." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const existing = await getStoreService(store.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = serviceListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const moderationStatus: ListingStatus =
    existing.moderationStatus !== "active" && data.resubmit
      ? "pending_review"
      : existing.moderationStatus;

  const [service] = await updateService(id, {
    name: data.name,
    description: data.description,
    category: data.category,
    imageUrl: data.imageUrl || null,
    price: data.price.toFixed(2),
    pricingUnit: data.pricingUnit || null,
    durationMinutes: data.durationMinutes ?? null,
    availability: data.availability || null,
    bookingRequired: data.bookingRequired,
    deliveryMethod: data.deliveryMethod,
    published: data.published,
    moderationStatus,
    ...(data.resubmit && existing.moderationStatus !== "active"
      ? { moderatedAt: new Date() }
      : {}),
  });

  return NextResponse.json({ service });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { student, store } = await getSellerContext();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  if (!canManageStore(store.status)) {
    return NextResponse.json(
      { error: "This store is not currently editable." },
      { status: 403 }
    );
  }

  const { id } = await params;
  if (!UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  const existing = await getStoreService(store.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  }

  await deleteService(id);
  return NextResponse.json({ ok: true });
}
