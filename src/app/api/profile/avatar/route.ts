import { NextResponse } from "next/server";
import { avatarUpdateSchema } from "@/lib/validation";
import { getCurrentStudent, updateStudentAvatar } from "@/db/queries";

export async function PATCH(request: Request) {
  const student = await getCurrentStudent();
  if (!student) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = avatarUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const [updated] = await updateStudentAvatar(student.id, parsed.data.avatarUrl);

  return NextResponse.json({ avatarUrl: updated.avatarUrl });
}
