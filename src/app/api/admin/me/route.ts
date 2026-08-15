import { NextResponse } from "next/server";
import { getCurrentAdmin, updateAdmin, logAudit } from "@/db/adminQueries";
import { adminProfileUpdateSchema, avatarUpdateSchema } from "@/lib/validation";
import { z } from "zod";

export async function GET() {
  const admin = await getCurrentAdmin();

  if (!admin) {
    return NextResponse.json({ admin: null });
  }

  return NextResponse.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      avatarUrl: admin.avatarUrl,
    },
  });
}

const patchSchema = z.union([adminProfileUpdateSchema, avatarUpdateSchema]);

export async function PATCH(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [updated] = await updateAdmin(admin.id, parsed.data);

  await logAudit({
    actorId: admin.id,
    action: "admin.update_profile",
    targetType: "admin_user",
    targetId: admin.id,
    metadata: parsed.data,
  });

  return NextResponse.json({
    admin: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      permissions: updated.permissions,
      avatarUrl: updated.avatarUrl,
    },
  });
}
