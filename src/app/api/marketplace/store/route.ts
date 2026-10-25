import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/db/queries";
import {
  createStore,
  getApplicationForStudent,
  getStoreForStudent,
  uniqueStoreSlug,
  updateStore,
} from "@/db/marketplaceQueries";
import { marketplaceStoreSchema } from "@/lib/validation";

function clean(value: string | undefined) {
  return value && value.trim().length > 0 ? value.trim() : null;
}

export async function GET() {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [application, store] = await Promise.all([
    getApplicationForStudent(student.id),
    getStoreForStudent(student.id),
  ]);

  return NextResponse.json({ application, store });
}

export async function POST(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const application = await getApplicationForStudent(student.id);
  if (!application || application.status !== "approved") {
    return NextResponse.json(
      { error: "Your seller application must be approved first." },
      { status: 403 }
    );
  }

  const existing = await getStoreForStudent(student.id);
  if (existing) {
    return NextResponse.json(
      { error: "You already have a store." },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = marketplaceStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const [store] = await createStore(student.id, {
    name: data.name,
    slug: await uniqueStoreSlug(data.name),
    description: clean(data.description),
    category: application.category,
    logoUrl: clean(data.logoUrl),
    contactEmail: clean(data.contactEmail),
    contactPhone: clean(data.contactPhone),
    fulfilmentMethods: data.fulfilmentMethods,
    operatingHours: clean(data.operatingHours),
    pickupLocation: clean(data.pickupLocation),
  });

  return NextResponse.json({ store }, { status: 201 });
}

export async function PATCH(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const existing = await getStoreForStudent(student.id);
  if (!existing) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }
  if (existing.status === "suspended" || existing.status === "closed") {
    return NextResponse.json(
      { error: "This store is not currently editable." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = marketplaceStoreSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid request" },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const [store] = await updateStore(existing.id, {
    name: data.name,
    slug: await uniqueStoreSlug(data.name, existing.id),
    description: clean(data.description),
    category: data.category,
    logoUrl: clean(data.logoUrl),
    contactEmail: clean(data.contactEmail),
    contactPhone: clean(data.contactPhone),
    fulfilmentMethods: data.fulfilmentMethods,
    operatingHours: clean(data.operatingHours),
    pickupLocation: clean(data.pickupLocation),
  });

  return NextResponse.json({ store });
}
