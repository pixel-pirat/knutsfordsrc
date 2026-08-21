import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireSuperAdmin } from "@/lib/adminGuard";
import { PERMISSION_KEYS } from "@/lib/permissions";
import { getAdminById, getAdminByEmail, updateAdmin, logAudit } from "@/db/adminQueries";

const updateSchema = z.object({
  name: z.string().trim().min(1, "Name is required").optional(),
  email: z.email("Enter a valid email").optional(),
  active: z.boolean().optional(),
  permissions: z.array(z.string()).optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  if (!requireSuperAdmin(admin)) {
    return NextResponse.json(
      { error: "Only super admins can manage admin accounts" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const target = await getAdminById(id);
  if (!target) {
    return NextResponse.json({ error: "Admin not found" }, { status: 404 });
  }
  if (target.role === "super_admin") {
    return NextResponse.json(
      { error: "Super admin accounts can't be modified here" },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  if (parsed.data.email !== undefined) {
    const conflict = await getAdminByEmail(parsed.data.email);
    if (conflict && conflict.id !== id) {
      return NextResponse.json(
        { error: "Another admin already uses this email" },
        { status: 409 }
      );
    }
  }

  const values: { name?: string; email?: string; active?: boolean; permissions?: string[] } = {};
  if (parsed.data.name !== undefined) values.name = parsed.data.name;
  if (parsed.data.email !== undefined) values.email = parsed.data.email;
  if (parsed.data.active !== undefined) values.active = parsed.data.active;
  if (parsed.data.permissions !== undefined) {
    values.permissions = parsed.data.permissions.filter((p) =>
      (PERMISSION_KEYS as string[]).includes(p)
    );
  }

  const [updated] = await updateAdmin(id, values);

  await logAudit({
    actorId: admin.id,
    action: "admin.update",
    targetType: "admin_user",
    targetId: id,
    metadata: values,
  });

  return NextResponse.json({
    admin: {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      permissions: updated.permissions,
      active: updated.active,
    },
  });
}
