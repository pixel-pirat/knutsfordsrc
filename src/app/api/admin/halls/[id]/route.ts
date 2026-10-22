import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { hallSchema } from "@/lib/validation";
import { deleteHall, getHallById, updateHall } from "@/db/hallQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await params;
  const hall = await getHallById(id);
  if (!hall) {
    return NextResponse.json({ error: "Hall not found" }, { status: 404 });
  }
  return NextResponse.json({ hall });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_halls");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = hallSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [hall] = await updateHall(id, {
    name: parsed.data.name,
    description: parsed.data.description || null,
    wardenName: parsed.data.wardenName || null,
    location: parsed.data.location || null,
    contactEmail: parsed.data.contactEmail || null,
    capacity: parsed.data.capacity ?? null,
    imageUrl: parsed.data.imageUrl || null,
    active: parsed.data.active ?? true,
  });

  if (!hall) {
    return NextResponse.json({ error: "Hall not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "hall.update",
    targetType: "hall",
    targetId: hall.id,
    metadata: { name: hall.name },
  });

  return NextResponse.json({ hall });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_halls");
  if (error) return error;

  const { id } = await params;
  const [deleted] = await deleteHall(id);
  if (!deleted) {
    return NextResponse.json({ error: "Hall not found" }, { status: 404 });
  }

  await logAudit({
    actorId: admin.id,
    action: "hall.delete",
    targetType: "hall",
    targetId: id,
    metadata: { name: deleted.name },
  });

  return NextResponse.json({ success: true });
}
