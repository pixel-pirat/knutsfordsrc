import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, createSession } from "@/lib/auth";
import { getStudentByIndexNumber } from "@/db/queries";
import {
  checkLoginRateLimit,
  recordLoginAttempt,
  getClientIp,
  formatRetryAfter,
} from "@/lib/rateLimit";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { indexNumber, password } = parsed.data;
  const ip = getClientIp(request);
  const identifier = indexNumber.toLowerCase();

  const rateLimit = await checkLoginRateLimit("student", identifier, ip);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: `Too many login attempts. Try again in ${formatRetryAfter(rateLimit.retryAfterSeconds)}.` },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const student = await getStudentByIndexNumber(indexNumber);
  const invalidResponse = NextResponse.json(
    { error: "Invalid index number or password" },
    { status: 401 }
  );

  if (!student) {
    await recordLoginAttempt("student", identifier, ip, false);
    return invalidResponse;
  }

  if (!student.passwordHash) {
    await recordLoginAttempt("student", identifier, ip, false);
    return NextResponse.json(
      {
        error:
          "This account hasn't been activated yet. Contact SRC staff to set up your password.",
      },
      { status: 403 }
    );
  }

  const valid = await verifyPassword(password, student.passwordHash);
  if (!valid) {
    await recordLoginAttempt("student", identifier, ip, false);
    return invalidResponse;
  }

  await recordLoginAttempt("student", identifier, ip, true);
  await createSession({ studentId: student.id });

  return NextResponse.json({
    student: {
      id: student.id,
      indexNumber: student.indexNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      profileCompleted: student.profileCompleted,
    },
  });
}
