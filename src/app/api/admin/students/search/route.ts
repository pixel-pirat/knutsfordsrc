import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminGuard";
import { searchStudents } from "@/db/adminQueries";

export async function GET(request: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") ?? "").trim();

  if (q.length < 2) {
    return NextResponse.json({ students: [] });
  }

  const students = await searchStudents(q, { limit: 8 });

  return NextResponse.json({
    students: students.map((s) => ({
      id: s.id,
      indexNumber: s.indexNumber,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      program: s.program,
      level: s.level,
      studyMode: s.studyMode,
    })),
  });
}
