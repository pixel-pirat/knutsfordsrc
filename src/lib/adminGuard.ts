import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/db/adminQueries";
import { hasPermission, type PermissionKey } from "./permissions";
import type { AdminUser } from "@/db/schema";

export async function requireAdmin(
  permission?: PermissionKey
): Promise<{ admin: AdminUser; error: null } | { admin: null; error: NextResponse }> {
  const admin = await getCurrentAdmin();
  if (!admin) {
    return {
      admin: null,
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }
  if (permission && !hasPermission(admin, permission)) {
    return {
      admin: null,
      error: NextResponse.json(
        { error: "You don't have permission to do this" },
        { status: 403 }
      ),
    };
  }
  return { admin, error: null };
}

export function requireSuperAdmin(admin: AdminUser | null): admin is AdminUser {
  return !!admin && admin.role === "super_admin";
}
