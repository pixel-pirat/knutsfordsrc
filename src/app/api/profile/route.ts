import { NextResponse } from "next/server";
import { profileSchema } from "@/lib/validation";
import { getCurrentStudent, updateStudentProfile } from "@/db/queries";

export async function PATCH(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = profileSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [updated] = await updateStudentProfile(student.id, parsed.data);

  return NextResponse.json({
    student: {
      id: updated.id,
      indexNumber: updated.indexNumber,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.email,
      phone: updated.phone,
      program: updated.program,
      level: updated.level,
      studyMode: updated.studyMode,
      profileCompleted: updated.profileCompleted,
    },
  });
}
