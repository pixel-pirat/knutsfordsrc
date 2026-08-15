import { NextResponse } from "next/server";
import { adminCreateSchema } from "@/lib/validation";
import { requireAdmin, requireSuperAdmin } from "@/lib/adminGuard";
import { hashPassword } from "@/lib/crypto";
import { PERMISSION_KEYS } from "@/lib/permissions";
import { createAdmin, getAdminByEmail, listAdmins, logAudit } from "@/db/adminQueries";

export async function GET() {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (!requireSuperAdmin(admin)) {
    return NextResponse.json(
      { error: "Only super admins can manage admin accounts" },
      { status: 403 }
    );
  }

  const admins = await listAdmins();
  return NextResponse.json({
    admins: admins.map((a) => ({
      id: a.id,
      name: a.name,
      email: a.email,
      role: a.role,
      permissions: a.permissions,
      active: a.active,
      createdAt: a.createdAt,
    })),
  });
}

export async function POST(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (!requireSuperAdmin(admin)) {
    return NextResponse.json(
      { error: "Only super admins can create admin accounts" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = adminCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password, permissions } = parsed.data;
  const validPermissions = permissions.filter((p) =>
    (PERMISSION_KEYS as string[]).includes(p)
  );

  const existing = await getAdminByEmail(email);
  if (existing) {
    return NextResponse.json(
      { error: "An admin with this email already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);
  const [created] = await createAdmin({
    name,
    email,
    passwordHash,
    role: "admin",
    permissions: validPermissions,
    createdBy: admin.id,
  });

  await logAudit({
    actorId: admin.id,
    action: "admin.create",
    targetType: "admin_user",
    targetId: created.id,
    metadata: { email: created.email, permissions: validPermissions },
  });

  return NextResponse.json({
    admin: {
      id: created.id,
      name: created.name,
      email: created.email,
      role: created.role,
      permissions: created.permissions,
      active: created.active,
    },
  });
}
