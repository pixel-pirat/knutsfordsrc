import { NextResponse } from "next/server";
import { requireAdmin, requireSuperAdmin } from "@/lib/adminGuard";
import { programCreateSchema } from "@/lib/validation";
import { listPrograms, createProgram, logAudit } from "@/db/adminQueries";

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  const programs = await listPrograms();
  return NextResponse.json({ programs });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (!requireSuperAdmin(admin)) {
    return NextResponse.json(
      { error: "Only super admins can manage programmes" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = programCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const existing = await listPrograms();
  if (existing.some((p) => p.name.toLowerCase() === parsed.data.name.toLowerCase())) {
    return NextResponse.json(
      { error: "This programme already exists" },
      { status: 409 }
    );
  }

  const [program] = await createProgram(parsed.data.name);

  await logAudit({
    actorId: admin.id,
    action: "program.create",
    targetType: "program",
    targetId: program.id,
    metadata: { name: program.name },
  });

  return NextResponse.json({ program });
}
