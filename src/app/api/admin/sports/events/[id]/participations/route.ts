import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { participationStatusUpdateSchema } from "@/lib/validation";
import {
  listParticipationsForEvent,
  setParticipationStatus,
} from "@/db/sportsQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { error } = await requireAdmin("manage_sports");
  if (error) return error;

  const { id } = await params;
  const participations = await listParticipationsForEvent(id);
  return NextResponse.json({ participations });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin("manage_sports");
  if (error) return error;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = participationStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [participation] = await setParticipationStatus(
    parsed.data.participationId,
    parsed.data.status
  );
  if (!participation || participation.eventId !== id) {
    return NextResponse.json(
      { error: "Registration not found" },
      { status: 404 }
    );
  }

  await logAudit({
    actorId: admin.id,
    action: "sport_participation.status",
    targetType: "sport_event",
    targetId: id,
    metadata: {
      participationId: participation.id,
      status: participation.status,
    },
  });

  return NextResponse.json({ participation });
}
