import { NextResponse } from "next/server";
import { canManageStore, getSellerContext } from "@/lib/sellerGuard";
import {
  createProduct,
  listStoreProducts,
} from "@/db/listingQueries";
import { productListingSchema } from "@/lib/validation";

export async function GET() {
  const { student, store } = await getSellerContext();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const products = await listStoreProducts(store.id);
  return NextResponse.json({ products });
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
  const parsed = productListingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const [product] = await createProduct(store.id, {
    name: data.name,
    description: data.description,
    category: data.category,
    imageUrl: data.imageUrl || null,
    price: data.price.toFixed(2),
    discountPrice:
      data.discountPrice == null ? null : data.discountPrice.toFixed(2),
    stockQuantity: data.stockQuantity,
    lowStockThreshold: data.lowStockThreshold,
    availability: data.availability,
    fulfilmentMethods: data.fulfilmentMethods,
    published: data.published,
  });

  return NextResponse.json({ product }, { status: 201 });
}
