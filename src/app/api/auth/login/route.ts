import { NextResponse } from "next/server";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, createSession } from "@/lib/auth";
import { getStudentByIndexNumber } from "@/db/queries";

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

  const student = await getStudentByIndexNumber(indexNumber);
  const invalidResponse = NextResponse.json(
    { error: "Invalid index number or password" },
    { status: 401 }
  );

  if (!student) return invalidResponse;

  const valid = await verifyPassword(password, student.passwordHash);
  if (!valid) return invalidResponse;

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
