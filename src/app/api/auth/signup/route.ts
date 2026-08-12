import { NextResponse } from "next/server";
import { signupSchema } from "@/lib/validation";
import { hashPassword, createSession } from "@/lib/auth";
import { createStudent, getStudentByIndexNumber } from "@/db/queries";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { indexNumber, firstName, lastName, password } = parsed.data;

  const existing = await getStudentByIndexNumber(indexNumber);
  if (existing) {
    return NextResponse.json(
      { error: "An account with this index number already exists" },
      { status: 409 }
    );
  }

  const passwordHash = await hashPassword(password);

  const [student] = await createStudent({
    indexNumber,
    firstName,
    lastName,
    passwordHash,
  });

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
