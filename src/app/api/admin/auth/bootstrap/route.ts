import { NextResponse } from "next/server";
import { adminBootstrapSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/crypto";
import { createAdminSession } from "@/lib/adminAuth";
import { countAdmins, createAdmin, logAudit } from "@/db/adminQueries";

export async function GET() {
  const count = await countAdmins();
  return NextResponse.json({ needsBootstrap: count === 0 });
}

export async function POST(request: Request) {
  const count = await countAdmins();
  if (count > 0) {
    return NextResponse.json(
      { error: "Setup has already been completed" },
      { status: 409 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = adminBootstrapSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await hashPassword(password);

  const [admin] = await createAdmin({
    name,
    email,
    passwordHash,
    role: "super_admin",
    permissions: [],
  });

  await logAudit({
    actorId: admin.id,
    action: "admin.bootstrap",
    targetType: "admin_user",
    targetId: admin.id,
    metadata: { email: admin.email },
  });

  await createAdminSession({ adminId: admin.id });

  return NextResponse.json({
    admin: {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
    },
  });
}
