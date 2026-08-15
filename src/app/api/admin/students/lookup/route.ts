import { NextResponse } from "next/server";
import { indexNumberSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/adminGuard";
import { getStudentByIndexNumber } from "@/db/queries";

export async function GET(request: Request) {
  const { admin, error } = await requireAdmin();
  if (error) return error;
  void admin;

  const { searchParams } = new URL(request.url);
  const parsed = indexNumberSchema.safeParse(searchParams.get("indexNumber"));

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid index number" },
      { status: 400 }
    );
  }

  const student = await getStudentByIndexNumber(parsed.data);

  if (!student) {
    return NextResponse.json({ student: null });
  }

  return NextResponse.json({
    student: {
      id: student.id,
      indexNumber: student.indexNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      program: student.program,
      level: student.level,
      studyMode: student.studyMode,
    },
  });
}
