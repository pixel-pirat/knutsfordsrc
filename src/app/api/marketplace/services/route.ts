import { NextResponse } from "next/server";
import { canManageStore, getSellerContext } from "@/lib/sellerGuard";
import { createService, listStoreServices } from "@/db/listingQueries";
import { serviceListingSchema } from "@/lib/validation";

export async function GET() {
  const { student, store } = await getSellerContext();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const services = await listStoreServices(store.id);
  return NextResponse.json({ services });
}

export async function POST(request: Request) {
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

  const body = await request.json().catch(() => null);
  const parsed = serviceListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const [service] = await createService(store.id, {
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
  });

  return NextResponse.json({ service }, { status: 201 });
}
