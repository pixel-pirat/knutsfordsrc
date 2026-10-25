import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { tickerSpeedSchema } from "@/lib/validation";
import { getTickerSpeed, setTickerSpeed } from "@/db/announcementQueries";
import { logAudit } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin("manage_news");
  if (error) return error;

  return NextResponse.json({ speed: await getTickerSpeed() });
}

export async function PATCH(request: Request) {
  const { admin, error } = await requireAdmin("manage_news");
  if (error) return error;

  const body = await request.json().catch(() => null);
  const parsed = tickerSpeedSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Choose a speed between 5 and 120 seconds" },
      { status: 400 }
    );
  }

  await setTickerSpeed(parsed.data.speed);

  await logAudit({
    actorId: admin.id,
    action: "announcement.settings",
    targetType: "announcement",
    metadata: { speed: parsed.data.speed },
  });

  return NextResponse.json({ success: true, speed: parsed.data.speed });
}
