import { NextResponse } from "next/server";
import { getCurrentStudent } from "@/db/queries";

export async function GET() {
  const student = await getCurrentStudent();

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
      profileCompleted: student.profileCompleted,
    },
  });
}
