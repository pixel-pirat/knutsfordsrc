import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { hallSchema } from "@/lib/validation";
import { createHall, listHallsWithCounts } from "@/db/hallQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const halls = await listHallsWithCounts();
  return NextResponse.json({ halls });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin("manage_halls");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = hallSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  let hall;
  try {
    [hall] = await createHall({
      name: parsed.data.name,
      description: parsed.data.description || null,
      wardenName: parsed.data.wardenName || null,
      location: parsed.data.location || null,
      contactEmail: parsed.data.contactEmail || null,
      capacity: parsed.data.capacity ?? null,
      imageUrl: parsed.data.imageUrl || null,
      active: parsed.data.active ?? true,
      createdBy: admin.id,
    });
  } catch (err) {
    if (err instanceof Error && err.message.includes("unique")) {
      return NextResponse.json(
        { error: "A hall with this name already exists" },
        { status: 409 }
      );
    }
    throw err;
  }

  await logAudit({
    actorId: admin.id,
    action: "hall.create",
    targetType: "hall",
    targetId: hall.id,
    metadata: { name: hall.name },
  });

  return NextResponse.json({ hall });
}
