import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/crypto";
import { createAdminSession } from "@/lib/adminAuth";
import { getAdminByEmail } from "@/db/adminQueries";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { email, password } = parsed.data;
  const admin = await getAdminByEmail(email);

  const invalidResponse = NextResponse.json(
    { error: "Invalid email or password" },
    { status: 401 }
  );

  if (!admin) return invalidResponse;
  if (!admin.active) {
    return NextResponse.json(
      { error: "This account has been deactivated" },
      { status: 403 }
    );
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) return invalidResponse;

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
