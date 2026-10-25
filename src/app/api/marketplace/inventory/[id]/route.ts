import { NextResponse } from "next/server";
import { canManageStore, getSellerContext } from "@/lib/sellerGuard";
import { getStoreProduct, updateProduct } from "@/db/listingQueries";
import { inventoryUpdateSchema } from "@/lib/validation";

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
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const existing = await getStoreProduct(store.id, id);
  if (!existing) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = inventoryUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const [product] = await updateProduct(id, {
    stockQuantity: parsed.data.stockQuantity,
    lowStockThreshold: parsed.data.lowStockThreshold,
  });

  return NextResponse.json({ product });
}
