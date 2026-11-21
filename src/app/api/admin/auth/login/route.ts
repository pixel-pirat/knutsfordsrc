import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation";
import { verifyPassword } from "@/lib/crypto";
import { createAdminSession } from "@/lib/adminAuth";
import { getAdminByEmail } from "@/db/adminQueries";
import {
  checkLoginRateLimit,
  recordLoginAttempt,
  getClientIp,
  formatRetryAfter,
} from "@/lib/rateLimit";

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
  const ip = getClientIp(request);
  const identifier = email.toLowerCase();

  const rateLimit = await checkLoginRateLimit("admin", identifier, ip);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${formatRetryAfter(rateLimit.retryAfterSeconds)}.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const admin = await getAdminByEmail(email);

  const invalidResponse = NextResponse.json(
    { error: "Invalid email or password" },
    { status: 401 }
  );

  if (!admin) {
    await recordLoginAttempt("admin", identifier, ip, false);
    return invalidResponse;
  }
  if (!admin.active) {
    await recordLoginAttempt("admin", identifier, ip, false);
    return NextResponse.json(
      { error: "This account has been deactivated" },
      { status: 403 }
    );
  }

  const valid = await verifyPassword(password, admin.passwordHash);
  if (!valid) {
    await recordLoginAttempt("admin", identifier, ip, false);
    return invalidResponse;
  }

  await recordLoginAttempt("admin", identifier, ip, true);
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
