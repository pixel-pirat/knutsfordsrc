import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/db/queries";
import {
  createMarketplaceOrders,
  MarketplaceCheckoutError,
} from "@/db/orderQueries";
import { marketplaceCheckoutSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = marketplaceCheckoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  try {
    const checkout = await createMarketplaceOrders({
      student: {
        id: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
      },
      phone: parsed.data.phone,
      email: parsed.data.email || null,
      items: parsed.data.items,
      stores: parsed.data.stores.map((store) => ({
        storeId: store.storeId,
        fulfilmentMethod: store.fulfilmentMethod,
        deliveryAddress: store.deliveryAddress || null,
        note: store.note || null,
      })),
    });

    return NextResponse.json(checkout, { status: 201 });
  } catch (error) {
    if (error instanceof MarketplaceCheckoutError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error("Marketplace checkout failed", error);
    return NextResponse.json(
      { error: "We could not place your order. Please try again." },
      { status: 500 }
    );
  }
}
